import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';

@Injectable()
export class WordService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // 서버 시작시 오늘의 단어가 없다면 선택
    const todayWords = await this.getWords();
    if (todayWords.length === 0) {
      await this.selectDailyWords();
    }

    // 매일 자정(한국 시간)에 실행
    cron.schedule(
      '0 0 * * *',
      async () => {
        await this.selectDailyWords();
      },
      {
        scheduled: true,
        timezone: 'Asia/Seoul',
      },
    );
  }

  private async selectDailyWords() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정

      // 기존 선택된 단어들 삭제
      await this.prisma.selected_words.deleteMany({
        where: {
          selected_date: today,
        },
      });

      // usage_count가 낮은 순으로 정렬하고, 같은 usage_count 내에서는 랜덤으로 선택
      const randomWords = await this.prisma.$queryRaw<
        Array<{ word_id: number }>
      >`
        SELECT word_id 
        FROM wordlist 
        WHERE deleted_at IS NULL 
        ORDER BY usage_count ASC, RANDOM() 
        LIMIT 3`;
      // 선택된 단어들 저장
      for (const word of randomWords) {
        await this.prisma.selected_words.create({
          data: {
            word_id: word.word_id,
            selected_date: today,
          },
        });

        // 선택된 단어의 usage_count 증가
        await this.prisma.wordlist.update({
          where: { word_id: word.word_id },
          data: {
            usage_count: { increment: 1 },
            updated_at: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Daily word selection failed:', error);
    }
  }

  async getWords() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정

      const todaysWords = await this.prisma.selected_words.findMany({
        where: {
          selected_date: today,
        },
        include: {
          word: true,
        },
      });

      return todaysWords.map(({ word }) => ({
        word_id: word.word_id,
        word: word.word,
        part_of_speech: word.part_of_speech,
        usage_count: word.usage_count,
      }));
    } catch (error) {
      console.error("Failed to fetch today's words:", error);
      return [];
    }
  }
}
