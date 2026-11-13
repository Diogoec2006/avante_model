import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReceivableAccount } from './receivable-account.entity';
import { User } from '../../users/entities/user.entity';

@Entity('credit_payments')
export class CreditPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'receivable_account_id' })
  receivable_account_id: string;

  @ManyToOne(
    () => ReceivableAccount,
    (account) => account.payments,
  )
  @JoinColumn({ name: 'receivable_account_id' })
  receivable_account: ReceivableAccount;

  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'receipt_number', unique: true })
  receipt_number: string; // RC-0001

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', default: 'CASH' })
  payment_method: string; // CASH, TRANSFER, CHECK

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

