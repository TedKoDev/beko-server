import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WordService {
  constructor(private prisma: PrismaService) {}

  // 단어 3개 가져오기 (랜덤)
  async getWords() {
    const words = await this.prisma.wordlist.findMany({
      take: 3,
      orderBy: {
        word_id: 'asc',
      },
    });

    return words;
  }
}
