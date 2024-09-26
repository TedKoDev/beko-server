// update-ad-banner.dto.ts
import { AdBannerStatus } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAdBannerDto {
  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  contract_period?: number;

  @IsOptional()
  @IsDate()
  contract_date?: Date;

  @IsOptional()
  @IsDate()
  start_date?: Date;

  @IsOptional()
  @IsDate()
  end_date?: Date;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsEnum(AdBannerStatus)
  status?: AdBannerStatus;
}
