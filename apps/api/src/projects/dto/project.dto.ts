import {
  IsString, IsNotEmpty, IsOptional, IsEnum,
  IsArray, ValidateNested, IsDateString, IsUUID,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class MilestoneDto {
  @IsString() @IsNotEmpty() title!: string
  @IsDateString() dueDate!: string
  @IsEnum(MilestoneStatus) @IsOptional() status?: MilestoneStatus
}

export class CreateProjectDto {
  @IsString() @IsNotEmpty() name!: string
  @IsUUID() clientId!: string
  @IsString() @IsOptional() description?: string
  @IsDateString() @IsOptional() startDate?: string
  @IsDateString() @IsOptional() endDate?: string
  @IsArray() @ValidateNested({ each: true }) @Type(() => MilestoneDto) @IsOptional()
  milestones?: MilestoneDto[]
}

export class UpdateProjectDto {
  @IsString() @IsOptional() name?: string
  @IsString() @IsOptional() description?: string
  @IsEnum(ProjectStatus) @IsOptional() status?: ProjectStatus
  @IsDateString() @IsOptional() startDate?: string
  @IsDateString() @IsOptional() endDate?: string
}

export class UpdateMilestoneDto {
  @IsString() @IsOptional() title?: string
  @IsDateString() @IsOptional() dueDate?: string
  @IsEnum(MilestoneStatus) @IsOptional() status?: MilestoneStatus
}
