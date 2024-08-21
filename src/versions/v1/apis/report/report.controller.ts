import { Auth } from '@/decorators';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ReportService } from './report.service';

@Controller({
  path: 'report',
  version: '1',
})
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @Auth(['ANY'])
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @Req() req: { user: { userId: number } },
  ) {
    const reporterId = req.user.userId;
    const report = await this.reportService.createReport(
      createReportDto,
      reporterId,
    );
    return {
      message: 'Report created successfully',
      report,
    };
  }

  @Get()
  @Auth(['ADMIN'])
  async getReports(@Query() paginationQuery: PaginationQueryDto) {
    return this.reportService.getReports(paginationQuery);
  }

  @Get(':id')
  @Auth(['ADMIN'])
  async getReportById(@Param('id') reportId: number) {
    return this.reportService.getReportById(reportId);
  }

  @Patch(':id/status')
  @Auth(['ADMIN'])
  async updateReportStatus(
    @Param('id') reportId: number,
    @Body('status') status: 'RESOLVED' | 'REJECTED',
    @Req() req: { user: { userId: number } },
  ) {
    const resolvedByUserId = req.user.userId;
    const report = await this.reportService.updateReportStatus(
      reportId,
      status,
      resolvedByUserId,
    );
    return {
      message: `Report ${status.toLowerCase()} successfully`,
      report,
    };
  }
}
