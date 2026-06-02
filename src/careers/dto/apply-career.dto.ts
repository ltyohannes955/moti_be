import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class ApplyCareerDto {
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
  coverLetter?: string;
}
