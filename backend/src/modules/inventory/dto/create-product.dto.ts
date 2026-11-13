import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsUUID('4', { message: 'ID de categoría no válido' })
  category_id: string;

  @IsString()
  @IsNotEmpty({ message: 'El SKU es obligatorio' })
  sku: string;

  @IsString()
  @IsNotEmpty({ message: 'El código de barras es obligatorio' })
  barcode: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  name: string;

  @IsString()
  @IsOptional()
  unit_of_measure?: string;

  @IsNumber({}, { message: 'El costo debe ser un número válido' })
  @Min(0, { message: 'El costo no puede ser negativo' })
  cost_price: number;

  @IsNumber({}, { message: 'El precio de venta debe ser un número válido' })
  @IsPositive({ message: 'El precio de venta debe ser positivo' })
  sale_price: number;

  @IsNumber({}, { message: 'El stock inicial debe ser numérico' })
  @Min(0)
  @IsOptional()
  initial_stock?: number;

  @IsNumber({}, { message: 'El stock mínimo debe ser numérico' })
  @Min(0)
  @IsOptional()
  min_stock?: number;

  @IsNumber({}, { message: 'La tasa de IVA debe ser numérica' })
  @Min(0)
  @IsOptional()
  tax_rate?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

