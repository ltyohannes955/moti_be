import { IsString, IsOptional, MinLength, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '../../../generated/prisma/client';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
