// src/auth/auth.module.ts
import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { EmailModule, EmailService } from '../email';
import { SlackModule } from '../utils/slack/slack.module';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { GoogleStrategy, JwtStrategy } from './strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    EmailModule,
    SlackModule,
  ], // SlackModule 추가
  providers: [
    AuthProvider,
    JwtStrategy,
    PrismaService,
    EmailService,
    GoogleStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthProvider, EmailService],
})
export class AuthModule {}
