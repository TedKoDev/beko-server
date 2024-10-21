import { PrismaService } from '@/prisma';
import { ROLE } from '@/types/v1'; // accountStatus import
import { Injectable } from '@nestjs/common';
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
    const existingEmailUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingEmailUser) {
      throw new Error('Email is already in use');
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
        account_status: accountStatus.INACTIVE, // 이메일 인증 전 INACTIVE
      },
    });

    // 이메일 인증 링크 전송
    await this.emailService.sendUserConfirmation(email, emailVerificationToken);

    // 신규 유저 포인트 추가
    await this.prisma.point.create({
      data: {
        user_id: user.user_id,
        points_change: 2000,
        change_reason: 'New user registration',
      },
    });

    return {
      message:
        'User registered. Please check your email for verification link.',
      username: finalUsername,
    };
  }

  // 로그인
  async loginUser(email: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        user_id: true,
        encrypted_password: true,
        is_email_verified: true,
        level: true,
        last_login_at: true,
        login_count: true,
      },
    });

    if (!user || !this._comparePassword(password, user.encrypted_password)) {
      throw new Error('Invalid credentials or email not verified');
    }

    if (!user.is_email_verified) {
      throw new Error('Email not verified');
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

    const expiredAt = dayjs().add(1, 'minute').toDate();

    const existingAuthCode = await this.prisma.authCode.findUnique({
      where: { user_id: user.user_id },
    });

    if (existingAuthCode) {
      await this.prisma.authCode.delete({ where: { user_id: user.user_id } });
    }

    const { code, keojak_code } = await this.prisma.authCode.create({
      data: {
        user_id: user.user_id,
        expired_at: expiredAt,
      },
    });

    return { authCode: code, keojakCode: keojak_code };
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

  // 카페 24 인증 토큰 발급
  async getToken(code: string) {
    const codeInfo = await this.prisma.authCode.findUnique({ where: { code } });

    if (!codeInfo) {
      throw new Error('Invalid authorization code');
    }

    const isExpired = dayjs().isAfter(dayjs(codeInfo.expired_at));
    if (isExpired) {
      throw new Error('Authorization code expired');
    }

    const payload = { userId: codeInfo.user_id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1m' });
    return { access_token: accessToken };
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
      select: { user_id: true, email: true, username: true },
    });
  }

  // 사용자 정보 가져오기
  async getUserInfoBody(userId: number) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { user_id: true, email: true, username: true },
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
}
