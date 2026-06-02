import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Status } from '../../../generated/prisma/client';

export class QueryCoffeeTypesDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
