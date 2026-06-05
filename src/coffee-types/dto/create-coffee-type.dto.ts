import { IsString, IsOptional, IsNotEmpty, IsEnum, MinLength, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { Status, ProcessingMethod, AcidityLevel, BodyLevel, HarvestMonth } from '../../../generated/prisma/client';

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
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  altitude?: string;

  @IsOptional()
  @IsEnum(ProcessingMethod)
  processing?: ProcessingMethod;

  @IsOptional()
  @IsEnum(AcidityLevel)
  acidity?: AcidityLevel;

  @IsOptional()
  @IsEnum(BodyLevel)
  body?: BodyLevel;

  @IsOptional()
  @IsEnum(HarvestMonth, { each: true })
  @IsArray()
  harvestSeason?: HarvestMonth[];

  @IsOptional()
  @IsInt({ each: true })
  @Type(() => Number)
  @IsArray()
  gradeIds?: number[];

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  tastingNotes?: string[];

  @IsOptional()
  @IsString()
  badgeText?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
