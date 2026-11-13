import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums';

@Controller('inventory/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @CurrentUser('role') role: Role,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.findAll(role, search, categoryId);
  }

  @Get('low-stock')
  @Roles(Role.ADMIN, Role.CONTADOR)
  getLowStockAlerts() {
    return this.productsService.getLowStockAlerts();
  }

  @Get('lookup/:term')
  findByBarcodeOrSku(
    @Param('term') term: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.productsService.findByBarcodeOrSku(term, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('role') role: Role) {
    return this.productsService.findOne(id, role);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.create(createProductDto, userId);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }
}

