import { IsInt, IsPositive } from 'class-validator';

export class UnblockUserDto {
  @IsInt()
  @IsPositive()
  blockedUserId: number;
}
