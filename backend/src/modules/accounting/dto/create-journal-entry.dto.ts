import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class JournalLineDto {
  @IsUUID('4', { message: 'ID de cuenta contable inválido' })
  account_id: string;

  @IsNumber()
  @Min(0)
  debit: number;

  @IsNumber()
  @Min(0)
  credit: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateJournalEntryDto {
  @IsString()
  @IsNotEmpty({ message: 'El concepto del asiento es obligatorio' })
  concept: string;

  @IsString()
  @IsOptional()
  entry_date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines: JournalLineDto[];
}

