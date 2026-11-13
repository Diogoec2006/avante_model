import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getTypeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { ReceivablesModule } from './modules/receivables/receivables.module';
import { AccountingModule } from './modules/accounting/accounting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    EventEmitterModule.forRoot(),
    UsersModule,
    AuthModule,
    InventoryModule,
    SalesModule,
    ReceivablesModule,
    AccountingModule,
  ],
})
export class AppModule {}

