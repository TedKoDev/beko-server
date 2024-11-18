import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable } from '@nestjs/common';
import { LogType } from '@prisma/client';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async getLogCount(type: LogType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작시간으로 설정

    const log = await this.prisma.log.findFirst({
      where: {
        type,
        created_at: {
          gte: today,
        },
      },
      select: {
        count: true,
      },
    });

    return {
      type,
      count: log?.count ?? 0,
    };
  }
}
