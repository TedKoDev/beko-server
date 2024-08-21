import { PrismaService } from '@/prisma';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateUserBlockDto } from './dto/create-user-block.dto';
import { GetBlockedUsersDto } from './dto/get-blocked-users.dto';
import { UnblockUserDto } from './dto/unblock-user.dto';

@Injectable()
export class UserBlockService {
  constructor(private readonly prisma: PrismaService) {}

  // 유저 차단
  async blockUser(createUserBlockDto: CreateUserBlockDto, blockerId: number) {
    const { blockedUserId } = createUserBlockDto;

    // 이미 차단된 상태인지 확인
    const existingBlock = await this.prisma.userBlock.findFirst({
      where: {
        blocker_id: blockerId,
        blocked_id: blockedUserId,
      },
    });

    if (existingBlock) {
      throw new BadRequestException('User is already blocked');
    }

    // 새 차단 생성
    return this.prisma.userBlock.create({
      data: {
        blocker_id: blockerId,
        blocked_id: blockedUserId,
      },
    });
  }

  // 유저 차단 해제
  async unblockUser(unblockUserDto: UnblockUserDto, blockerId: number) {
    const { blockedUserId } = unblockUserDto;

    // 현재 차단 상태인지 확인
    const block = await this.prisma.userBlock.findFirst({
      where: {
        blocker_id: blockerId,
        blocked_id: blockedUserId,
      },
    });

    if (!block) {
      throw new BadRequestException('User is not blocked');
    }

    // 차단 삭제
    await this.prisma.userBlock.delete({
      where: { block_id: block.block_id },
    });
  }

  // 차단된 유저 리스트 조회
  async getBlockedUsers(
    blockerId: number,
    paginationQuery: GetBlockedUsersDto,
  ) {
    const { page, limit, search } = paginationQuery;
    const skip = (page - 1) * limit;

    // where 절 정의
    const whereClause: Prisma.userBlockWhereInput = {
      blocker_id: blockerId,
      blocked: {
        username: {
          contains: search || '',
          mode: 'insensitive',
        },
      },
    };

    const [blockedUsers, totalCount] = await Promise.all([
      this.prisma.userBlock.findMany({
        skip,
        take: limit,
        where: whereClause,
        include: {
          blocked: {
            select: {
              user_id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.userBlock.count({
        where: whereClause,
      }),
    ]);

    return {
      data: blockedUsers.map((block) => block.blocked),
      total: totalCount,
      page,
      limit,
    };
  }
}
