import { Controller, Get, Query } from '@nestjs/common';
import { GetLogCountDto } from './dto/logs.dto';
import { LogsService } from './logs.service';

@Controller({
  path: 'logs',
  version: '1',
})
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('count')
  async getLogCount(@Query() dto: GetLogCountDto) {
    return this.logsService.getLogCount(dto.type);
  }
}
