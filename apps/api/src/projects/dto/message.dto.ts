import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateMessageDto {
  @IsString() @IsNotEmpty() text!: string
  @IsString() @IsOptional() authorName?: string
}
