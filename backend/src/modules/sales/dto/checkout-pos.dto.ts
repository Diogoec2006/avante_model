import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '../../../common/enums';

export class CartItemDto {
  @IsUUID('4', { message: 'ID de producto inválido' })
  productId: string;

  @IsNumber()
  @IsPositive({ message: 'La cantidad debe ser mayor que 0' })
  quantity: number;

  @IsNumber()
  @IsPositive({ message: 'El precio debe ser positivo' })
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  taxRate?: number;
}

export class CheckoutPosDto {
  @IsUUID('4', { message: 'ID de cliente inválido' })
  customerId: string;

  @IsEnum(PaymentType, { message: 'Método de pago no válido' })
  paymentType: PaymentType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsString()
  @IsOptional()
  dueDate?: string; // Para ventas a crédito (YYYY-MM-DD)
}

