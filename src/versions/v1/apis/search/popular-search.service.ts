import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable } from '@nestjs/common';
import { PopularSearchDto } from './dto/popular-search.dto';

@Injectable()
export class PopularSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async getPopularSearches(): Promise<PopularSearchDto[]> {
    const popularSearches = await this.prisma.popularSearchRank.findMany({
      orderBy: {
        search_count: 'desc', // 검색 횟수 기준으로 내림차순 정렬
      },
      take: 10, // 상위 10개의 검색어 반환
    });

    return popularSearches.map((search) => ({
      keyword: search.keyword,
      currentRank: search.current_rank,
      previousRank: search.previous_rank,
      rankChange: this.calculateRankChange(search),
      rankDifference: search.previous_rank
        ? search.previous_rank - search.current_rank
        : null,
      checkTime: search.check_time,
    }));
  }

  private calculateRankChange(search): 'UP' | 'DOWN' | 'NEW' | 'SAME' {
    if (!search.previous_rank) {
      return 'NEW';
    }
    if (search.current_rank < search.previous_rank) {
      return 'UP';
    }
    if (search.current_rank > search.previous_rank) {
      return 'DOWN';
    }
    return 'SAME';
  }

  async recordSearch(keyword: string) {
    const existingKeyword = await this.prisma.popularSearchRank.findFirst({
      where: { keyword },
    });

    if (existingKeyword) {
      // 이미 존재하는 검색어면 검색 횟수를 증가시킴
      await this.prisma.popularSearchRank.update({
        where: { id: existingKeyword.id },
        data: { search_count: { increment: 1 } },
      });
    } else {
      // 새로운 검색어면 추가
      await this.prisma.popularSearchRank.create({
        data: {
          keyword,
          search_count: 1,
          current_rank: 0, // 초기값, 나중에 순위 갱신 시 업데이트
          rank_change: 'NEW',
        },
      });
    }
  }
}
