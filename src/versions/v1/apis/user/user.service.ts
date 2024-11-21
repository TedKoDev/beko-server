import { PrismaService } from '@/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserDTO } from './dto/user.dto';

export const USER_SERVIE_TOKEN = 'USER_SERVIE_TOKEN';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // 사용자 프로필 조회
  async profile(userId: number) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
    });
  }

  // 사용자 정보 수정
  async updateUser(
    userId: number,
    updateData: {
      username: string;
      bio: string;
      profilePictureUrl?: string;
    },
  ) {
    // 중복된 username 확인
    let finalUsername = updateData.username;
    const existingUser = await this.prisma.users.findUnique({
      where: { username: updateData.username },
    });

    if (existingUser && existingUser.user_id !== userId) {
      const uniqueSuffix = `#${uuidv4().slice(0, 8)}`;
      finalUsername = `${updateData.username}${uniqueSuffix}`;
    }

    // 사용자 정보 업데이트
    return this.prisma.users.update({
      where: { user_id: userId },
      data: {
        username: finalUsername,
        bio: updateData.bio,
        profile_picture_url: updateData.profilePictureUrl,
        updated_at: new Date(),
      },
    });
  }

  // 사용자 이름 중복 확인
  async checkUsername(username: string) {
    const existingUser = await this.prisma.users.findUnique({
      where: { username },
    });
    return existingUser ? false : true;
  }

  // 유저 리스트 페이징 조회
  async getUsers(page: number = 1, limit: number = 10, search: string = '') {
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      this.prisma.users.findMany({
        skip,
        take: limit,
        where: {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: {
          created_at: 'desc', // 정렬 기준 설정
        },
      }),
      this.prisma.users.count({
        where: {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      data: users,
      total: totalCount,
      page,
      limit,
    };
  }

  // 유저 통계 조회 - 삭제된 항목 제외

  async getUserById(userId: number): Promise<{
    user: UserDTO;
    stats: {
      postCount: number;
      commentCount: number;
      likedPostsCount: number;
      followingCount: number;
      followersCount: number;
    };
  }> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        post: true, // 실제 쿼리 포함 조건에 맞게 수정
        comment: true, // 실제 쿼리 포함 조건에 맞게 수정
        like: true, // 실제 쿼리 포함 조건에 맞게 수정
        following: true,
        followers: true,
        social_login: true, // 소셜 로그인 정보 포함
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // 개수 계산
    const postCount = user.post.length;
    const commentCount = user.comment.length;
    const likedPostsCount = user.like.length;
    const followingCount = user.following.length;
    const followersCount = user.followers.length;

    // 데이터 반환
    return {
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        encrypted_password: user.encrypted_password,
        profile_picture_url: user.profile_picture_url,
        phone_number: user.phone_number,
        email_verification_token: user.email_verification_token,
        points: user.points,
        level: user.level,
        is_email_verified: user.is_email_verified,
        role: user.role,
        account_status: user.account_status,
        sign_up_ip: user.sign_up_ip,
        created_at: user.created_at,
        last_login_at: user.last_login_at,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at,
        social_login: user.social_login.map((social) => ({
          social_login_id: social.social_login_id,
          user_id: social.user_id,
          provider: social.provider,
          provider_user_id: social.provider_user_id,
          created_at: social.created_at,
          updated_at: social.updated_at,
          deleted_at: social.deleted_at,
        })),
      },
      stats: {
        postCount,
        commentCount,
        likedPostsCount,
        followingCount,
        followersCount,
      },
    };
  }

  // 현재 로그인한 사용자의 정보 조회
  async getCurrentUser(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        post: {
          where: { deleted_at: null },
        },
        comment: {
          where: { deleted_at: null },
        },
        like: {
          where: { deleted_at: null },
        },
        following: true,
        followers: true,
        social_login: {
          where: { deleted_at: null },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profile_picture_url: user.profile_picture_url,
      points: user.points,
      level: user.level,
      today_task_count: user.today_task_count,
      role: user.role,
      account_status: user.account_status,
      created_at: user.created_at,
      last_login_at: user.last_login_at,

      stats: {
        postCount: user.post.length,
        commentCount: user.comment.length,
        likedPostsCount: user.like.length,
        followingCount: user.following.length,
        followersCount: user.followers.length,
      },
    };
  }
}
