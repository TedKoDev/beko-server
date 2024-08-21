import { PrismaService } from '@/prisma';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UnblockAdminDto } from './dto';
import { CreateAdminBlockDto } from './dto/create-admin-block.dto';
import { GetBlockedUsersDto } from './dto/get-blocked-users.dto';

@Injectable()
export class AdminBlockService {
  constructor(private readonly prisma: PrismaService) {}

  // 관리자 유저 차단
  // 관리자 유저 차단
  async blockUser(createAdminBlockDto: CreateAdminBlockDto, adminId: number) {
    const { blockedUserId, reason } = createAdminBlockDto;

    // 현재 차단 상태인지 확인
    const existingBlock = await this.prisma.adminBlock.findFirst({
      where: {
        admin_id: adminId,
        blocked_user_id: blockedUserId,
        unblocked_at: null, // Only check for blocks that are not unblocked
      },
    });

    if (existingBlock) {
      throw new BadRequestException('User is already blocked by this admin');
    }

    // If the user was previously unblocked, update the record
    const previousBlock = await this.prisma.adminBlock.findFirst({
      where: {
        admin_id: adminId,
        blocked_user_id: blockedUserId,
        unblocked_at: { not: null }, // Check for previously unblocked records
      },
    });

    if (previousBlock) {
      return this.prisma.adminBlock.update({
        where: { admin_block_id: previousBlock.admin_block_id },
        data: {
          unblocked_at: null, // Reset unblocked_at
          block_count: { increment: 1 }, // Increment block count
        },
      });
    }

    // Create a new block record if no previous block found
    return this.prisma.adminBlock.create({
      data: {
        admin: {
          connect: {
            user_id: adminId,
          },
        },
        blocked_user: {
          connect: {
            user_id: blockedUserId,
          },
        },
        reason: reason,
        created_at: new Date(),
        block_count: 1, // Set initial block count
      },
    });
  }

  // 관리자 유저 차단 해제
  // 관리자 유저 차단 해제
  async unblockUser(unblockUserDto: UnblockAdminDto, adminId: number) {
    const { blockedUserId } = unblockUserDto;

    console.log('blockedUserId', blockedUserId);
    console.log('adminId', adminId);

    // 현재 차단 상태인지 확인
    const block = await this.prisma.adminBlock.findFirst({
      where: {
        admin_id: adminId,
        blocked_user_id: blockedUserId,
        unblocked_at: null, // Only consider currently blocked records
      },
    });

    if (!block) {
      throw new BadRequestException('User is not blocked by this admin');
    }

    // 차단 삭제 및 unlocked_at 날짜 기록
    await this.prisma.adminBlock.update({
      where: { admin_block_id: block.admin_block_id },
      data: {
        unblocked_at: new Date(),
      },
    });

    return { message: 'User has been successfully unblocked' };
  }
  // 관리자에 의한 차단된 유저 리스트 조회
  async getBlockedUsers(adminId: number, paginationQuery: GetBlockedUsersDto) {
    const { page, limit, search } = paginationQuery;
    const skip = (page - 1) * limit;

    // where 절 정의
    const whereClause: Prisma.adminBlockWhereInput = {
      admin_id: adminId,
      blocked_user: {
        username: {
          contains: search || '',
          mode: 'insensitive',
        },
      },
      // Only fetch blocked users (unblocked_at is null)
      unblocked_at: null,
    };

    console.log('whereClause', whereClause);

    const [blockedUsers, totalCount] = await Promise.all([
      this.prisma.adminBlock.findMany({
        skip,
        take: limit,
        where: whereClause,
        include: {
          blocked_user: {
            select: {
              user_id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.adminBlock.count({
        where: whereClause,
      }),
    ]);

    return {
      data: blockedUsers.map((block) => ({
        user_id: block.blocked_user.user_id,
        username: block.blocked_user.username,
        email: block.blocked_user.email,
        blocked_at: block.created_at, // Show blocked_at if needed
        unlocked_at: block.unblocked_at, // Show unlocked_at if needed
      })),
      total: totalCount,
      page,
      limit,
    };
  }
}
