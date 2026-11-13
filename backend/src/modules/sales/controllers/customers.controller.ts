import {
  Controller,
  Get,
  Post,
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
import { Role } from '../../../common/enums';

@Controller('sales/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.customersService.findAll(search);
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
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }
}

