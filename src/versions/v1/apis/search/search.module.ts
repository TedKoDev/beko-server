import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { PostsModule } from '../posts';
import { UserModule } from '../user';
import { PopularSearchController } from './popular-search.controller'; // 추가
import { PopularSearchService } from './popular-search.service'; // 추가
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [UserModule, PostsModule],
  controllers: [SearchController, PopularSearchController], // PopularSearchController 추가
  providers: [SearchService, PopularSearchService, PrismaService], // PopularSearchService 추가
})
export class SearchModule {}
