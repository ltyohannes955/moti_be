import { IsString, IsOptional, IsInt, IsEnum, Min, Max, MinLength } from 'class-validator';
import { Status } from '../../../generated/prisma/client';

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  message?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
