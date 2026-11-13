import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { AccountingAccount } from './accounting-account.entity';

@Entity('journal_entry_lines')
export class JournalEntryLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'journal_entry_id' })
  journal_entry_id: string;

  @ManyToOne(
    () => JournalEntry,
    (entry) => entry.lines,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'journal_entry_id' })
  journal_entry: JournalEntry;

  @Column({ name: 'account_id' })
  account_id: string;

  @ManyToOne(() => AccountingAccount, { eager: true })
  @JoinColumn({ name: 'account_id' })
  account: AccountingAccount;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  credit: number;

  @Column({ nullable: true })
  description: string;
}

