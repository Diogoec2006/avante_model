import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AccountType } from '../../../common/enums';

@Entity('accounting_accounts')
export class AccountingAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // ej: 110505 (Caja General), 130505 (Clientes), etc.

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    name: 'account_type',
  })
  account_type: AccountType;

  @Column({ default: 1 })
  level: number;

  @Column({ name: 'parent_id', nullable: true })
  parent_id: string;

  @ManyToOne(() => AccountingAccount, (acc) => acc.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: AccountingAccount;

  @OneToMany(() => AccountingAccount, (acc) => acc.parent)
  children: AccountingAccount[];

  @Column({ name: 'allows_movement', default: true })
  allows_movement: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

