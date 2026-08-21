import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator'

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  FOLLOW_UP = 'FOLLOW_UP',
  MAINTENANCE = 'MAINTENANCE',
  COMPLETED = 'COMPLETED',
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

export class CreateClientNoteDto {
  @IsString() @IsNotEmpty() text!: string
}
