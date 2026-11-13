import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/enums';

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  full_name: string;

  @IsEnum(Role, { message: 'El rol debe ser ADMIN, VENDEDOR, CONTADOR o ASISTENTE_BODEGA' })
  role: Role;
}

