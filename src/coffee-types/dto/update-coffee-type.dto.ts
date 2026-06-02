import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { Status } from '../../../generated/prisma/client';

export class UpdateCoffeeTypeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
