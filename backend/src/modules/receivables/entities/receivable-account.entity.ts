import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../sales/entities/customer.entity';
import { Invoice } from '../../sales/entities/invoice.entity';
import { CreditPayment } from './credit-payment.entity';
import { ReceivableStatus } from '../../../common/enums';

@Entity('receivable_accounts')
export class ReceivableAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id' })
  invoice_id: string;

  @ManyToOne(() => Invoice, { eager: true })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'customer_id' })
  customer_id: string;

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'total_amount' })
  total_amount: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'date', name: 'due_date' })
  due_date: string;

  @Column({
    type: 'enum',
    enum: ReceivableStatus,
    default: ReceivableStatus.PENDING,
  })
  status: ReceivableStatus;

  @OneToMany(() => CreditPayment, (payment) => payment.receivable_account)
  payments: CreditPayment[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

