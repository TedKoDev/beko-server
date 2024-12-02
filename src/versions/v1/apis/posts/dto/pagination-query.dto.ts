// src/posts/dto/pagination-query.dto.ts

import { consultationStatus, postType } from '@prisma/client';
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  is_private?: boolean;

  @IsInt()
  @IsOptional()
  student_id?: number;

  @IsInt()
  @IsOptional()
  teacher_id?: number;

  @IsDate()
  @IsOptional()
  completed_at?: Date;

  @IsBoolean()
  @IsOptional()
  is_answered?: boolean;

  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;

  @IsBoolean()
  @IsOptional()
  is_draft?: boolean;

  @IsEnum(consultationStatus)
  @IsOptional()
  status?: consultationStatus;
}
