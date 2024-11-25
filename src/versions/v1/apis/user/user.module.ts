import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { AuthService } from '../auth/auth.service';
import { CountryModule } from '../country/country.module';
import { UserController } from './user.controller';
import { UserProvider } from './user.provider';

@Module({
  imports: [AuthModule, CountryModule],
  providers: [PrismaService, UserProvider, AuthService],
  controllers: [UserController],
  exports: [UserProvider],
})
export class UserModule {}
