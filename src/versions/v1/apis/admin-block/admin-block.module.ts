import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { AdminBlockController } from './admin-block.controller';
import { AdminBlockService } from './admin-block.service';

@Module({
  imports: [],
  controllers: [AdminBlockController],
  providers: [AdminBlockService, PrismaService],
})
export class AdminBlockModule {}
