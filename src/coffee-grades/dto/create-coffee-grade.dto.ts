import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { CoffeeGradeStatus } from '../../../generated/prisma/client';

export class CreateCoffeeGradeDto {
  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsString()
  @IsNotEmpty()
  qualityLevel: string;

  @IsString()
  @IsNotEmpty()
  defects: string;

  @IsOptional()
  @IsEnum(CoffeeGradeStatus)
  status?: CoffeeGradeStatus;
}
