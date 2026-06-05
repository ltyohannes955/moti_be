import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsString() siteName?: string;
  @IsOptional() @IsString() siteDescription?: string;
  @IsOptional() @IsBoolean() maintenanceMode?: boolean;
  @IsOptional() @IsString() maintenanceMessage?: string;
  @IsOptional() @IsDateString() estimatedEndTime?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() linkedIn?: string;
  @IsOptional() @IsString() twitter?: string;
  @IsOptional() @IsString() instagram?: string;
}
