import { IsInt, IsPositive } from 'class-validator';

export class CreateUserBlockDto {
  @IsInt()
  @IsPositive()
  blockedUserId: number;
}
