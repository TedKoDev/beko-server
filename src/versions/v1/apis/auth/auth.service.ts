import { PrismaService } from '@/prisma';
import { ROLE } from '@/types/v1'; // accountStatus import
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { accountStatus } from '@prisma/client';
import * as config from 'config';
import { pbkdf2Sync } from 'crypto';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email';

export const AUTH_SERVICE_TOKEN = 'AUTH_SERVICE_TOKEN';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService, // EmailService 주입
  ) {}
  // 구글 로그인

  // 회원가입
  async registerUser(email: string, password: string, name: string) {
    try {
      const existingEmailUser = await this.prisma.users.findUnique({
        where: { email },
      });

      if (existingEmailUser) {
        throw new HttpException(
          '이미 사용 중인 이메일입니다',
          HttpStatus.CONFLICT,
        );
      }

      const emailVerificationToken = uuidv4();
      const encryptedPassword = this._encryptPassword(password);

      let finalUsername = name;
      const existingUsernameUser = await this.prisma.users.findUnique({
        where: { username: name },
      });

      if (existingUsernameUser) {
        const uniqueSuffix = `#${uuidv4().slice(0, 8)}`;
        finalUsername = `${name}${uniqueSuffix}`;
      }

      const user = await this.prisma.users.create({
        data: {
          email,
          encrypted_password: encryptedPassword,
          username: finalUsername,
          email_verification_token: emailVerificationToken,
          is_email_verified: false,
          role: ROLE.USER,
          account_status: accountStatus.INACTIVE,
        },
      });

      try {
        await this.emailService.sendUserConfirmation(
          email,
          emailVerificationToken,
        );
      } catch (emailError) {
        // 이메일 전송 실패 시 생성된 유저 삭제
        await this.prisma.users.delete({ where: { user_id: user.user_id } });
        throw new HttpException(
          '이메일 전송에 실패했습니다',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      await this.prisma.point.create({
        data: {
          user_id: user.user_id,
          points_change: 2000,
          change_reason: 'New user registration',
        },
      });

      return {
        message: '회원가입이 완료되었습니다. 이메일 인증 링크를 확인해주세요.',
        username: finalUsername,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.code === 'P2002') {
        // Prisma unique constraint error
        throw new HttpException(
          '중복된 데이터가 존재합니다',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        '회원가입 처리 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 로그인
  async loginUser(email: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            post: true,
            comment: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException(
        '존재하지 않는 사용자입니다',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!this._comparePassword(password, user.encrypted_password)) {
      throw new HttpException(
        '비밀번호가 일치하지 않습니다',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.is_email_verified) {
      throw new HttpException('이메일 인증이 필요합니다', HttpStatus.FORBIDDEN);
    }

    const today = dayjs().startOf('day');
    const lastLogin = dayjs(user.last_login_at);

    if (!user.last_login_at || !lastLogin.isSame(today, 'day')) {
      await this.prisma.users.update({
        where: { user_id: user.user_id },
        data: {
          login_count: user.login_count + 1,
          last_login_at: new Date(),
        },
      });
    }

    await this.updateUserLevel(user.user_id);

    const payload = { userId: user.user_id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1w' });

    return {
      access_token: accessToken,
      user: user,
    };
  }

  // 이메일 인증
  async confirmEmail(token: string) {
    // 이메일 인증 토큰으로 유저를 찾음 (findUnique 대신 findFirst 사용)
    const user = await this.prisma.users.findFirst({
      where: { email_verification_token: token },
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    // 이메일 인증 처리
    await this.prisma.users.update({
      where: { user_id: user.user_id }, // 고유한 필드인 user_id 사용
      data: {
        is_email_verified: true,
        account_status: accountStatus.ACTIVE, // 인증 후 계정 활성화
        email_verification_token: null, // 토큰 삭제
      },
    });

    return { message: 'Email confirmed successfully!' };
  }

  // 유저레벨 업데이트
  private async updateUserLevel(userId: number) {
    const [postsCount, commentsCount, likesCount, user] = await Promise.all([
      this.prisma.post.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.comment.count({
        where: { user_id: userId, deleted_at: null },
      }),
      this.prisma.like.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.users.findUnique({
        where: { user_id: userId },
        select: { level: true, login_count: true },
      }),
    ]);

    const thresholds = await this.prisma.levelthreshold.findMany({
      orderBy: { level: 'asc' },
    });

    let newLevel = 1;
    for (const threshold of thresholds) {
      if (
        postsCount >= threshold.min_posts &&
        commentsCount >= threshold.min_comments &&
        likesCount >= threshold.min_likes &&
        user.login_count >= threshold.min_logins
      ) {
        newLevel = threshold.level;
      }
    }

    if (user.level !== newLevel) {
      await this.prisma.users.update({
        where: { user_id: userId },
        data: { level: newLevel },
      });
    }
  }

  // 커작 인증 토큰 발급
  async getKeojakToken(keojakCode: string) {
    const codeInfo = await this.prisma.authCode.findUnique({
      where: { keojak_code: keojakCode },
    });

    if (!codeInfo) {
      throw new Error('Invalid authorization code');
    }

    const isExpired = dayjs().isAfter(dayjs(codeInfo.expired_at));
    if (isExpired) {
      throw new Error('Authorization code expired');
    }

    const user = await this.prisma.users.findUnique({
      where: { user_id: codeInfo.user_id },
    });

    const payload = { userId: codeInfo.user_id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '12h' });
    return { access_token: accessToken };
  }

  // 사용자 정보
  async getUserInfo(userId: number) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
      // select: { user_id: true, email: true, username: true },
    });
  }

  // 사용자 정보 가져오기
  async getUserInfoBody(userId: number) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
      // select: { user_id: true, email: true, username: true },
    });
  }

  // 비밀번호 일치 여부 확인
  _comparePassword(password: string, encryptedPassword: string) {
    return this._encryptPassword(password) === encryptedPassword;
  }

  // 비밀번호 암호화
  _encryptPassword(password: string) {
    const salt = config.get<string>('pbkdf2.salt');
    const iterations = config.get<number>('pbkdf2.iterations');
    const keylen = config.get<number>('pbkdf2.keylen');
    const digest = config.get<string>('pbkdf2.digest');
    const pbkdf2 = pbkdf2Sync(password, salt, iterations, keylen, digest);
    return pbkdf2.toString('base64');
  }

  async checkEmail(email: string) {
    try {
      const existingUser = await this.prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new HttpException(
          '이미 사용 중인 이메일입니다',
          HttpStatus.CONFLICT,
        );
      }

      return { available: true, message: '사용 가능한 이메일입니다' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '이메일 확인 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkName(name: string) {
    try {
      const existingUser = await this.prisma.users.findUnique({
        where: { username: name },
      });

      if (existingUser) {
        throw new HttpException(
          '이미 사용 중인 이름입니다',
          HttpStatus.CONFLICT,
        );
      }

      return { available: true, message: '사용 가능한 이름입니다' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '이름 확인 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
