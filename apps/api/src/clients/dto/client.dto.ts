import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator'

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class CreateClientDto {
  @IsString() @IsNotEmpty() name!: string
  @IsEmail() contactEmail!: string
  @IsString() @IsOptional() company?: string
  @IsString() @IsOptional() phone?: string
  @IsString() @IsOptional() logoUrl?: string
}

export class UpdateClientDto {
  @IsString() @IsOptional() name?: string
  @IsEmail() @IsOptional() contactEmail?: string
  @IsString() @IsOptional() company?: string
  @IsString() @IsOptional() phone?: string
  @IsString() @IsOptional() logoUrl?: string
  @IsEnum(ClientStatus) @IsOptional() status?: ClientStatus
}

export class InviteClientDto {
  @IsEmail() email!: string
  @IsString() @IsNotEmpty() name!: string
}
