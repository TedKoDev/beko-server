// src/posts/dto/pagination-query.dto.ts

import { postType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  admin_pick?: boolean;

  @IsInt()
  @IsOptional()
  topic_id?: number;

  @IsInt()
  @IsOptional()
  category_id?: number;
}
