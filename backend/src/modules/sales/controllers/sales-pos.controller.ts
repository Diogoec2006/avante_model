import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SalesPosService } from '../services/sales-pos.service';
import { CheckoutPosDto } from '../dto/checkout-pos.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesPosController {
  constructor(private readonly salesPosService: SalesPosService) {}

  @Post('pos/checkout')
  @Roles(Role.ADMIN, Role.VENDEDOR)
  checkout(
    @Body() dto: CheckoutPosDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesPosService.checkout(dto, userId);
  }

  @Get('invoices')
  @Roles(Role.ADMIN, Role.CONTADOR)
  findAllInvoices(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.salesPosService.findAllInvoices(Number(page), Number(limit));
  }

  @Get('invoices/:id')
  findInvoiceById(@Param('id') id: string) {
    return this.salesPosService.findInvoiceById(id);
  }
}

