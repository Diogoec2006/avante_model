import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from '../../users/entities/user.entity';
import { MovementType } from '../../../common/enums';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  product_id: string;

  @ManyToOne(() => Product, (product) => product.movements)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'user_id', nullable: true })
  user_id: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: MovementType,
    name: 'movement_type',
  })
  movement_type: MovementType;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 3, name: 'previous_stock' })
  previous_stock: number;

  @Column({ type: 'numeric', precision: 12, scale: 3, name: 'new_stock' })
  new_stock: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'unit_cost', nullable: true })
  unit_cost: number;

  @Column({ name: 'reason' })
  reason: string; // Justificación obligatoria

  @Column({ name: 'reference_id', nullable: true })
  reference_id: string; // ej: Factura #FAC-1234 o Orden de Compra #OC-45

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

