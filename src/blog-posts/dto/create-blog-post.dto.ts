import { IsString, IsOptional, IsNotEmpty, MinLength, IsInt, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Status, BlogPostType } from '../../../generated/prisma/client';

export class CreateBlogPostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsEnum(BlogPostType)
  type?: BlogPostType;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return [];
  })
  @IsInt({ each: true })
  categoryIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return [];
  })
  @IsInt({ each: true })
  tagIds?: number[];
}
