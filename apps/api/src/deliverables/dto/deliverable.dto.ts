import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString, IsInt, Min, MaxLength } from 'class-validator'

export enum DeliverableType {
  DESIGN_APPROVAL = 'DESIGN_APPROVAL',
  DOCUMENT = 'DOCUMENT',
  ASSET = 'ASSET',
  PROTOTYPE = 'PROTOTYPE',
  VIDEO = 'VIDEO',
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

  // Set together after a successful presigned upload (see StorageService).
  // A deliverable can carry a file, a previewUrl link, both, or neither.
  @IsString() @IsOptional() fileKey?: string
  @IsString() @IsOptional() @MaxLength(255) fileName?: string
  @IsInt() @Min(0) @IsOptional() fileSize?: number
  @IsString() @IsOptional() mimeType?: string
}

export class ValidateDeliverableDto {
  @IsEnum(DeliverableStatus) action!: DeliverableStatus.APPROVED | DeliverableStatus.CHANGES_REQUESTED
  @IsString() @IsOptional() comment?: string
}

export class RequestUploadUrlDto {
  @IsUUID() projectId!: string
  @IsString() @IsNotEmpty() @MaxLength(255) fileName!: string
  @IsString() @IsNotEmpty() contentType!: string
  @IsInt() @Min(0) @IsOptional() fileSize?: number
}
