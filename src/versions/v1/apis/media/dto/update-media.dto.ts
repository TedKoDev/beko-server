// src/media/dto/update-media.dto.ts
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateMediaDto {
  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsString()
  mediaUrl: string;

  @IsEnum(['IMAGE', 'VIDEO'])
  mediaType: 'IMAGE' | 'VIDEO';
}
