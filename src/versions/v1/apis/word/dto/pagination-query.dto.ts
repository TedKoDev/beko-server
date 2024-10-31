// src/posts/dto/pagination-query.dto.ts

import { postType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @IsInt()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsOptional()
  limit?: number;

  @IsEnum(postType)
  @IsOptional()
  type?: postType;

  @IsOptional()
  sort?: 'latest' | 'oldest' | 'popular';
}
