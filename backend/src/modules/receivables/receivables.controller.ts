import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReceivablesService } from './receivables.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReceivableStatus, Role } from '../../common/enums';

@Controller('receivables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Get('accounts')
  @Roles(Role.ADMIN, Role.CONTADOR)
  findAll(
    @Query('status') status?: ReceivableStatus,
    @Query('customerId') customerId?: string,
  ) {
    return this.receivablesService.findAll(status, customerId);
  }

  @Get('accounts/:id')
  @Roles(Role.ADMIN, Role.CONTADOR)
  findOne(@Param('id') id: string) {
    return this.receivablesService.findOne(id);
  }

  @Get('reports/aging')
  @Roles(Role.ADMIN, Role.CONTADOR)
  getAgingReport() {
    return this.receivablesService.getAgingReport();
  }

  @Post('payments')
  @Roles(Role.ADMIN, Role.CONTADOR)
  registerPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.receivablesService.registerPayment(dto, userId);
  }
}

