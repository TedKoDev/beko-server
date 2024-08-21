import { PrismaService } from '@/prisma'; // 실제 경로에 맞게 수정
import { Module } from '@nestjs/common';
import { LevelThresholdController } from './level.controller';
import { LevelThresholdService } from './level.service';
@Module({
  controllers: [LevelThresholdController],
  providers: [LevelThresholdService, PrismaService],
})
export class LevelThresholdModule {}
