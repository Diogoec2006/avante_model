import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StockMovement } from '../entities/stock-movement.entity';
import { Product } from '../entities/product.entity';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { MovementType } from '../../../common/enums';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async adjustStock(dto: AdjustStockDto, userId: string): Promise<StockMovement> {
    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new BadRequestException('La justificación del ajuste de stock es estrictamente obligatoria.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.product_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }

      const prevStock = Number(product.current_stock);
      let newStock = prevStock;

      const isInput =
        dto.movement_type === MovementType.IN_PURCHASE ||
        dto.movement_type === MovementType.IN_ADJUST;

      if (isInput) {
        newStock = prevStock + Number(dto.quantity);
      } else {
        if (prevStock < Number(dto.quantity)) {
          throw new BadRequestException(
            `Stock insuficiente para salida. Stock actual: ${prevStock}, Cantidad a retirar: ${dto.quantity}`,
          );
        }
        newStock = prevStock - Number(dto.quantity);
      }

      product.current_stock = newStock;
      if (dto.unit_cost && isInput) {
        // Actualizar costo promedio ponderado si aplica
        product.cost_price = dto.unit_cost;
      }
      await queryRunner.manager.save(product);

      const movement = queryRunner.manager.create(StockMovement, {
        product_id: product.id,
        user_id: userId,
        movement_type: dto.movement_type,
        quantity: dto.quantity,
        previous_stock: prevStock,
        new_stock: newStock,
        unit_cost: dto.unit_cost || product.cost_price,
        reason: dto.reason.trim(),
        reference_id: dto.reference_id,
      });

      const savedMovement = await queryRunner.manager.save(movement);
      await queryRunner.commitTransaction();
      return savedMovement;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getKardex(productId: string): Promise<StockMovement[]> {
    return this.movementRepository.find({
      where: { product_id: productId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getRecentMovements(limit = 50): Promise<StockMovement[]> {
    return this.movementRepository.find({
      relations: ['product', 'user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}

