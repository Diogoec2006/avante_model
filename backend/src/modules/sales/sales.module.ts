import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Customer } from './entities/customer.entity';
import { SalesPosService } from './services/sales-pos.service';
import { CustomersService } from './services/customers.service';
import { SalesPosController } from './controllers/sales-pos.controller';
import { CustomersController } from './controllers/customers.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Customer]),
    InventoryModule,
  ],
  controllers: [SalesPosController, CustomersController],
  providers: [SalesPosService, CustomersService],
  exports: [SalesPosService, CustomersService, TypeOrmModule],
})
export class SalesModule {}

