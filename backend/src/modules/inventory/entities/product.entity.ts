import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { StockMovement } from './stock-movement.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id' })
  category_id: string;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ unique: true })
  sku: string;

  @Column({ unique: true })
  barcode: string;

  @Column()
  name: string;

  @Column({ name: 'unit_of_measure', default: 'UND' })
  unit_of_measure: string; // UND, METRO, KG, LITRO, BOLSA

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'cost_price' })
  cost_price: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'sale_price' })
  sale_price: number;

  @Column({ type: 'numeric', precision: 12, scale: 3, name: 'current_stock', default: 0 })
  current_stock: number;

  @Column({ type: 'numeric', precision: 12, scale: 3, name: 'min_stock', default: 5 })
  min_stock: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'tax_rate', default: 19.0 })
  tax_rate: number;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @OneToMany(() => StockMovement, (movement) => movement.product)
  movements: StockMovement[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

