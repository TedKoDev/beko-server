import { Module } from '@nestjs/common';

import { InquiryModule } from './apis/inquiry';
// import { AuthModule } from './apis/auth';
// import { CommentsModule } from './apis/comments';
// import { FollowModule } from './apis/follow';
// import { LikesModule } from './apis/likes';
// import { PointsModule } from './apis/point';
// import { PostsModule } from './apis/posts';
// import { SearchModule } from './apis/search';
// import { UserModule } from './apis/user';

@Module({
  imports: [
    InquiryModule,
    // AuthModule,
    // UserModule,
    // PostsModule,
    // CommentsModule,
    // FollowModule,
    // PointsModule,
    // LikesModule,
    // SearchModule,
  ],
})
export class V1Module {}
