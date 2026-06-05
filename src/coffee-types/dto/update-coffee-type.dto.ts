import { IsString, IsOptional, IsEnum, MinLength, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { Status, ProcessingMethod, AcidityLevel, BodyLevel, HarvestMonth } from '../../../generated/prisma/client';

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
