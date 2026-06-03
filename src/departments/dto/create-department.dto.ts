import { IsString, IsOptional, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { Status } from '../../../generated/prisma/client';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
