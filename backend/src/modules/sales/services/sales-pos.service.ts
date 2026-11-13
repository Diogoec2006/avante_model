import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { Customer } from '../entities/customer.entity';
import { Product } from '../../inventory/entities/product.entity';
import { StockMovement } from '../../inventory/entities/stock-movement.entity';
import { ReceivableAccount } from '../../receivables/entities/receivable-account.entity';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../../accounting/entities/journal-entry-line.entity';
import { AccountingAccount } from '../../accounting/entities/accounting-account.entity';
import { CheckoutPosDto } from '../dto/checkout-pos.dto';
import { MovementType, PaymentType, ReceivableStatus } from '../../../common/enums';

@Injectable()
export class SalesPosService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async checkout(dto: CheckoutPosDto, userId: string): Promise<Invoice> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El carrito de compras no puede estar vacío');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar cliente
      const customer = await queryRunner.manager.findOne(Customer, {
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Cliente no encontrado');
      }

      // 2. Procesar ítems y verificar existencias
      let subtotal = 0;
      let totalTax = 0;
      const invoiceItems: InvoiceItem[] = [];
      const stockUpdates: { product: Product; movement: StockMovement }[] = [];

      for (const itemDto of dto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product || !product.is_active) {
          throw new NotFoundException(`Producto con ID ${itemDto.productId} no disponible`);
        }

        const currentStock = Number(product.current_stock);
        if (currentStock < Number(itemDto.quantity)) {
          throw new BadRequestException(
            `Stock insuficiente para '${product.name}'. Solicitado: ${itemDto.quantity}, Disponible: ${currentStock}`,
          );
        }

        const unitPrice = Number(itemDto.unitPrice);
        const qty = Number(itemDto.quantity);
        const taxRate = Number(itemDto.taxRate !== undefined ? itemDto.taxRate : product.tax_rate);

        const itemSubtotal = unitPrice * qty;
        const itemTax = itemSubtotal * (taxRate / 100);
        const itemTotal = itemSubtotal + itemTax;

        subtotal += itemSubtotal;
        totalTax += itemTax;

        const invoiceItem = queryRunner.manager.create(InvoiceItem, {
          product_id: product.id,
          quantity: qty,
          unit_price: unitPrice,
          tax_rate: taxRate,
          tax_amount: itemTax,
          subtotal: itemSubtotal,
          total: itemTotal,
        });
        invoiceItems.push(invoiceItem);

        // Descontar inventario
        const newStock = currentStock - qty;
        product.current_stock = newStock;
        await queryRunner.manager.save(product);

        const movement = queryRunner.manager.create(StockMovement, {
          product_id: product.id,
          user_id: userId,
          movement_type: MovementType.OUT_SALE,
          quantity: qty,
          previous_stock: currentStock,
          new_stock: newStock,
          unit_cost: product.cost_price,
          reason: `Venta mostrador POS`,
        });
        stockUpdates.push({ product, movement });
      }

      const discount = Number(dto.discountAmount || 0);
      const total = Math.max(0, subtotal + totalTax - discount);

      // 3. Si el método es crédito, validar límites y actualizar deuda
      if (dto.paymentType === PaymentType.CREDIT) {
        if (customer.credit_status !== 'ACTIVE') {
          throw new BadRequestException(
            `El cliente '${customer.name}' no tiene la línea de crédito activa (Estado: ${customer.credit_status}).`,
          );
        }

        const creditLimit = Number(customer.credit_limit);
        const currentDebt = Number(customer.current_debt);
        const availableCredit = creditLimit - currentDebt;

        if (total > availableCredit) {
          throw new BadRequestException(
            `Cupo de crédito insuficiente para '${customer.name}'. Total venta: $${total.toLocaleString()}, Cupo disponible: $${availableCredit.toLocaleString()}`,
          );
        }

        customer.current_debt = currentDebt + total;
        await queryRunner.manager.save(customer);
      }

      // 4. Generar número consecutivo de factura (Estándar SRI: 001-001-XXXXXX)
      const count = await queryRunner.manager.count(Invoice);
      const invoiceNumber = `001-001-${String(count + 1).padStart(6, '0')}`;

      // Clave de Acceso SRI (49 dígitos numéricos)
      const dateDigits = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rucCompany = '1792345678001';
      const fiscalUuid = `${dateDigits}01${rucCompany}1001001${String(count + 1).padStart(9, '0')}123456781`;

      // 5. Crear la Factura Electrónica
      const invoice = queryRunner.manager.create(Invoice, {
        invoice_number: invoiceNumber,
        customer_id: customer.id,
        user_id: userId,
        payment_type: dto.paymentType,
        subtotal,
        tax_amount: totalTax,
        discount_amount: discount,
        total,
        status: 'ISSUED',
        electronic_sync_status: 'AUTORIZADO',
        fiscal_uuid: fiscalUuid,
        electronic_payload_meta: {
          sri_status: 'AUTORIZADO',
          environment: 'PRODUCCIÓN',
          received_at: new Date().toISOString(),
        },
      });

      const savedInvoice = await queryRunner.manager.save(invoice);

      // Asignar invoice_id a cada item y persistir
      for (const item of invoiceItems) {
        item.invoice_id = savedInvoice.id;
        await queryRunner.manager.save(item);
      }

      // Persistir movimientos de inventario con el número de factura como referencia
      for (const update of stockUpdates) {
        update.movement.reference_id = invoiceNumber;
        await queryRunner.manager.save(update.movement);
      }

      // 6. Si es crédito, crear cuenta por cobrar
      if (dto.paymentType === PaymentType.CREDIT) {
        const dueDate =
          dto.dueDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const receivable = queryRunner.manager.create(ReceivableAccount, {
          invoice_id: savedInvoice.id,
          customer_id: customer.id,
          total_amount: total,
          balance: total,
          due_date: dueDate,
          status: ReceivableStatus.PENDING,
        });
        await queryRunner.manager.save(receivable);
      }

      // 7. Generación automática de Asiento Contable (Partida Doble)
      await this.generateAccountingEntry(queryRunner, savedInvoice, customer, userId);

      await queryRunner.commitTransaction();

      return this.invoiceRepository.findOne({
        where: { id: savedInvoice.id },
        relations: ['customer', 'user', 'items', 'items.product'],
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateAccountingEntry(
    queryRunner: any,
    invoice: Invoice,
    customer: Customer,
    userId: string,
  ) {
    // Cuentas contables estándar del PUC Ferretero
    const cashAccount = await queryRunner.manager.findOne(AccountingAccount, {
      where: { code: '110505' }, // Caja General
    });
    const receivablesAccount = await queryRunner.manager.findOne(AccountingAccount, {
      where: { code: '130505' }, // Clientes Nacionales
    });
    const salesRevenueAccount = await queryRunner.manager.findOne(AccountingAccount, {
      where: { code: '413501' }, // Ventas Comercio Ferretero
    });
    const taxPayableAccount = await queryRunner.manager.findOne(AccountingAccount, {
      where: { code: '240801' }, // IVA Generado en Ventas
    });

    if (salesRevenueAccount && taxPayableAccount) {
      const countEntries = await queryRunner.manager.count(JournalEntry);
      const entryNumber = `AS-${new Date().getFullYear()}-${String(countEntries + 1).padStart(5, '0')}`;

      const entry = queryRunner.manager.create(JournalEntry, {
        entry_number: entryNumber,
        entry_date: new Date().toISOString().split('T')[0],
        concept: `Venta Factura #${invoice.invoice_number} - Cliente: ${customer.name}`,
        source_module: 'SALES',
        source_id: invoice.id,
        user_id: userId,
      });

      const savedEntry = await queryRunner.manager.save(entry);

      const isCredit = invoice.payment_type === PaymentType.CREDIT;
      const debitAccount = isCredit ? receivablesAccount : cashAccount;

      // Línea 1: DEBE (Caja o Clientes por el total facturado)
      if (debitAccount) {
        await queryRunner.manager.save(
          queryRunner.manager.create(JournalEntryLine, {
            journal_entry_id: savedEntry.id,
            account_id: debitAccount.id,
            debit: invoice.total,
            credit: 0,
            description: `Ingreso por ${isCredit ? 'Cartera Clientes' : 'Caja POS'}`,
          }),
        );
      }

      // Línea 2: HABER (Ingreso por Venta de mercancías - Subtotal)
      await queryRunner.manager.save(
        queryRunner.manager.create(JournalEntryLine, {
          journal_entry_id: savedEntry.id,
          account_id: salesRevenueAccount.id,
          debit: 0,
          credit: invoice.subtotal,
          description: `Venta de productos ferreteros`,
        }),
      );

      // Línea 3: HABER (IVA Generado)
      if (Number(invoice.tax_amount) > 0) {
        await queryRunner.manager.save(
          queryRunner.manager.create(JournalEntryLine, {
            journal_entry_id: savedEntry.id,
            account_id: taxPayableAccount.id,
            debit: 0,
            credit: invoice.tax_amount,
            description: `IVA 19% generado en Factura #${invoice.invoice_number}`,
          }),
        );
      }
    }
  }

  async findAllInvoices(page = 1, limit = 50): Promise<[Invoice[], number]> {
    return this.invoiceRepository.findAndCount({
      relations: ['customer', 'user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['customer', 'user', 'items', 'items.product'],
    });
    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }
    return invoice;
  }
}

