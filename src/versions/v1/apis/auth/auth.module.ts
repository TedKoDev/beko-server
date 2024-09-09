// src/auth/auth.module.ts
import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email';
import { SlackModule } from '../slack/slack.module'; // SlackModule을 가져오기
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { JwtStrategy } from './strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    EmailModule,
    SlackModule,
  ], // SlackModule 추가
  providers: [AuthProvider, JwtStrategy, PrismaService],
  controllers: [AuthController],
  exports: [AuthProvider],
})
export class AuthModule {}
