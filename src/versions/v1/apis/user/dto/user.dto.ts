import { accountStatus, provider, role } from '@prisma/client'; // Prisma의 enum을 가져옵니다
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CountryDTO } from './country.dto';

export class SocialLoginDTO {
  @IsNumber()
  social_login_id: number;

  @IsNumber()
  user_id: number;

  @IsEnum(provider)
  provider: provider;

  @IsString()
  provider_user_id: string;

  @IsDate()
  created_at: Date;

  @IsOptional()
  @IsDate()
  updated_at?: Date;

  @IsOptional()
  @IsDate()
  deleted_at?: Date;
}

export class UserDTO {
  @IsNumber()
  user_id: number;

  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  country?: CountryDTO;

  @IsString()
  encrypted_password: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  email_verification_token?: string;

  @IsNumber()
  points: number;

  @IsNumber()
  level: number;

  @IsBoolean()
  is_email_verified: boolean;

  @IsEnum(role)
  role: role;

  @IsEnum(accountStatus)
  account_status: accountStatus;

  @IsOptional()
  @IsString()
  sign_up_ip?: string;

  @IsDate()
  created_at: Date;

  @IsOptional()
  @IsDate()
  last_login_at?: Date;

  @IsOptional()
  @IsDate()
  updated_at?: Date;

  @IsOptional()
  @IsDate()
  deleted_at?: Date;

  @IsOptional()
  social_login?: SocialLoginDTO[];
}
