import { Module } from '@nestjs/common';

import { AdBannerModule } from './apis/ad-banner';
import { AdminBlockModule } from './apis/admin-block';
import { AuthModule } from './apis/auth';
import { CommentsModule } from './apis/comments';
import { CountryModule } from './apis/country/country.module';
import { EmailModule } from './apis/email';
import { FollowModule } from './apis/follow';
import { LikesModule } from './apis/likes';
import { LogsModule } from './apis/logsdata';
import { PointsModule } from './apis/point';
import { PostsModule } from './apis/posts';
import { ReportModule } from './apis/report';
import { SearchModule } from './apis/search';
import { UserModule } from './apis/user';
import { UserBlockModule } from './apis/userblock';
import { S3Module } from './apis/utils/s3service/s3.module';
import { SlackModule } from './apis/utils/slack/slack.module';
import { WordModule } from './apis/word';

@Module({
  imports: [
    AuthModule,
    UserModule,
    UserBlockModule,
    AdminBlockModule,
    AdBannerModule,
    PostsModule,
    CommentsModule,
    ReportModule,
    WordModule,
    FollowModule,
    PointsModule,
    LikesModule,
    EmailModule,
    WordModule,
    SearchModule,
    SlackModule, // Import the Slack module
    S3Module, // Import the S3 module
    LogsModule,
    CountryModule,
  ],
})
export class V1Module {}
