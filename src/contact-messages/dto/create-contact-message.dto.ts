import { IsString, IsEmail, IsOptional, IsNotEmpty, IsEnum, MinLength } from 'class-validator';
import { ContactSubject } from '../../../generated/prisma/client';

export class CreateContactMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsEnum(ContactSubject)
  subject: ContactSubject;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  message: string;
}
