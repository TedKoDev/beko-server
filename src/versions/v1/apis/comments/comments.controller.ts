import { Auth } from '@/decorators';
import { ROLE } from '@/types/v1';
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller({
  path: 'comments',
  version: '1',
})
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Auth(['ANY'])
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId;
    return await this.commentsService.create(userId, createCommentDto);
  }

  @Auth(['ANY'])
  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return await this.commentsService.findAll(paginationQuery);
  }

  @Auth(['ANY'])
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(+id);
  }

  @Auth(['ANY'])
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: { user: { userId: number; role: ROLE } },
  ) {
    const userId = req.user.userId;
    return await this.commentsService.update(+id, userId, updateCommentDto);
  }

  @Auth(['ANY'])
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: { user: { userId: number; role: ROLE } },
  ) {
    return await this.commentsService.remove(
      +id,
      req.user.userId,
      req.user.role,
    );
  }

  @Auth(['ANY'])
  @Get(':id/replies')
  async findReplies(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return await this.commentsService.findReplies(+id, paginationQuery);
  }

  @Auth(['ANY'])
  @Patch(':id/select-as-answer')
  async selectAsAnswer(
    @Param('id') id: string,
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId;
    return await this.commentsService.selectCommentAsAnswer(+id, userId);
  }

  @Auth(['ANY', 'ADMIN'])
  @Post('consultation/:postId/answer')
  async answerConsultation(
    @Param('postId') postId: string,
    @Body() answerDto: { content: string },
    @Req() req: { user: { userId: number } },
  ) {
    const teacherId = req.user.userId;
    return await this.commentsService.answerConsultation(
      teacherId,
      +postId,
      answerDto.content,
    );
  }
}
