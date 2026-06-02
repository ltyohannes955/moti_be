import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateProjectCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
