import { IsOptional, IsEnum, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Status, BlogPostType } from '../../../generated/prisma/client';

export class QueryBlogPostsDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tagId?: number;

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
