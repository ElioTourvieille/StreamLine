import { IsString, IsOptional, IsUUID, IsEnum, IsEmail } from 'class-validator'

export enum ProjectMemberRole {
  LEAD = 'LEAD',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
}

export class UpdateProfileDto {
  @IsString() @IsOptional() name?: string
  @IsString() @IsOptional() avatarUrl?: string
  @IsString() @IsOptional() jobTitle?: string
}

export class AddMemberDto {
  @IsUUID() userId!: string
  @IsEnum(ProjectMemberRole) @IsOptional() role?: ProjectMemberRole
}

export class InviteTeamMemberDto {
  @IsEmail() email!: string
  @IsString() @IsOptional() name?: string
}
