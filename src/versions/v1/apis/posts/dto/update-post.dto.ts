// src/versions/v1/apis/posts/dto/update-post.dto.ts
import { consultationStatus, postStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateMediaDto } from '../../media/dto/update-media.dto';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsOptional()
  @IsInt()
  points?: number;

  @IsOptional()
  @IsBoolean()
  isAnswered?: boolean; // 새로운 필드 추가

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ValidateNested({ each: true })
  @Type(() => UpdateMediaDto)
  @IsOptional()
  media?: UpdateMediaDto[];
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  status?: postStatus;

  @IsOptional()
  @IsString()
  consultationStatus?: consultationStatus; // consultation용 status 추가

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsDate()
  completedAt?: Date;
}
