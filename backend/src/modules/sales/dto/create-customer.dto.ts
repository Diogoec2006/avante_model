import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CreditStatus } from '../../../common/enums';

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  document_type?: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de documento (NIT/CC) es obligatorio' })
  document_number: string;

  @IsString()
  @IsNotEmpty({ message: 'La razón social o nombre es obligatorio' })
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  credit_limit?: number;

  @IsEnum(CreditStatus)
  @IsOptional()
  credit_status?: CreditStatus;
}

