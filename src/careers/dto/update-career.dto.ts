import { IsString, IsOptional, MinLength, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CareerType, Status } from '../../../generated/prisma/client';

export class UpdateCareerDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsEnum(CareerType)
  type?: CareerType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
