import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as config from 'config';
import { MongoPrismaService } from '../../../../prisma';
import { EmailModule } from '../email-2/email.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.get('jwt.secret'),
      signOptions: { expiresIn: '60m' },
    }),
    SupabaseModule,
    EmailModule,
  ],
  providers: [AuthService, JwtStrategy, MongoPrismaService],
  controllers: [AuthController],
})
export class AuthModule2 {}
