import { Auth } from '@/decorators';
import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';

import { AdminBlockService } from './admin-block.service';
import { UnblockAdminDto } from './dto';
import { CreateAdminBlockDto } from './dto/create-admin-block.dto';
import { GetBlockedUsersDto } from './dto/get-blocked-users.dto';

@Controller({
  path: 'admin/block',
  version: '1',
})
export class AdminBlockController {
  constructor(private readonly adminBlockService: AdminBlockService) {}

  // 관리자 유저 차단
  @Auth(['ADMIN'])
  @Post()
  async blockUser(
    @Body() createAdminBlockDto: CreateAdminBlockDto,
    @Req() req: { user: { userId: number } },
  ) {
    const adminId = req.user.userId; // Extract userId from req.user
    return this.adminBlockService.blockUser(createAdminBlockDto, adminId);
  }
  // 관리자 유저 차단 해제
  @Auth(['ADMIN'])
  @Post('unblock')
  async unblockUser(
    @Body() unblockAdminDto: UnblockAdminDto, // Use DTO
    @Req() req: { user: { userId: number } },
  ) {
    const adminId = req.user.userId; // Extract userId from req.user
    return this.adminBlockService.unblockUser(
      unblockAdminDto, // Pass the entire DTO object
      adminId,
    );
  }

  // 관리자에 의한 차단된 유저 리스트 조회
  @Auth(['ADMIN'])
  @Get()
  async getBlockedUsers(
    @Req() req: { user: { userId: number } },
    @Query() query: GetBlockedUsersDto,
  ) {
    const adminId = req.user.userId; // Extract userId from req.user
    return this.adminBlockService.getBlockedUsers(adminId, query);
  }
}
