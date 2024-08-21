import { reportTargetType } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @IsEnum(reportTargetType)
  target_type: reportTargetType;

  @IsInt()
  target_id: number;

  @IsInt()
  reported_user_id: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
