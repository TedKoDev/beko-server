// src/posts/dto/create-post.dto.ts
import { postStatus, postType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateMediaDto } from '../../media/dto';

export class CreatePostDto {
  @IsNumber()
  @IsOptional()
  categoryId: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  @IsInt()
  points?: number;

  @IsString()
  @IsNotEmpty()
  type: postType; // 타입은 enum으로 지정

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateMediaDto)
  media: CreateMediaDto[];

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  status?: postStatus;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsDate()
  completedAt?: Date;

  @IsOptional()
  @IsBoolean()
  isAnswered?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}
