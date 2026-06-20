import { IsString, IsNotEmpty, IsOptional, IsHexColor, IsUrl, Matches } from 'class-validator'

export class CreateOrganizationDto {
  @IsString() @IsNotEmpty() name!: string

  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase alphanumeric with hyphens' })
  slug!: string

  @IsHexColor() @IsOptional() primaryColor?: string
  @IsString() @IsOptional() logoUrl?: string
  @IsUrl() @IsOptional() website?: string
}

export class UpdateOrganizationDto {
  @IsString() @IsOptional() name?: string
  @IsHexColor() @IsOptional() primaryColor?: string
  @IsString() @IsOptional() logoUrl?: string
  @IsUrl() @IsOptional() website?: string
}
