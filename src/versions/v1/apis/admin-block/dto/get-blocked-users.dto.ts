import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetBlockedUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean; // Add this field to filter by block status
}
