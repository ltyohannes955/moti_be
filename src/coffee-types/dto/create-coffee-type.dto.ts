import { IsString, IsOptional, IsNotEmpty, IsEnum, MinLength } from 'class-validator';
import { Status } from '../../../generated/prisma/client';

export class CreateCoffeeTypeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
