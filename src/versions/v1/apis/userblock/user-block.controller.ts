import { Auth } from '@/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CreateUserBlockDto } from './dto/create-user-block.dto';
import { GetBlockedUsersDto } from './dto/get-blocked-users.dto';
import { UnblockUserDto } from './dto/unblock-user.dto';
import { UserBlockService } from './user-block.service';

@Controller({
  path: 'block',
  version: '1',
})
export class UserBlockController {
  constructor(private readonly userBlockService: UserBlockService) {}

  @Post()
  @Auth(['ANY'])
  async blockUser(
    @Body() createUserBlockDto: CreateUserBlockDto,
    @Req() req: { user: { userId: number } },
  ) {
    const blockerId = req.user.userId;
    const block = await this.userBlockService.blockUser(
      createUserBlockDto,
      blockerId,
    );
    return {
      message: 'User blocked successfully',
      block,
    };
  }

  @Delete()
  @Auth(['ANY'])
  async unblockUser(
    @Body() unblockUserDto: UnblockUserDto,
    @Req() req: { user: { userId: number } },
  ) {
    const blockerId = req.user.userId;
    await this.userBlockService.unblockUser(unblockUserDto, blockerId);
    return {
      message: 'User unblocked successfully',
    };
  }

  @Get()
  @Auth(['ANY'])
  async getBlockedUsers(
    @Req() req: { user: { userId: number } },
    @Query() getBlockedUsersDto: GetBlockedUsersDto,
  ) {
    const blockerId = req.user.userId;
    const blockedUsers = await this.userBlockService.getBlockedUsers(
      blockerId,
      getBlockedUsersDto,
    );
    return blockedUsers;
  }
}
