import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAdminBlockDto {
  @IsNotEmpty()
  @IsNumber()
  blockedUserId: number;

  @IsString()
  reason?: string;
}
