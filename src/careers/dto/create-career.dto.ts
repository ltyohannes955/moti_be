import { IsString, IsEmail, IsOptional, IsNotEmpty, IsEnum, MinLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { CareerType, Status } from '../../../generated/prisma/client';

export class CreateCareerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  departmentId: number;

  @IsEnum(CareerType)
  type: CareerType;

  @IsString()
  @IsNotEmpty()
  description: string;

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
