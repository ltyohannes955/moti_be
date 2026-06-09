import { IsString, IsOptional, IsNotEmpty, IsEnum, MinLength, IsArray, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { Status, ProcessingMethod, AcidityLevel, BodyLevel, HarvestMonth, TastingNote } from '../../../generated/prisma/client';

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
