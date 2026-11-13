import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'El código de la categoría es requerido' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es requerido' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

