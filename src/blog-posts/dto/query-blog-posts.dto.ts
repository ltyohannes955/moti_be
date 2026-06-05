import { IsOptional, IsEnum, IsInt, IsString, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Status, BlogPostType } from '../../../generated/prisma/client';

export class QueryBlogPostsDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null) return undefined;
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return [Number(value)];
  })
  @IsInt({ each: true })
  categoryIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value == null) return undefined;
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return [Number(value)];
  })
  @IsInt({ each: true })
  tagIds?: number[];

  @IsOptional()
  @IsEnum(BlogPostType)
  type?: BlogPostType;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsString()
  search?: string;
}
