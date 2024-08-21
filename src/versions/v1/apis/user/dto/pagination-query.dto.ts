import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @IsPositive() // Ensures that the value is greater than 0
  page?: number;

  @IsOptional()
  @IsInt()
  @IsPositive() // Ensures that the value is greater than 0
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
