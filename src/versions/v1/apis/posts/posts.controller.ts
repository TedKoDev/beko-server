// src/posts/posts.controller.ts
import { Auth } from '@/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
@Controller({
  path: 'posts',
  version: '1',
})
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 게식글 작성
  @Auth(['ANY'])
  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId;
    return this.postsService.create(userId, createPostDto);
  }

  // 게시글 임시저장
  @Auth(['ANY'])
  @Post('draft')
  createDraft(
    @Body() createPostDto: CreatePostDto,
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId;
    return this.postsService.createDraft(userId, createPostDto);
  }

  // 임시저장된 게시글 목록 조회
  @Auth(['ANY'])
  @Get('drafts')
  findAllDrafts(@Req() req: { user: { userId: number } }) {
    const userId = req.user.userId;
    return this.postsService.findAllDrafts(userId);
  }

  @Auth(['ANY'])
  @Get()
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Req() req: { headers: { authorization: string } },
  ) {
    const authHeader = req.headers.authorization;
    return this.postsService.findAll(paginationQuery, authHeader);
  }

  @Auth(['ANY'])
  @Get('topics')
  getTopicsWithCategories() {
    return this.postsService.getTopicsWithCategories();
  }

  @Auth(['ANY'])
  @Get(':id')
  async findOne(@Param('id') id: number) {
    await this.postsService.incrementViewCount(id);
    return this.postsService.findOne(id);
  }

  @Auth(['ANY'])
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: { user: { userId: number; role: string } },
  ) {
    const userId = req.user.userId;
    return this.postsService.update(id, userId, updatePostDto);
  }

  @Auth(['ANY'])
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Req() req: { user: { userId: number; role: string } },
  ) {
    return this.postsService.remove(id, req.user.userId, req.user.role);
  }

  @Auth(['ANY'])
  @Get('categories/:topicId')
  getCategoriesByTopic(@Param('topicId') topicId: number) {
    return this.postsService.getCategoriesByTopic(topicId);
  }
}
