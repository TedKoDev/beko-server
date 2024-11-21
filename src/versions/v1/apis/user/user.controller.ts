import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { Auth } from '@/decorators';
import { ROLE } from '@/types/v1';
import { JwtAuthGuard } from '../auth';
import { PaginationQueryDto } from './dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { USER_SERVIE_TOKEN, UserService } from './user.service';

@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  s3Service: any;
  constructor(
    @Inject(USER_SERVIE_TOKEN)
    private readonly userService: UserService,
  ) {}

  @Get('profile')
  @Auth(['ANY'])
  async profile(@Req() req: { user: { userId: number; role: ROLE } }) {
    return this.userService.profile(req.user.userId);
  }

  @Post('update-profile')
  async updateUserProfile(
    @Body() dto: UpdateUserProfileDto,
    @Res() res: Response,
  ) {
    const updatedUser = await this.userService.updateUser(dto.userId, {
      username: dto.username,
      bio: dto.bio,
      profilePictureUrl: dto.profilePictureUrl,
    });
    return res.status(200).json(updatedUser);
  }

  @Get('profile-image-upload-url')
  @Auth(['ANY'])
  async getProfileImageUploadUrl(
    @Query('fileName') fileName: string,
    @Query('fileType') fileType: string,
  ) {
    const key = `profile-images/${Date.now()}-${fileName}`;
    return this.s3Service.getPresignedUrl(key, fileType);
  }

  @Get('check-username')
  async checkUsername(
    @Query('username') username: string,
    @Res() res: Response,
  ) {
    const isAvailable = await this.userService.checkUsername(username);
    return res.status(200).json({ available: isAvailable });
  }

  // 유저 리스트 조회
  @Get('list')
  async getUsers(
    @Query() paginationQuery: PaginationQueryDto,
    @Res() res: Response,
  ) {
    const { page, limit, search } = paginationQuery;
    const users = await this.userService.getUsers(page, limit, search);
    return res.status(200).json(users);
  }

  // 유저 상세 정보 조회

  // 유저 상세 정보 조회
  // 유저 상세 정보 및 통계 조회
  @Get('detail/:id')
  async getUserById(@Param('id') userId: number) {
    try {
      const userWithStats = await this.userService.getUserById(userId);
      return {
        status: 'success',
        data: userWithStats,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req) {
    const userId = req.user.userId; // JWT에서 추출한 userId
    return this.userService.getCurrentUser(userId);
  }
}
