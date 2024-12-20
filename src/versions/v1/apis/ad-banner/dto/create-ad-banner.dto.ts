// create-ad-banner.dto.ts
import { AdBannerStatus } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAdBannerDto {
  @IsNotEmpty()
  @IsNumber()
  position: number;

  @IsNotEmpty()
  @IsString()
  company_name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  contract_period: number;

  @IsNotEmpty()
  @IsDate()
  contract_date: Date;

  @IsNotEmpty()
  @IsDate()
  start_date: Date;

  @IsNotEmpty()
  @IsDate()
  end_date: Date;

  @IsNotEmpty()
  @IsString()
  image_url: string;

  @IsOptional()
  @IsEnum(AdBannerStatus)
  status?: AdBannerStatus;
}
