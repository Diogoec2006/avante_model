import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { ProductsService } from './services/products.service';
import { StockMovementsService } from './services/stock-movements.service';
import { ProductsController } from './controllers/products.controller';
import { CategoriesController } from './controllers/categories.controller';
import { StockMovementsController } from './controllers/stock-movements.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, StockMovement])],
  controllers: [
    ProductsController,
    CategoriesController,
    StockMovementsController,
  ],
  providers: [ProductsService, StockMovementsService],
  exports: [ProductsService, StockMovementsService, TypeOrmModule],
})
export class InventoryModule {}

