import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CreditStatus } from '../../../common/enums';
import { Invoice } from './invoice.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_type', default: 'CC' })
  document_type: string; // CC, NIT, RUT, PASAPORTE

  @Column({ unique: true, name: 'document_number' })
  document_number: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    name: 'credit_limit',
    default: 0,
  })
  credit_limit: number;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    name: 'current_debt',
    default: 0,
  })
  current_debt: number;

  @Column({
    type: 'enum',
    enum: CreditStatus,
    name: 'credit_status',
    default: CreditStatus.ACTIVE,
  })
  credit_status: CreditStatus;

  @Column({ nullable: true, name: 'assigned_seller_id' })
  assigned_seller_id: string;

  @Column({ nullable: true, name: 'assigned_seller_name' })
  assigned_seller_name: string;

  @Column({ nullable: true, name: 'handoff_notes' })
  handoff_notes: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @OneToMany(() => Invoice, (invoice) => invoice.customer)
  invoices: Invoice[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

