// src/posts/posts.module.ts
import { Module } from '@nestjs/common';

import { PrismaService } from '@/prisma/postsql-prisma.service';
import { WordController } from './word.controller';
import { WordService } from './word.service';

@Module({
  providers: [WordService, PrismaService],
  controllers: [WordController],
  exports: [WordService],
})
export class WordModule {}
