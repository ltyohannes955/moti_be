import { IsString, IsOptional, IsNotEmpty, MinLength, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '../../../generated/prisma/client';

export class CreateTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  departmentId: number;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
