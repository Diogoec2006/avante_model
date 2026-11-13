import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AccountingAccount } from './entities/accounting-account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(AccountingAccount)
    private readonly accountRepo: Repository<AccountingAccount>,
    @InjectRepository(JournalEntry)
    private readonly entryRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private readonly lineRepo: Repository<JournalEntryLine>,
  ) {}

  async getChartOfAccounts(): Promise<AccountingAccount[]> {
    return this.accountRepo.find({
      order: { code: 'ASC' },
      relations: ['children'],
    });
  }

  async getJournalEntries(startDate?: string, endDate?: string, sourceModule?: string): Promise<JournalEntry[]> {
    const qb = this.entryRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'lines')
      .leftJoinAndSelect('lines.account', 'account')
      .leftJoinAndSelect('entry.user', 'user')
      .orderBy('entry.created_at', 'DESC');

    if (startDate && endDate) {
      qb.andWhere('entry.entry_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (sourceModule) {
      qb.andWhere('entry.source_module = :sourceModule', { sourceModule });
    }

    return qb.getMany();
  }

  async createManualEntry(dto: CreateJournalEntryDto, userId: string): Promise<JournalEntry> {
    if (!dto.lines || dto.lines.length < 2) {
      throw new BadRequestException('Un asiento contable debe tener mínimo 2 líneas.');
    }

    // Validación de Partida Doble: Suma de Débitos == Suma de Créditos
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of dto.lines) {
      totalDebit += Number(line.debit || 0);
      totalCredit += Number(line.credit || 0);
    }

    const difference = Math.abs(totalDebit - totalCredit);
    if (difference > 0.01) {
      throw new BadRequestException(
        `El asiento contable no está cuadrado (Partida Doble). Débitos: $${totalDebit.toFixed(2)}, Créditos: $${totalCredit.toFixed(2)}, Diferencia: $${difference.toFixed(2)}`,
      );
    }

    const count = await this.entryRepo.count();
    const entryNumber = `AS-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const entry = this.entryRepo.create({
      entry_number: entryNumber,
      entry_date: dto.entry_date || new Date().toISOString().split('T')[0],
      concept: dto.concept,
      source_module: 'MANUAL',
      user_id: userId,
    });

    const savedEntry = await this.entryRepo.save(entry);

    for (const l of dto.lines) {
      const line = this.lineRepo.create({
        journal_entry_id: savedEntry.id,
        account_id: l.account_id,
        debit: l.debit,
        credit: l.credit,
        description: l.description || dto.concept,
      });
      await this.lineRepo.save(line);
    }

    return this.entryRepo.findOne({
      where: { id: savedEntry.id },
      relations: ['lines', 'lines.account', 'user'],
    });
  }

  async getFinancialSummary() {
    // 1. Total ventas (Cuentas 4135)
    const salesLines = await this.lineRepo
      .createQueryBuilder('l')
      .leftJoin('l.account', 'acc')
      .where('acc.code LIKE :code', { code: '4135%' })
      .select('SUM(l.credit) - SUM(l.debit)', 'totalSales')
      .getRawOne();

    // 2. Total saldo en caja (Cuenta 1105)
    const cashLines = await this.lineRepo
      .createQueryBuilder('l')
      .leftJoin('l.account', 'acc')
      .where('acc.code LIKE :code', { code: '1105%' })
      .select('SUM(l.debit) - SUM(l.credit)', 'cashBalance')
      .getRawOne();

    // 3. Total cuentas por cobrar (Cuenta 1305)
    const receivableLines = await this.lineRepo
      .createQueryBuilder('l')
      .leftJoin('l.account', 'acc')
      .where('acc.code LIKE :code', { code: '1305%' })
      .select('SUM(l.debit) - SUM(l.credit)', 'receivablesBalance')
      .getRawOne();

    // 4. Total IVA por pagar (Cuenta 2408)
    const taxLines = await this.lineRepo
      .createQueryBuilder('l')
      .leftJoin('l.account', 'acc')
      .where('acc.code LIKE :code', { code: '2408%' })
      .select('SUM(l.credit) - SUM(l.debit)', 'taxPayable')
      .getRawOne();

    return {
      totalSalesRevenue: Number(salesLines?.totalSales || 0),
      cashInHand: Number(cashLines?.cashBalance || 0),
      accountsReceivable: Number(receivableLines?.receivablesBalance || 0),
      taxPayable: Number(taxLines?.taxPayable || 0),
      asOfDate: new Date().toISOString(),
    };
  }
}

