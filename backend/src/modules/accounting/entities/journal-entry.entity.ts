import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JournalEntryLine } from './journal-entry-line.entity';
import { User } from '../../users/entities/user.entity';

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entry_number', unique: true })
  entry_number: string; // ej: AS-2026-0001

  @Column({ type: 'date', name: 'entry_date' })
  entry_date: string;

  @Column()
  concept: string;

  @Column({ name: 'source_module', default: 'MANUAL' })
  source_module: string; // SALES, RECEIVABLES, INVENTORY_ADJUST, MANUAL

  @Column({ name: 'source_id', nullable: true })
  source_id: string;

  @Column({ name: 'user_id', nullable: true })
  user_id: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => JournalEntryLine, (line) => line.journal_entry, {
    cascade: true,
    eager: true,
  })
  lines: JournalEntryLine[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

