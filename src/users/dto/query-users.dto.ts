import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Role, Status } from '../../../generated/prisma/client';

export class QueryUsersDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
