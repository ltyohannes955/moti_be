import { IsString, IsOptional, IsNotEmpty, MinLength, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '../../../generated/prisma/client';

export class CreateGalleryImageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
