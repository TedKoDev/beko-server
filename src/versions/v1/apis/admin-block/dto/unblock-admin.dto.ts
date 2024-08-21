// src/admin-block/dto/unblock-user.dto.ts
import { IsInt } from 'class-validator';

export class UnblockAdminDto {
  @IsInt()
  blockedUserId: number;
}
