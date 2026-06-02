import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateBlogTagDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
}
