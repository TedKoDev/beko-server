import { Auth } from '@/decorators';
import { Controller, Param, Post, Req } from '@nestjs/common';
import { LikesService } from './likes.service';
@Controller({
  path: 'likes',
  version: '1',
})
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Auth(['ANY'])
  @Post('post/:postId')
  async togglePostLike(
    @Param('postId') postId: number,
    @Req() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId;
    return this.likesService.togglePostLike(userId, postId);
  }
  @Auth(['ANY'])
  @Post('comment/:commentId')
  async toggleCommentLike(
    @Param('commentId') commentId: number,
    @Req() req: { user: { userId: number } },
  ) {
    try {
      console.log('[Toggle Comment Like] Request:', {
        commentId,
        userId: req.user.userId,
      });

      const result = await this.likesService.toggleCommentLike(
        req.user.userId,
        commentId,
      );

      console.log('[Toggle Comment Like] Response:', {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      console.error('[Toggle Comment Like] Error:', {
        error: error.message,
        commentId,
        userId: req.user.userId,
      });
      throw error;
    }
  }
}
