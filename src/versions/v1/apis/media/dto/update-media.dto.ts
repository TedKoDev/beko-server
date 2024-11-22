// src/media/dto/update-media.dto.ts
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateMediaDto {
  @IsOptional()
  @IsInt()
  mediaId?: number; // media_id를 mediaId로 변경

  @IsString()
  mediaUrl: string;

  @IsEnum(['IMAGE', 'VIDEO'])
  mediaType: 'IMAGE' | 'VIDEO';
}
