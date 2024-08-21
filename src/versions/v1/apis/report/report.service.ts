import { PrismaService } from '@/prisma';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateReportDto } from './dto/create-report.dto';
import {
  PaginationQueryDto,
  ReportSortOrder,
} from './dto/pagination-query.dto';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  // 신고 생성
  async createReport(createReportDto: CreateReportDto, reporterId: number) {
    const { target_type, target_id, reported_user_id, reason } =
      createReportDto;

    try {
      const report = await this.prisma.report.create({
        data: {
          target_type,
          target_id,
          reported_user_id,
          reporter_user_id: reporterId,
          reason,
        },
      });

      return report;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // Foreign key constraint failed
        if (error.code === 'P2003') {
          throw new HttpException(
            'Invalid foreign key reference. The reported or reporter user ID does not exist.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      // 다른 예상치 못한 오류 처리
      throw new HttpException(
        'An unexpected error occurred while creating the report.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 리포트 리스트 조회

  // 리포트 리스트 조회
  async getReports(paginationQuery: PaginationQueryDto) {
    const { page, limit, search, sortOrder } = paginationQuery;
    const skip = (page - 1) * limit;

    // 기본적으로 최신 순 정렬, 사용자가 정렬 순서를 지정한 경우 적용
    const orderBy: Prisma.reportOrderByWithRelationInput =
      sortOrder === ReportSortOrder.OLDEST
        ? { created_at: 'asc' }
        : { created_at: 'desc' };

    // 검색 조건 적용
    const where: Prisma.reportWhereInput = search
      ? {
          OR: [
            {
              reason: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
            {
              reported_user: {
                username: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
            {
              reporter_user: {
                username: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        }
      : {};

    const [reports, totalCount] = await Promise.all([
      this.prisma.report.findMany({
        skip,
        take: limit,
        orderBy,
        where,
        include: {
          reported_user: { select: { username: true, email: true } },
          reporter_user: { select: { username: true, email: true } },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      total: totalCount,
      page,
      limit,
    };
  }

  // 신고 상세 조회
  async getReportById(reportId: number) {
    return this.prisma.report.findUnique({
      where: { report_id: reportId },
      include: {
        reported_user: { select: { username: true, email: true } },
        reporter_user: { select: { username: true, email: true } },
        resolved_by: { select: { username: true } },
      },
    });
  }

  // 신고 상태 업데이트 (관리자가 신고를 처리)
  async updateReportStatus(
    reportId: number,
    status: 'RESOLVED' | 'REJECTED',
    resolvedByUserId: number,
  ) {
    return this.prisma.report.update({
      where: { report_id: reportId },
      data: {
        status,
        resolved_at: new Date(),
        resolved_by_user_id: resolvedByUserId,
      },
    });
  }
}
