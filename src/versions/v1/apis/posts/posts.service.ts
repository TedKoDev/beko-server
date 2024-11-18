import { PrismaService } from '@/prisma/postsql-prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { postType, Prisma } from '@prisma/client';
import { MediaService } from '../media';
import { CreateMediaDto } from '../media/dto';
import { PointsService } from '../point/points.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
    private pointsService: PointsService, // PointsService 주입
  ) {}

  // 게시글 생성
  async create(userId: number, createPostDto: CreatePostDto, isDraft = false) {
    // 포인트 차감 로직 생략...

    // 게시글 생성
    const postCreateInput: Prisma.postCreateInput = {
      type: createPostDto.type,
      status: isDraft ? 'DRAFT' : 'PUBLIC',
      user: { connect: { user_id: userId } },
      ...(createPostDto.categoryId && {
        category: { connect: { category_id: createPostDto.categoryId } },
      }),
    };

    const post = await this.prisma.post.create({ data: postCreateInput });

    // 게시글 유형별 데이터 생성
    switch (createPostDto.type) {
      case postType.GENERAL:
        await this.prisma.post_general.create({
          data: {
            post_id: post.post_id,
            title: createPostDto.title,
            content: createPostDto.content,
          },
        });
        break;
      case postType.COLUMN:
        await this.prisma.post_column.create({
          data: {
            post_id: post.post_id,
            title: createPostDto.title,
            content: createPostDto.content,
          },
        });
        break;
      case postType.QUESTION:
        await this.prisma.post_question.create({
          data: {
            post_id: post.post_id,
            title: createPostDto.title,
            content: createPostDto.content,
            points: createPostDto.points,
            isAnswered: false,
          },
        });
        break;
      case postType.SENTENCE:
        await this.prisma.post_sentence.create({
          data: {
            post_id: post.post_id,
            title: createPostDto.title,
            content: createPostDto.content,
          },
        });

        // 로그 기록 및 사용자의 today_task_count 증가
        await Promise.all([
          this.incrementTodayTaskLog(),
          this.prisma.users.update({
            where: { user_id: userId },
            data: { today_task_count: { increment: 1 } },
          }),
        ]);
        break;
      default:
        throw new Error('Invalid post type');
    }

    // 미디어 데이터 생성
    if (createPostDto.media && createPostDto.media.length > 0) {
      const mediaData = createPostDto.media.map((media) => ({
        ...media,
        postId: post.post_id,
      }));
      await this.mediaService.createMedia(mediaData);
    }

    // 태그 데이터 생성
    if (createPostDto.tags && createPostDto.tags.length > 0) {
      await this.handleTags(post.post_id, createPostDto.tags, false);
    }

    return post;
  }

  // 임시저장 생성
  async createDraft(userId: number, createPostDto: CreatePostDto) {
    // 유저의 임시저장 글 개수 확인
    const draftCount = await this.prisma.post.count({
      where: {
        user_id: userId,
        status: 'DRAFT',
        type: createPostDto.type,
      },
    });

    if (draftCount >= 5) {
      throw new BadRequestException(
        'You can only have up to 5 drafts per type.',
      );
    }

    return this.create(userId, createPostDto, true);
  }

  // 임시저장 목록 조회
  async findAllDrafts(userId: number) {
    const drafts = await this.prisma.post.findMany({
      where: {
        user_id: userId,
        status: 'DRAFT',
      },
      include: {
        post_general: true,
        post_column: true,
        post_question: true,
        media: true,
      },
    });

    const integratedDrafts = drafts.map((post) => {
      let post_content = {};
      if (post.post_general) {
        post_content = {
          title: post.post_general.title,
          content: post.post_general.content,
        };
      } else if (post.post_column) {
        post_content = {
          title: post.post_column.title,
          content: post.post_column.content,
        };
      } else if (post.post_question) {
        post_content = {
          title: post.post_question.title,
          content: post.post_question.content,
          points: post.post_question.points,
          isAnswered: post.post_question.isAnswered,
        };
      }
      return {
        post_id: post.post_id,
        user_id: post.user_id,
        category_id: post.category_id,
        type: post.type,
        status: post.status,
        views: post.views,
        likes: post.likes,
        created_at: post.created_at,
        updated_at: post.updated_at,
        deleted_at: post.deleted_at,
        post_content,
        media: post.media,
      };
    });

    return integratedDrafts;
  }

  // 게시글 업데이트
  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { post_id: id },
      include: { user: true, post_question: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user_id !== userId) {
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException(
          'You do not have permission to update this post',
        );
      }
    }

    if (post.post_question && post.post_question.isAnswered) {
      throw new BadRequestException(
        'Cannot update a post that has been answered',
      );
    }

    if (
      updatePostDto.type === postType.QUESTION &&
      updatePostDto.points !== undefined
    ) {
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingPoints = post.post_question.points;

      if (user.points + existingPoints < updatePostDto.points) {
        throw new BadRequestException('Not enough points');
      }

      // 기존 포인트 반환
      await this.prisma.users.update({
        where: { user_id: userId },
        data: { points: { increment: existingPoints } },
      });

      // 기존 포인트 내역 추가
      await this.pointsService.create(userId, {
        pointsChange: existingPoints,
        changeReason: 'Question post updated',
      });

      // 새로운 포인트 차감
      await this.prisma.users.update({
        where: { user_id: userId },
        data: { points: { decrement: updatePostDto.points } },
      });

      // 새로운 포인트 내역 추가
      await this.pointsService.create(userId, {
        pointsChange: -updatePostDto.points,
        changeReason: 'Question post updated',
      });
    }

    // 게시글 업데이트 입력 데이터 생성
    const postUpdateInput: Prisma.postUpdateInput = {
      type: updatePostDto.type
        ? { set: updatePostDto.type as postType }
        : undefined,
      category: updatePostDto.categoryId
        ? { connect: { category_id: updatePostDto.categoryId } }
        : undefined,
    };

    // 게시글 업데이트
    const updatedPost = await this.prisma.post.update({
      where: { post_id: id },
      data: postUpdateInput,
    });

    // 게시글 유형별 데이터 업데이트
    switch (updatePostDto.type) {
      case postType.GENERAL:
        await this.prisma.post_general.update({
          where: { post_id: id },
          data: {
            title: updatePostDto.title,
            content: updatePostDto.content,
          },
        });
        break;
      case postType.COLUMN:
        await this.prisma.post_column.update({
          where: { post_id: id },
          data: {
            title: updatePostDto.title,
            content: updatePostDto.content,
          },
        });
        break;
      case postType.QUESTION:
        await this.prisma.post_question.update({
          where: { post_id: id },
          data: {
            title: updatePostDto.title,
            content: updatePostDto.content,
            points: updatePostDto.points, // 포인트 업데이트
            isAnswered: updatePostDto.isAnswered, // isAnswered 업데이트
          },
        });
        break;
      case postType.SENTENCE:
        await this.prisma.post_sentence.update({
          where: { post_id: id },
          data: {
            title: updatePostDto.title,
            content: updatePostDto.content,
          },
        });
        break;
      default:
        throw new Error('Invalid post type');
    }

    // 미디어 데이터 업데이트
    await this.mediaService.deleteMediaByPostId(updatedPost.post_id);

    if (updatePostDto.media && updatePostDto.media.length > 0) {
      const newMedia: CreateMediaDto[] = updatePostDto.media.map((media) => ({
        mediaUrl: media.mediaUrl,
        mediaType: media.mediaType,
        postId: updatedPost.post_id,
      }));
      await this.mediaService.createMedia(newMedia);
    }

    // 태그 데이터 업데이트
    await this.prisma.postTag.deleteMany({ where: { post_id: id } });

    if (updatePostDto.tags && updatePostDto.tags.length > 0) {
      await this.handleTags(updatedPost.post_id, updatePostDto.tags, false);
    }

    return updatedPost;
  }

  // 게시글 삭제
  async remove(postId: number, userId: number, userRole: string) {
    const post = await this.prisma.post.findUnique({
      where: { post_id: postId },
      include: { post_question: true, comment: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.post_question && !post.post_question.isAnswered) {
      throw new BadRequestException(
        'Cannot delete a question post before an answer is selected',
      );
    }

    if (userRole !== 'ADMIN' && post.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this post',
      );
    }

    // 포인트 반환 로직 추가 (질문 유형인 경우)
    if (post.post_question) {
      await this.prisma.users.update({
        where: { user_id: post.user_id },
        data: { points: { increment: post.post_question.points } },
      });

      await this.pointsService.create(post.user_id, {
        pointsChange: post.post_question.points,
        changeReason: 'Question post deleted',
      });
    }

    // 게시글 상태와 삭제 날짜 업데이트
    return this.prisma.post.update({
      where: { post_id: postId },
      data: {
        status: 'DELETED',
        deleted_at: new Date(),
      },
    });
  }

  // 태그 처리
  async handleTags(postId: number, tags: string[], isAdminTag: boolean) {
    for (const tagName of tags) {
      let tag = await this.prisma.tag.findUnique({
        where: { tag_name: tagName },
      });

      if (tag) {
        await this.prisma.tag.update({
          where: { tag_id: tag.tag_id },
          data: { usage_count: { increment: 1 } },
        });
      } else {
        tag = await this.prisma.tag.create({
          data: {
            tag_name: tagName,
            is_admin_tag: isAdminTag,
            usage_count: 1,
          },
        });
      }

      await this.prisma.postTag.create({
        data: {
          post_id: postId,
          tag_id: tag.tag_id,
        },
      });
    }
  }

  // 게시글 목록 조회 (페이지네이션 적용)
  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10, type, sort = 'latest' } = paginationQuery;
    const skip = (page - 1) * limit;

    const where: Prisma.postWhereInput = {
      status: 'PUBLIC',
      deleted_at: null,
    };

    if (type) {
      where.type = type;
    }

    const orderBy: Prisma.postOrderByWithRelationInput[] = [];
    if (sort === 'latest') {
      orderBy.push({ created_at: 'desc' });
    } else if (sort === 'oldest') {
      orderBy.push({ created_at: 'asc' });
    }

    // Prisma에서 게시글을 가져옴
    const [posts, totalCount] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: true,
          post_general: true,
          post_column: true,
          post_question: true,
          post_sentence: true,
          media: true,
          comment: {
            where: {
              deleted_at: null,
            },
            take: 3, // 최대 3개의 댓글만 가져오기
          },
        },
      }),
      this.prisma.post.count({
        where,
      }),
    ]);

    // 인기순 정렬 (likes * 2 + views)
    if (sort === 'popular') {
      posts.sort((a, b) => b.likes * 2 + b.views - (a.likes * 2 + a.views));
    }

    // 유형별 데이터를 post_content 필드로 통합하여 반환
    const integratedPosts = posts.map((post) => {
      let post_content = {};
      if (post.post_general) {
        post_content = {
          title: post.post_general.title,
          content: post.post_general.content,
        };
      } else if (post.post_column) {
        post_content = {
          title: post.post_column.title,
          content: post.post_column.content,
        };
      } else if (post.post_question) {
        post_content = {
          title: post.post_question.title,
          content: post.post_question.content,
          points: post.post_question.points,
          isAnswered: post.post_question.isAnswered,
        };
      } else if (post.post_sentence) {
        post_content = {
          title: post.post_sentence.title,
          content: post.post_sentence.content,
        };
      }
      return {
        post_id: post.post_id,
        user_id: post.user_id,
        username: post.user.username, // Include the user's name
        category_id: post.category_id,
        type: post.type,
        status: post.status,
        views: post.views,
        likes: post.likes,
        created_at: post.created_at,
        updated_at: post.updated_at,
        deleted_at: post.deleted_at,
        post_content,
        media: post.media,
        comments: post.comment,
      };
    });

    return {
      data: integratedPosts,
      total: totalCount,
      page,
      limit,
    };
  }

  // 특정 게시글 조회
  async findOne(id: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        post_id: id,
        // status: 'PUBLIC',
        deleted_at: null,
      },
      include: {
        user: true,
        post_general: true,
        post_column: true,
        post_question: true,
        media: {
          where: {
            deleted_at: null,
          },
        },
        comment: {
          where: {
            deleted_at: null,
          },
          take: 5, // 최대 5개의 댓글만 가져오기
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    let post_content = {};
    if (post.post_general) {
      post_content = {
        title: post.post_general.title,
        content: post.post_general.content,
      };
    } else if (post.post_column) {
      post_content = {
        title: post.post_column.title,
        content: post.post_column.content,
      };
    } else if (post.post_question) {
      post_content = {
        title: post.post_question.title,
        content: post.post_question.content,
        points: post.post_question.points,
        isAnswered: post.post_question.isAnswered,
      };
    }

    const integratedPost = {
      post_id: post.post_id,
      user_id: post.user_id,
      username: post.user.username, // Include the user's name
      category_id: post.category_id,
      type: post.type,
      status: post.status,
      views: post.views,
      likes: post.likes,
      created_at: post.created_at,
      updated_at: post.updated_at,
      deleted_at: post.deleted_at,
      post_content,
      media: post.media,
      comments: post.comment,
    };

    return integratedPost;
  }

  // 조회수 증가
  async incrementViewCount(id: number) {
    return this.prisma.post.update({
      where: { post_id: id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }

  // 클래스 내에 새로운 private 메서드 추가
  private async incrementTodayTaskLog() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 한국 시간 기준 당일 00:00:00

    const todayLog = await this.prisma.log.findFirst({
      where: {
        type: 'TODAY_TASK_PARTICIPATION',
        created_at: {
          gte: today,
        },
      },
    });

    if (todayLog) {
      await this.prisma.log.update({
        where: { log_id: todayLog.log_id },
        data: { count: { increment: 1 } },
      });
    } else {
      await this.prisma.log.create({
        data: {
          type: 'TODAY_TASK_PARTICIPATION',
          count: 1,
        },
      });
    }
  }
}
