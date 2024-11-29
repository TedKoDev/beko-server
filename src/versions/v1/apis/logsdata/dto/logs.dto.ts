import { LogType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetLogCountDto {
  @IsNotEmpty()
  @IsEnum(LogType, { message: '유효하지 않은 로그 타입입니다.' })
  type: LogType;
}

export class LogCountResponseDto {
  @IsEnum(LogType)
  type: LogType;

  @IsNumber()
  count: number;
}

export class YoutubeLinkResponseDto {
  @IsNumber()
  link_id: number;

  @IsString()
  link: string;

  @IsString()
  name: string;

  @IsString()
  topic: string;

  @IsString()
  created_at: Date;
}
