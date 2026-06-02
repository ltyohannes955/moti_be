import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateProjectCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
