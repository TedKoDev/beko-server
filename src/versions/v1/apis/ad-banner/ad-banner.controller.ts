import { Auth } from '@/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query, // 추가
} from '@nestjs/common';
import { AdBannerService } from './ad-banner.service';
import { CreateAdBannerDto, UpdateAdBannerDto } from './dto';
import { PaginationQueryDto } from './dto/pagination-query.dto'; // 추가

@Controller({
  path: 'ad-banners',
  version: '1',
})
export class AdBannerController {
  constructor(private readonly adBannerService: AdBannerService) {}

  @Auth(['ADMIN'])
  @Post()
  create(@Body() createAdBannerDto: CreateAdBannerDto) {
    return this.adBannerService.createAdBanner(createAdBannerDto);
  }

  @Auth(['ADMIN'])
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.adBannerService.findAll(paginationQuery);
  }

  @Auth(['ADMIN'])
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.adBannerService.findOne(id);
  }

  @Auth(['ADMIN'])
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateAdBannerDto: UpdateAdBannerDto,
  ) {
    return this.adBannerService.updateAdBanner(id, updateAdBannerDto);
  }

  @Auth(['ADMIN'])
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.adBannerService.remove(id);
  }
}
