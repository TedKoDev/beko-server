import { Module } from '@nestjs/common';

import { AdminBlockModule } from './apis/admin-block';
import { AuthModule } from './apis/auth';
import { CommentsModule } from './apis/comments';
import { FollowModule } from './apis/follow';
import { InquiryModule } from './apis/inquiry';
import { LikesModule } from './apis/likes';
import { PointsModule } from './apis/point';
import { PostsModule } from './apis/posts';
import { SearchModule } from './apis/search';
import { UserModule } from './apis/user';
import { UserBlockModule } from './apis/userblock';

@Module({
  imports: [
    InquiryModule,
    AuthModule,
    UserModule,
    UserBlockModule,
    AdminBlockModule,
    PostsModule,
    CommentsModule,
    FollowModule,
    PointsModule,
    LikesModule,
    SearchModule,
  ],
})
export class V1Module {}
