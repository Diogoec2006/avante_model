import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivableAccount } from './entities/receivable-account.entity';
import { CreditPayment } from './entities/credit-payment.entity';
import { ReceivablesService } from './receivables.service';
import { ReceivablesController } from './receivables.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReceivableAccount, CreditPayment])],
  controllers: [ReceivablesController],
  providers: [ReceivablesService],
  exports: [ReceivablesService, TypeOrmModule],
})
export class ReceivablesModule {}

