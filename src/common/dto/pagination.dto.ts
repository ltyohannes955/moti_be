import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['newest', 'oldest'])
  sort?: 'newest' | 'oldest' = 'newest';
}
