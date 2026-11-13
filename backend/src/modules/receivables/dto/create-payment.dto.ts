import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID('4', { message: 'ID de cuenta por cobrar inválido' })
  receivable_account_id: string;

  @IsNumber({}, { message: 'El monto debe ser numérico' })
  @IsPositive({ message: 'El abono debe ser mayor que cero' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'El método de pago es obligatorio' })
  payment_method: string; // CASH, TRANSFER, CHECK

  @IsString()
  @IsOptional()
  notes?: string;
}

