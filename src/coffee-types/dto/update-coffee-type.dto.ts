import { IsString, IsOptional, IsEnum, MinLength, IsArray, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { Status, ProcessingMethod, AcidityLevel, BodyLevel, HarvestMonth, TastingNote } from '../../../generated/prisma/client';

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

  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(s => s.trim());
    return value;
  })
  @IsOptional()
  @IsEnum(HarvestMonth, { each: true })
  @IsArray()
  harvestSeason?: HarvestMonth[];

  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') return value.split(',').map(s => Number(s.trim()));
    return value;
  })
  @IsOptional()
  @IsInt({ each: true })
  @IsArray()
  gradeIds?: number[];

  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(s => s.trim());
    return value;
  })
  @IsOptional()
  @IsEnum(TastingNote, { each: true })
  @IsArray()
  tastingNotes?: TastingNote[];

  @IsOptional()
  @IsString()
  badgeText?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
