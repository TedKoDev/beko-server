import { PrismaService } from '@/prisma/postsql-prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SearchQueryDto } from './dto/search-query.dto';
import { PopularSearchService } from './popular-search.service';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,

    private popularSearchService: PopularSearchService, // 추가
  ) {}

  async search(queryDto: SearchQueryDto) {
    const { query, limit } = queryDto;

    if (!query) {
      return { postsByContent: [], postsByTag: [], users: [] };
    }
    // 인기 검색어 업데이트 로직 추가
    await this.popularSearchService.recordSearch(query); // 검색어 기록

    // 게시글(제목, 내용, 카테고리)
    const postContentWhere: Prisma.postWhereInput = {
      OR: [
        {
          post_general: {
            title: { contains: query, mode: 'insensitive' },
          },
        },
        {
          post_general: {
            content: { contains: query, mode: 'insensitive' },
          },
        },
        {
          post_column: {
            title: { contains: query, mode: 'insensitive' },
          },
        },
        {
          post_column: {
            content: { contains: query, mode: 'insensitive' },
          },
        },
        {
          post_question: {
            title: { contains: query, mode: 'insensitive' },
          },
        },
        {
          post_question: {
            content: { contains: query, mode: 'insensitive' },
          },
        },
        {
          category: {
            category_name: { contains: query, mode: 'insensitive' },
          },
        },
      ],
    };

    // 게시글(태그)
    const postTagWhere: Prisma.postWhereInput = {
      postTag: {
        some: {
          tag: { tag_name: { contains: query, mode: 'insensitive' } },
        },
      },
    };

    // 유저 검색
    const userWhere: Prisma.usersWhereInput = {
      username: { contains: query, mode: Prisma.QueryMode.insensitive },
    };

    const [postsByContent, postsByTag, users] = await Promise.all([
      this.prisma.post
        .findMany({
          where: postContentWhere,
          take: limit,
          include: {
            post_general: true,
            post_column: true,
            post_question: true,
            media: true,
            user: true,
            category: true,
            postTag: { include: { tag: true } },
          },
        })
        .then((posts) => posts.map((post) => this.integratePostContent(post))),
      this.prisma.post
        .findMany({
          where: postTagWhere,
          take: limit,
          include: {
            post_general: true,
            post_column: true,
            post_question: true,
            media: true,
            user: true,
            category: true,
            postTag: { include: { tag: true } },
          },
        })
        .then((posts) => posts.map((post) => this.integratePostContent(post))),
      this.prisma.users.findMany({
        where: userWhere,
        take: limit,
      }),
    ]);

    return {
      postsByContent,
      postsByTag,
      users,
    };
  }

  // 태그로 게시글 검색
  async searchPostsByTag(queryDto: SearchQueryDto) {
    const { query, page, limit } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.postWhereInput = {
      postTag: {
        some: {
          tag: { tag_name: { contains: query, mode: 'insensitive' } },
        },
      },
    };

    const [posts, totalPosts] = await Promise.all([
      this.prisma.post
        .findMany({
          where,
          skip,
          take: limit,
          include: {
            post_general: true,
            post_column: true,
            post_question: true,
            media: true,
            user: true,
            category: true,
            postTag: { include: { tag: true } },
          },
        })
        .then((posts) => posts.map((post) => this.integratePostContent(post))),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      total: totalPosts,
      page,
      limit,
    };
  }

  async searchPosts(queryDto: SearchQueryDto) {
    const { query, page, limit } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.postWhereInput = {
      OR: [
        {
          post_general: {
            title: { contains: query, mode: 'insensitive' },
          },
        },
        {
          post_general: {
            content: { contains: query, mode: 'insensitive' },
          },
        },
        {
          post_column: {
            title: { contains: query, mode: 'insensitive' },
          },
        },
        {
          post_column: {
            content: { contains: query, mode: 'insensitive' },
          },
        },
        {
          post_question: {
            title: { contains: query, mode: 'insensitive' },
          },
        },
        {
          post_question: {
            content: { contains: query, mode: 'insensitive' },
          },
        },
        {
          category: {
            category_name: { contains: query, mode: 'insensitive' },
          },
        },
        {
          postTag: {
            some: {
              tag: { tag_name: { contains: query, mode: 'insensitive' } },
            },
          },
        },
      ],
    };

    const [posts, totalPosts] = await Promise.all([
      this.prisma.post
        .findMany({
          where,
          skip,
          take: limit,
          include: {
            post_general: true,
            post_column: true,
            post_question: true,
            media: true,
            user: true,
            category: true,
            postTag: { include: { tag: true } },
          },
        })
        .then((posts) => posts.map((post) => this.integratePostContent(post))),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      total: totalPosts,
      page,
      limit,
    };
  }

  async searchUsers(queryDto: SearchQueryDto) {
    const { query, page, limit } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.usersWhereInput = {
      username: { contains: query, mode: Prisma.QueryMode.insensitive },
    };

    const [users, totalUsers] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      data: users,
      total: totalUsers,
      page,
      limit,
    };
  }

  private integratePostContent(post: any) {
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
      user: post.user,
      category: post.category,
      postTag: post.postTag,
    };
  }
}
