import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';

@Controller('sales/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query('search') search?: string) {
    const sellerId = user?.role === Role.VENDEDOR ? user.id : undefined;
    return this.customersService.findAll(search, sellerId);
  }

  @Get(':id/credit-status')
  getCreditStatus(@Param('id') id: string) {
    return this.customersService.getCreditStatus(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.VENDEDOR)
  create(@CurrentUser() user: User, @Body() dto: CreateCustomerDto) {
    if (user?.role === Role.VENDEDOR) {
      dto.assigned_seller_id = user.id;
      dto.assigned_seller_name = user.full_name;
    }
    return this.customersService.create(dto);
  }

  @Patch(':id/reassign')
  @Roles(Role.ADMIN)
  reassign(
    @Param('id') id: string,
    @Body() body: { newSellerId: string; newSellerName: string; notes: string },
  ) {
    return this.customersService.reassign(id, body.newSellerId, body.newSellerName, body.notes);
  }
}

