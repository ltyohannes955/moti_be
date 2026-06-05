import { IsString, IsOptional, MinLength, IsInt, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Status, BlogPostType } from '../../../generated/prisma/client';

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(BlogPostType)
  type?: BlogPostType;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return undefined;
  })
  @IsInt({ each: true })
  categoryIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return undefined;
  })
  @IsInt({ each: true })
  tagIds?: number[];
}
