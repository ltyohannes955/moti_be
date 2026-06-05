import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { CoffeeGradeStatus } from '../../../generated/prisma/client';

export class UpdateCoffeeGradeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  grade?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  qualityLevel?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  defects?: string;

  @IsOptional()
  @IsEnum(CoffeeGradeStatus)
  status?: CoffeeGradeStatus;
}
