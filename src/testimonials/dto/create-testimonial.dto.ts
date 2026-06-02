import { IsString, IsOptional, IsNotEmpty, IsInt, IsEnum, Min, Max, MinLength } from 'class-validator';
import { Status } from '../../../generated/prisma/client';

export class CreateTestimonialDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  message: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
