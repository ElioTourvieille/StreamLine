import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator'

export enum DeliverableType {
  DESIGN_APPROVAL = 'DESIGN_APPROVAL',
  DOCUMENT = 'DOCUMENT',
  ASSET = 'ASSET',
  PROTOTYPE = 'PROTOTYPE',
  OTHER = 'OTHER',
}

export enum DeliverableStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  DRAFT = 'DRAFT',
}

export class CreateDeliverableDto {
  @IsString() @IsNotEmpty() title!: string
  @IsUUID() projectId!: string
  @IsEnum(DeliverableType) @IsOptional() type?: DeliverableType
  @IsString() @IsOptional() description?: string
  @IsString() @IsOptional() previewUrl?: string
  @IsDateString() @IsOptional() deadline?: string
}

export class ValidateDeliverableDto {
  @IsEnum(DeliverableStatus) action!: DeliverableStatus.APPROVED | DeliverableStatus.CHANGES_REQUESTED
  @IsString() @IsOptional() comment?: string
}
