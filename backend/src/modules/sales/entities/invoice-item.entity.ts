import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { Product } from '../../inventory/entities/product.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id' })
  invoice_id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'product_id' })
  product_id: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'unit_price' })
  unit_price: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'tax_rate', default: 19.0 })
  tax_rate: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'tax_amount', default: 0 })
  tax_amount: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  total: number;
}

