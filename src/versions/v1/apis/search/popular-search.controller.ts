import { Controller, Get } from '@nestjs/common';
import { PopularSearchDto } from './dto/popular-search.dto';
import { PopularSearchService } from './popular-search.service';

@Controller({
  path: 'popular-search',
  version: '1',
})
export class PopularSearchController {
  constructor(private readonly popularSearchService: PopularSearchService) {}

  @Get()
  async getPopularSearches(): Promise<PopularSearchDto[]> {
    return this.popularSearchService.getPopularSearches();
  }
}
