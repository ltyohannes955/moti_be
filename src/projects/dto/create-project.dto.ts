import { IsString, IsOptional, IsNotEmpty, MinLength, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '../../../generated/prisma/client';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
