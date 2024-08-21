import { Auth } from '@/decorators';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateOrUpdateLevelThresholdDto, GetLevelThresholdDto } from './dto';
import { LevelThresholdService } from './level.service';

@Controller({
  path: 'level',
  version: '1',
})
export class LevelThresholdController {
  constructor(private readonly levelThresholdService: LevelThresholdService) {}

  // 레벨 기준 생성 또는 업데이트
  @Post()
  async createOrUpdateThreshold(@Body() body: CreateOrUpdateLevelThresholdDto) {
    const { level, min_posts, min_comments, min_likes, min_logins } = body;
    return this.levelThresholdService.createOrUpdateThreshold(
      level,
      min_posts,
      min_comments,
      min_likes,
      min_logins,
    );
  }

  // 모든 레벨 기준 조회
  @Auth(['ANY'])
  @Get()
  async getAllThresholds() {
    return this.levelThresholdService.getAllThresholds();
  }

  // 특정 레벨 기준 조회
  @Auth(['ANY'])
  @Get(':level')
  async getThresholdByLevel(@Param() params: GetLevelThresholdDto) {
    return this.levelThresholdService.getThresholdByLevel(params.level);
  }

  // 특정 레벨 기준 삭제
  @Auth(['ADMIN'])
  @Delete(':level')
  async deleteThreshold(@Param('level') level: number) {
    return this.levelThresholdService.deleteThreshold(level);
  }
}
