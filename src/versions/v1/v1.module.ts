import { Module } from '@nestjs/common';

import { AdBannerModule } from './apis/ad-banner';
import { AdminBlockModule } from './apis/admin-block';
import { AuthModule } from './apis/auth';
import { CommentsModule } from './apis/comments';
import { EmailModule } from './apis/email';
import { FollowModule } from './apis/follow';
import { InquiryModule } from './apis/inquiry';
import { LikesModule } from './apis/likes';
import { PointsModule } from './apis/point';
import { PostsModule } from './apis/posts';
import { ReportModule } from './apis/report';
import { SearchModule } from './apis/search';
import { UserModule } from './apis/user';
import { UserBlockModule } from './apis/userblock';
import { S3Module } from './apis/utils/s3service/s3.module';
import { SlackModule } from './apis/utils/slack/slack.module';

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
    EmailModule,
    SearchModule,
    SlackModule, // Import the Slack module
    S3Module, // Import the S3 module
  ],
})
export class V1Module {}
