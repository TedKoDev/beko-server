// src/posts/dto/pagination-query.dto.ts

import { IsInt, IsOptional, IsString } from 'class-validator';

export class PaginationQueryDto {
  @IsInt()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  sort?: 'latest' | 'oldest' | 'popular';
}
