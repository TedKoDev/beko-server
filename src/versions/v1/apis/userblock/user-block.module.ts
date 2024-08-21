import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { UserBlockController } from './user-block.controller';
import { UserBlockService } from './user-block.service';

@Module({
  providers: [UserBlockService, PrismaService],
  controllers: [UserBlockController],
})
export class UserBlockModule {}
