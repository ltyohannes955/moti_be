import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CareerType, Status } from '../../../generated/prisma/client';

export class QueryCareersDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CareerType)
  type?: CareerType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
