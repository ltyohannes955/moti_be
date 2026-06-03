import { IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import { Status } from '../../../generated/prisma/client';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
