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
      console.log('No words found for today, selecting new words...');
      await this.selectDailyWords();
    }

    // 매일 자정(한국 시간)에 실행 - 매분 체크용 로그 추가
    cron.schedule(
      '0 0 * * *',
      async () => {
        console.log(
          'Cron job triggered at midnight KST:',
          new Date().toISOString(),
        );
        await this.selectDailyWords();
      },
      {
        scheduled: true,
        timezone: 'Asia/Seoul',
      },
    );

    // 크론잡이 제대로 등록되었는지 확인
    console.log('Cron job scheduled for midnight KST');
  }

  private async selectDailyWords() {
    try {
      console.log('Starting daily word selection:', new Date().toISOString());

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 트랜잭션으로 처리
      await this.prisma.$transaction(async (tx) => {
        // 기존 선택된 단어들 삭제
        await tx.selected_words.deleteMany({
          where: {
            selected_date: today,
          },
        });

        // 새로운 단어 선택
        const randomWords = await tx.$queryRaw<Array<{ word_id: number }>>`
          SELECT word_id 
          FROM wordlist 
          WHERE deleted_at IS NULL 
          ORDER BY usage_count ASC, RANDOM() 
          LIMIT 3`;

        // 선택된 단어들 저장
        for (const word of randomWords) {
          await tx.selected_words.create({
            data: {
              word_id: word.word_id,
              selected_date: today,
            },
          });

          await tx.wordlist.update({
            where: { word_id: word.word_id },
            data: {
              usage_count: { increment: 1 },
              updated_at: new Date(),
            },
          });
        }
      });

      console.log('Daily word selection completed successfully');
    } catch (error) {
      console.error('Daily word selection failed:', error);
      throw error; // 에러를 다시 던져서 상위에서 처리할 수 있도록 함
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
        meaning_en: word.meaning_en,
        example_sentence: word.example_sentence,
        example_translation: word.example_translation,
        part_of_speech: word.part_of_speech,
        usage_count: word.usage_count,
      }));
    } catch (error) {
      console.error("Failed to fetch today's words:", error);
      return [];
    }
  }
}
