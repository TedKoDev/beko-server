import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';

@Injectable()
export class CountryService {
  constructor(private prisma: PrismaService) {}

  // 모든 국가 조회
  async findAll() {
    try {
      const countries = await this.prisma.country.findMany({
        where: { deleted_at: null },
        select: {
          country_id: true,
          country_code: true,
          country_name: true,
          flag_icon: true,
          user_count: true,
        },
        orderBy: { country_name: 'asc' },
      });

      return countries;
    } catch (error) {
      throw new Error(`국가 목록을 가져오는데 실패했습니다: ${error.message}`);
    }
  }

  // 특정 국가 조회
  async findOne(countryCode: string) {
    const country = await this.prisma.country.findUnique({
      where: { country_code: countryCode },
    });

    if (!country) {
      throw new NotFoundException('국가를 찾을 수 없습니다.');
    }

    return country;
  }

  // 국가 생성
  async create(createCountryDto: CreateCountryDto) {
    return this.prisma.country.create({
      data: createCountryDto,
    });
  }

  // 국가별 사용자 수 업데이트
  async updateUserCount(countryCode: string, increment: boolean) {
    return this.prisma.country.update({
      where: { country_code: countryCode },
      data: {
        user_count: {
          [increment ? 'increment' : 'decrement']: 1,
        },
      },
    });
  }

  // 국가 삭제 (소프트 삭제)
  async remove(countryCode: string) {
    return this.prisma.country.update({
      where: { country_code: countryCode },
      data: { deleted_at: new Date() },
    });
  }

  // 국가 변경 시 카운트 업데이트 (트랜잭션 처리)
  async updateCountryForUser(
    userId: number,
    newCountryCode: string,
    oldCountryCode?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 이전 국가가 있다면 카운트 감소
      if (oldCountryCode) {
        await tx.country.update({
          where: { country_code: oldCountryCode },
          data: { user_count: { decrement: 1 } },
        });
      }

      // 새로운 국가의 카운트 증가
      await tx.country.update({
        where: { country_code: newCountryCode },
        data: { user_count: { increment: 1 } },
      });

      // 유저의 country_id 업데이트
      const newCountry = await tx.country.findUnique({
        where: { country_code: newCountryCode },
        select: { country_id: true },
      });

      return tx.users.update({
        where: { user_id: userId },
        data: { country_id: newCountry.country_id },
      });
    });
  }
}
