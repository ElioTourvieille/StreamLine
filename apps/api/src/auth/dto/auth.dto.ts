import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator'

export enum Role {
  STUDIO = 'STUDIO',
  CLIENT = 'CLIENT',
}

export class RegisterDto {
  @IsEmail() email!: string
  @IsString() @MinLength(8) password!: string
  @IsString() @MinLength(2) name!: string
  @IsEnum(Role) @IsOptional() role?: Role
}

export class LoginDto {
  @IsEmail() email!: string
  @IsString() password!: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: Role
  organizationId?: string
}
