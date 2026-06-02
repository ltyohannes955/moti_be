import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ContactStatus, ContactSubject } from '../../../generated/prisma/client';

export class QueryContactMessagesDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @IsOptional()
  @IsEnum(ContactSubject)
  subject?: ContactSubject;
}
