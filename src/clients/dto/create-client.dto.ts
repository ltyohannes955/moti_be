import { IsString, IsOptional, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { OrganizationType, Status } from '../../../generated/prisma/client';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsEnum(OrganizationType)
  @IsNotEmpty()
  type: OrganizationType;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
