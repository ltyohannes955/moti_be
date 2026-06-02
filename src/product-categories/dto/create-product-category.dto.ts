import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateProductCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
