// src/posts/dto/create-post.dto.ts
import { postType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
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
}
