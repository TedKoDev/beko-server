import { PrismaService } from '@/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateAdBannerDto, UpdateAdBannerDto } from './dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class AdBannerService {
  constructor(private readonly prisma: PrismaService) {}

  async createAdBanner(dto: CreateAdBannerDto) {
    return this.prisma.adBanner.create({ data: dto });
  }

  async updateAdBanner(id: number, dto: UpdateAdBannerDto) {
    return this.prisma.adBanner.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(), // Ensure updated_at is set
      },
    });
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10, sort, search } = paginationQuery;
    const skip = (page - 1) * limit;

    // 기본적으로 최신순 정렬
    let orderBy: Prisma.AdBannerOrderByWithRelationInput = {
      created_at: 'desc',
    };

    // sort 값에 따라 정렬 순서를 변경
    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'popular') {
      orderBy = { view_count: 'desc' }; // 인기순 정렬 (조회수 기준)
    }

    return this.prisma.adBanner.findMany({
      where: {
        deleted_at: null,
        ...(search && {
          company_name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      skip,
      take: limit,
      orderBy,
    });
  }

  async findOne(id: number) {
    return this.prisma.adBanner.findFirst({
      where: { id, deleted_at: null },
    });
  }

  async remove(id: number) {
    return this.prisma.adBanner.update({
      where: { id },
      data: { deleted_at: new Date() }, // Set deleted_at to current date/time
    });
  }
}
