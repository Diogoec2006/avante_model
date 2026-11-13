import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReceivableAccount } from './entities/receivable-account.entity';
import { CreditPayment } from './entities/credit-payment.entity';
import { Customer } from '../sales/entities/customer.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../accounting/entities/journal-entry-line.entity';
import { AccountingAccount } from '../accounting/entities/accounting-account.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ReceivableStatus } from '../../common/enums';

@Injectable()
export class ReceivablesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ReceivableAccount)
    private readonly receivableRepo: Repository<ReceivableAccount>,
    @InjectRepository(CreditPayment)
    private readonly paymentRepo: Repository<CreditPayment>,
  ) {}

  async findAll(status?: ReceivableStatus, customerId?: string): Promise<ReceivableAccount[]> {
    const qb = this.receivableRepo
      .createQueryBuilder('ra')
      .leftJoinAndSelect('ra.customer', 'c')
      .leftJoinAndSelect('ra.invoice', 'inv')
      .leftJoinAndSelect('ra.payments', 'p')
      .orderBy('ra.due_date', 'ASC');

    if (status) {
      qb.andWhere('ra.status = :status', { status });
    }

    if (customerId) {
      qb.andWhere('ra.customer_id = :customerId', { customerId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<ReceivableAccount> {
    const account = await this.receivableRepo.findOne({
      where: { id },
      relations: ['customer', 'invoice', 'payments', 'payments.user'],
    });
    if (!account) {
      throw new NotFoundException('Cuenta por cobrar no encontrada');
    }
    return account;
  }

  async registerPayment(dto: CreatePaymentDto, userId: string): Promise<CreditPayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const account = await queryRunner.manager.findOne(ReceivableAccount, {
        where: { id: dto.receivable_account_id },
        relations: ['customer', 'invoice'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!account) {
        throw new NotFoundException('Cuenta por cobrar no encontrada');
      }

      const currentBalance = Number(account.balance);
      const paymentAmount = Number(dto.amount);

      if (paymentAmount > currentBalance) {
        throw new BadRequestException(
          `El monto del abono ($${paymentAmount.toLocaleString()}) supera el saldo pendiente ($${currentBalance.toLocaleString()})`,
        );
      }

      // 1. Actualizar saldo y estado de la cuenta
      const newBalance = currentBalance - paymentAmount;
      account.balance = newBalance;
      if (newBalance === 0) {
        account.status = ReceivableStatus.PAID;
      } else {
        account.status = ReceivableStatus.PARTIALLY_PAID;
      }
      await queryRunner.manager.save(account);

      // 2. Disminuir la deuda actual del cliente
      const customer = await queryRunner.manager.findOne(Customer, {
        where: { id: account.customer_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (customer) {
        customer.current_debt = Math.max(0, Number(customer.current_debt) - paymentAmount);
        await queryRunner.manager.save(customer);
      }

      // 3. Generar número de recibo de caja
      const count = await queryRunner.manager.count(CreditPayment);
      const receiptNumber = `RC-${String(count + 1).padStart(6, '0')}`;

      // 4. Crear el registro del abono
      const payment = queryRunner.manager.create(CreditPayment, {
        receivable_account_id: account.id,
        user_id: userId,
        receipt_number: receiptNumber,
        amount: paymentAmount,
        payment_method: dto.payment_method,
        notes: dto.notes,
      });
      const savedPayment = await queryRunner.manager.save(payment);

      // 5. Asiento contable de recaudo de cartera
      await this.generatePaymentAccountingEntry(queryRunner, savedPayment, account, userId);

      await queryRunner.commitTransaction();
      return savedPayment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async generatePaymentAccountingEntry(
    queryRunner: any,
    payment: CreditPayment,
    account: ReceivableAccount,
    userId: string,
  ) {
    const cashAccount = await queryRunner.manager.findOne(AccountingAccount, {
      where: { code: '110505' }, // Caja General
    });
    const receivablesAccount = await queryRunner.manager.findOne(AccountingAccount, {
      where: { code: '130505' }, // Clientes Nacionales
    });

    if (cashAccount && receivablesAccount) {
      const count = await queryRunner.manager.count(JournalEntry);
      const entryNumber = `AS-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

      const entry = queryRunner.manager.create(JournalEntry, {
        entry_number: entryNumber,
        entry_date: new Date().toISOString().split('T')[0],
        concept: `Abono a Factura #${account.invoice?.invoice_number || 'N/A'} - Recibo #${payment.receipt_number}`,
        source_module: 'RECEIVABLES',
        source_id: payment.id,
        user_id: userId,
      });

      const savedEntry = await queryRunner.manager.save(entry);

      // DEBE: Caja General (Entra dinero)
      await queryRunner.manager.save(
        queryRunner.manager.create(JournalEntryLine, {
          journal_entry_id: savedEntry.id,
          account_id: cashAccount.id,
          debit: payment.amount,
          credit: 0,
          description: `Recaudo de cartera - Recibo #${payment.receipt_number}`,
        }),
      );

      // HABER: Clientes Nacionales (Se amortiza la deuda)
      await queryRunner.manager.save(
        queryRunner.manager.create(JournalEntryLine, {
          journal_entry_id: savedEntry.id,
          account_id: receivablesAccount.id,
          debit: 0,
          credit: payment.amount,
          description: `Amortización de saldo de cliente: ${account.customer?.name || 'Cliente'}`,
        }),
      );
    }
  }

  async getAgingReport() {
    const accounts = await this.receivableRepo.find({
      where: [
        { status: ReceivableStatus.PENDING },
        { status: ReceivableStatus.PARTIALLY_PAID },
      ],
      relations: ['customer', 'invoice'],
    });

    const now = new Date();
    const buckets = {
      current: 0, // No vencidas
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      moreThan90: 0,
      totalReceivables: 0,
    };

    const detailedAccounts = accounts.map((acc) => {
      const dueDate = new Date(acc.due_date);
      const diffTime = now.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const bal = Number(acc.balance);

      buckets.totalReceivables += bal;

      let bucketName = 'Al día';
      if (diffDays <= 0) {
        buckets.current += bal;
      } else if (diffDays <= 30) {
        buckets.days1_30 += bal;
        bucketName = '1-30 días';
      } else if (diffDays <= 60) {
        buckets.days31_60 += bal;
        bucketName = '31-60 días';
      } else if (diffDays <= 90) {
        buckets.days61_90 += bal;
        bucketName = '61-90 días';
      } else {
        buckets.moreThan90 += bal;
        bucketName = '+90 días';
      }

      return {
        ...acc,
        daysOverdue: Math.max(0, diffDays),
        bucket: bucketName,
      };
    });

    return {
      summary: buckets,
      accounts: detailedAccounts,
    };
  }
}

