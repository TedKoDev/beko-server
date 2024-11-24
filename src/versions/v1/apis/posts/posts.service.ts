import { PrismaService } from '@/prisma/postsql-prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { postType, Prisma } from '@prisma/client';
import { MediaService } from '../media';
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
    return this.prisma.$transaction(async (tx) => {
      // 질문 타입일 경우 포인트 체크
      if (createPostDto.type === postType.QUESTION && !isDraft) {
        const user = await tx.users.findUnique({
          where: { user_id: userId },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (user.points < createPostDto.points) {
          throw new BadRequestException('Not enough points');
        }

        // 포인트 차감
        await tx.users.update({
          where: { user_id: userId },
          data: { points: { decrement: createPostDto.points } },
        });

        // 포인트 내역 추가
        await tx.point.create({
          data: {
            user_id: userId,
            points_change: -createPostDto.points,
            change_reason: 'Question post created',
          },
        });
      }

      const postCreateInput: Prisma.postCreateInput = {
        type: createPostDto.type,
        status: isDraft ? 'DRAFT' : 'PUBLIC',
        user: { connect: { user_id: userId } },
        ...(createPostDto.categoryId && {
          category: { connect: { category_id: createPostDto.categoryId } },
        }),
      };

      const post = await tx.post.create({ data: postCreateInput });

      // 미디어 데이터 저장
      if (createPostDto.media && createPostDto.media.length > 0) {
        const mediaData = createPostDto.media.map((media) => ({
          media_url: media.mediaUrl,
          media_type: media.mediaType,
          post_id: post.post_id,
        }));

        await tx.media.createMany({ data: mediaData });
      }

      // 게시글 타입별 데이터 생성
      switch (createPostDto.type) {
        case postType.GENERAL:
          await tx.post_general.create({
            data: {
              post_id: post.post_id,
              title: createPostDto.title || '',
              content: createPostDto.content,
            },
          });
          break;
        case postType.COLUMN:
          await tx.post_column.create({
            data: {
              post_id: post.post_id,
              title: createPostDto.title || '',
              content: createPostDto.content,
            },
          });
          break;
        case postType.QUESTION:
          await tx.post_question.create({
            data: {
              post_id: post.post_id,
              title: createPostDto.title || '',
              content: createPostDto.content,
              points: createPostDto.points || 0,
            },
          });
          break;
        case postType.SENTENCE:
          await tx.post_sentence.create({
            data: {
              post_id: post.post_id,
              title: createPostDto.title || '',
              content: createPostDto.content,
            },
          });

          // today_task_count 증가
          await tx.users.update({
            where: { user_id: userId },
            data: { today_task_count: { increment: 1 } },
          });

          // 로그 기록
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todayLog = await tx.log.findFirst({
            where: {
              type: 'TODAY_TASK_PARTICIPATION',
              created_at: { gte: today },
            },
          });

          if (todayLog) {
            await tx.log.update({
              where: { log_id: todayLog.log_id },
              data: { count: { increment: 1 } },
            });
          } else {
            await tx.log.create({
              data: {
                type: 'TODAY_TASK_PARTICIPATION',
                count: 1,
              },
            });
          }
          break;
        case postType.CONSULTATION:
          await tx.post_consultation.create({
            data: {
              post_id: post.post_id,
              student_id: userId,
              title: createPostDto.title || '',
              content: createPostDto.content,
              base_price: createPostDto.basePrice || 0,
              is_private: createPostDto.isPrivate ?? true,
              status: 'PENDING',
            },
          });
          break;
        default:
          throw new Error('Invalid post type');
      }

      return post;
    });
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
        post_sentence: true,
        media: true,
        category: true, // Include category details
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
        category_name: post.category?.category_name, // Include category name
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
  async update(postId: number, userId: number, updatePostDto: UpdatePostDto) {
    console.log('Update Data ', updatePostDto);

    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findFirst({
        where: {
          post_id: postId,
          user_id: userId,
          deleted_at: null,
        },
        include: { media: true },
      });

      if (!post) {
        throw new NotFoundException('Post not found or unauthorized');
      }

      // 미디어 리
      if (updatePostDto.media) {
        // 기존 미디어 ID 목록
        const existingMediaIds = updatePostDto.media
          .filter((media) => media.mediaId)
          .map((media) => media.mediaId);

        // 기존 미디어 중 업데이트할 미디어가 아닌 것들은 삭제
        await tx.media.updateMany({
          where: {
            post_id: postId,
            deleted_at: null,
            NOT: {
              media_id: { in: existingMediaIds },
            },
          },
          data: { deleted_at: new Date() },
        });

        // 미디어 처리
        for (const media of updatePostDto.media) {
          if (media.mediaId) {
            // 기존 미디어 업데이트
            await tx.media.update({
              where: { media_id: media.mediaId },
              data: {
                media_url: media.mediaUrl,
                media_type: media.mediaType,
                updated_at: new Date(),
              },
            });
          } else {
            // 새로운 미디어 생성
            await tx.media.create({
              data: {
                post_id: postId,
                media_url: media.mediaUrl,
                media_type: media.mediaType,
              },
            });
          }
        }
      }

      // 게시글 타입별 내용 업데이트
      switch (post.type) {
        case 'GENERAL':
          await tx.post_general.update({
            where: { post_id: postId },
            data: {
              title: updatePostDto.title,
              content: updatePostDto.content,
            },
          });
          break;
        case 'COLUMN':
          await tx.post_column.update({
            where: { post_id: postId },
            data: {
              title: updatePostDto.title,
              content: updatePostDto.content,
            },
          });
          break;
        case 'QUESTION':
          await tx.post_question.update({
            where: { post_id: postId },
            data: {
              title: updatePostDto.title,
              content: updatePostDto.content,
              points: updatePostDto.points,
              isAnswered: updatePostDto.isAnswered,
            },
          });
          break;
        case 'SENTENCE':
          await tx.post_sentence.update({
            where: { post_id: postId },
            data: {
              title: updatePostDto.title,
              content: updatePostDto.content,
            },
          });
          break;
        case 'CONSULTATION':
          await tx.post_consultation.update({
            where: { post_id: postId },
            data: {
              title: updatePostDto.title,
              content: updatePostDto.content,
              base_price: updatePostDto.basePrice,
              status: updatePostDto.consultationStatus,
              is_private: updatePostDto.isPrivate,
              teacher_id: updatePostDto.teacherId,
              completed_at:
                updatePostDto.consultationStatus === 'COMPLETED'
                  ? new Date()
                  : null,
            },
          });

          // post 테이블의 status도 함께 업데이트
          if (updatePostDto.status) {
            await tx.post.update({
              where: { post_id: postId },
              data: {
                status: updatePostDto.status,
              },
            });
          }
          break;
      }

      // 메인 게시글 업데이트
      await tx.post.update({
        where: { post_id: postId },
        data: {
          updated_at: new Date(),
          ...(updatePostDto.categoryId && {
            category: { connect: { category_id: updatePostDto.categoryId } },
          }),
        },
      });

      return this.findOne(postId);
    });
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
          post_consultation: true,
          media: true,
          comment: {
            where: {
              deleted_at: null,
            },
            take: 3, // 최대 3개의 댓글만 가져오기
          },
          category: true, // Include category details
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
      } else if (post.post_consultation) {
        post_content = {
          title: post.post_consultation.title,
          content: post.post_consultation.content,
          base_price: post.post_consultation.base_price,
          status: post.post_consultation.status,
          is_private: post.post_consultation.is_private,
          student_id: post.post_consultation.student_id,
          teacher_id: post.post_consultation.teacher_id,
          completed_at: post.post_consultation.completed_at,
        };
      }
      return {
        post_id: post.post_id,
        user_id: post.user_id,
        username: post.user.username, // Include the user's name
        category_id: post.category_id,
        user_profile_picture_url: post.user.profile_picture_url,
        user_level: post.user.level,
        category_name: post.category?.category_name, // Include category name
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
        deleted_at: null,
      },
      include: {
        user: true,
        post_general: true,
        post_column: true,
        post_question: true,
        post_sentence: true,
        media: {
          where: {
            deleted_at: null,
          },
        },
        comment: {
          where: {
            deleted_at: null,
          },
          take: 5,
          include: {
            user: {
              select: {
                user_id: true,
                username: true,
                profile_picture_url: true,
                level: true,
              },
            },
            media: {
              where: {
                deleted_at: null,
              },
            },
            _count: {
              select: {
                childComments: {
                  where: {
                    deleted_at: null,
                  },
                },
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
        _count: {
          select: {
            comment: {
              where: {
                deleted_at: null,
              },
            },
          },
        },
        category: true,
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
    } else if (post.post_sentence) {
      post_content = {
        title: post.post_sentence.title,
        content: post.post_sentence.content,
      };
    }

    const integratedPost = {
      post_id: post.post_id,
      user_id: post.user_id,
      username: post.user.username,
      user_profile_picture_url: post.user.profile_picture_url,
      user_level: post.user.level,
      category_id: post.category_id,
      category_name: post.category?.category_name,
      type: post.type,
      status: post.status,
      views: post.views,
      likes: post.likes,
      created_at: post.created_at,
      updated_at: post.updated_at,
      deleted_at: post.deleted_at,
      post_content,
      media: post.media,
      comments: post.comment.map((comment) => ({
        ...comment,
        reply_count: comment._count.childComments,
      })),
      comment_count: post._count.comment,
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

  // 특정 토픽의 카테고리 조회
  async getCategoriesByTopic(topicId: number) {
    const topic = await this.prisma.topic.findFirst({
      where: {
        topic_id: topicId,
        deleted_at: null,
      },
      select: {
        topic_id: true,
        title: true,
        category: {
          where: {
            deleted_at: null,
          },
          select: {
            category_id: true,
            category_name: true,
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  // 모든 토픽과 카테고리 조회
  async getTopicsWithCategories() {
    return this.prisma.topic.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        topic_id: true,
        title: true,
        category: {
          where: {
            deleted_at: null,
          },
          select: {
            category_id: true,
            category_name: true,
          },
        },
      },
    });
  }
}
