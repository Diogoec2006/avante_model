import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StockMovementsService } from '../services/stock-movements.service';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums';

@Controller('inventory/movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockMovementsController {
  constructor(private readonly movementsService: StockMovementsService) {}

  @Post('adjust')
  @Roles(Role.ADMIN, Role.ASISTENTE_BODEGA)
  adjustStock(
    @Body() dto: AdjustStockDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.movementsService.adjustStock(dto, userId);
  }

  @Get('kardex/:productId')
  @Roles(Role.ADMIN, Role.CONTADOR, Role.ASISTENTE_BODEGA)
  getKardex(@Param('productId') productId: string) {
    return this.movementsService.getKardex(productId);
  }

  @Get('recent')
  @Roles(Role.ADMIN, Role.CONTADOR, Role.ASISTENTE_BODEGA)
  getRecentMovements() {
    return this.movementsService.getRecentMovements();
  }
}

