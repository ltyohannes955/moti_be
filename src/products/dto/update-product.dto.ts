import { IsString, IsOptional, MinLength, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '../../../generated/prisma/client';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
