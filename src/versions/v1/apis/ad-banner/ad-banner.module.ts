// ad-banner.module.ts
import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { AdBannerController } from './ad-banner.controller';
import { AdBannerService } from './ad-banner.service';

@Module({
  controllers: [AdBannerController],
  providers: [AdBannerService, PrismaService],
})
export class AdBannerModule {}
