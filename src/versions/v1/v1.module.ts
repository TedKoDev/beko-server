import { Module } from '@nestjs/common';

import { AdBannerModule } from './apis/ad-banner';
import { AdminBlockModule } from './apis/admin-block';
import { AuthModule } from './apis/auth';
import { CommentsModule } from './apis/comments';
import { FollowModule } from './apis/follow';
import { InquiryModule } from './apis/inquiry';
import { LikesModule } from './apis/likes';
import { PointsModule } from './apis/point';
import { PostsModule } from './apis/posts';
import { ReportModule } from './apis/report';
import { SearchModule } from './apis/search';
import { SlackModule } from './apis/slack/slack.module';
import { UserModule } from './apis/user';
import { UserBlockModule } from './apis/userblock';

@Module({
  imports: [
    InquiryModule,
    AuthModule,
    UserModule,
    UserBlockModule,
    AdminBlockModule,
    AdBannerModule,
    PostsModule,
    CommentsModule,
    ReportModule,
    FollowModule,
    PointsModule,
    LikesModule,
    SearchModule,
    SlackModule, // Import the Slack module
  ],
})
export class V1Module {}
