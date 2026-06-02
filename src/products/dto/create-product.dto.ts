import { IsString, IsOptional, IsNotEmpty, MinLength, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '../../../generated/prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
