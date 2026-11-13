import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { User } from '../../users/entities/user.entity';
import { InvoiceItem } from './invoice-item.entity';
import { PaymentType } from '../../../common/enums';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_number', unique: true })
  invoice_number: string;

  @Column({ name: 'customer_id' })
  customer_id: string;

  @ManyToOne(() => Customer, (customer) => customer.invoices, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: PaymentType,
    name: 'payment_type',
    default: PaymentType.CASH,
  })
  payment_type: PaymentType;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'tax_amount', default: 0 })
  tax_amount: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'discount_amount', default: 0 })
  discount_amount: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  total: number;

  @Column({ default: 'ISSUED' })
  status: string; // ISSUED, CANCELLED

  @Column({ name: 'electronic_sync_status', default: 'PENDING' })
  electronic_sync_status: string; // PENDING, APPROVED, REJECTED

  @Column({ name: 'fiscal_uuid', nullable: true })
  fiscal_uuid: string; // CUFE / UUID Tributario

  @Column({ type: 'jsonb', name: 'electronic_payload_meta', nullable: true })
  electronic_payload_meta: Record<string, any>;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true, eager: true })
  items: InvoiceItem[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

