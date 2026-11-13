import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { MovementType } from '../../../common/enums';

export class AdjustStockDto {
  @IsUUID('4', { message: 'ID de producto no válido' })
  product_id: string;

  @IsEnum(MovementType, { message: 'Tipo de movimiento inválido' })
  movement_type: MovementType;

  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsPositive({ message: 'La cantidad debe ser mayor que 0' })
  quantity: number;

  @IsString()
  @IsNotEmpty({ message: 'La justificación es estrictamente obligatoria' })
  reason: string;

  @IsNumber()
  @IsOptional()
  unit_cost?: number;

  @IsString()
  @IsOptional()
  reference_id?: string;
}

