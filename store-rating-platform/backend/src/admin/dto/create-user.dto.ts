import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum AdminCreatableRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  NORMAL_USER = 'NORMAL_USER',
  STORE_OWNER = 'STORE_OWNER',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(60)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  address!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/, {
    message:
      'Password must contain at least one uppercase letter and one special character',
  })
  password!: string;

  @IsEnum(AdminCreatableRole)
  role!: AdminCreatableRole;
}