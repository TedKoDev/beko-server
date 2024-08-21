import { PrismaService } from '@/prisma'; // 실제 경로에 맞게 수정
import { Injectable } from '@nestjs/common';

@Injectable()
export class LevelThresholdService {
  constructor(private readonly prisma: PrismaService) {}

  // 레벨 기준 생성 또는 업데이트
  async createOrUpdateThreshold(
    level: number,
    min_posts: number,
    min_comments: number,
    min_likes: number,
    min_logins: number, // 추가된 필드
  ) {
    return this.prisma.levelthreshold.upsert({
      where: { level },
      update: { min_posts, min_comments, min_likes, min_logins },
      create: { level, min_posts, min_comments, min_likes, min_logins },
    });
  }
  // 모든 레벨 기준 가져오기
  async getAllThresholds() {
    return this.prisma.levelthreshold.findMany();
  }

  // 특정 레벨 기준 가져오기
  async getThresholdByLevel(level: number) {
    return this.prisma.levelthreshold.findUnique({ where: { level } });
  }

  // 특정 레벨 기준 삭제
  async deleteThreshold(level: number) {
    return this.prisma.levelthreshold.delete({ where: { level } });
  }
}
