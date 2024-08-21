import { Module } from '@nestjs/common';

<<<<<<< HEAD
import { InquiryModule } from './apis/inquiry';
// import { AuthModule } from './apis/auth';
// import { CommentsModule } from './apis/comments';
// import { FollowModule } from './apis/follow';
// import { LikesModule } from './apis/likes';
// import { PointsModule } from './apis/point';
// import { PostsModule } from './apis/posts';
// import { SearchModule } from './apis/search';
// import { UserModule } from './apis/user';
=======
import { AdBannerModule } from './apis/ad-banner';
import { AdminBlockModule } from './apis/admin-block';
import { AuthModule } from './apis/auth';
import { CommentsModule } from './apis/comments';
import { FollowModule } from './apis/follow';
import { InquiryModule } from './apis/inquiry';
import { LevelThresholdModule } from './apis/level';
import { LikesModule } from './apis/likes';
import { PointsModule } from './apis/point';
import { PostsModule } from './apis/posts';
import { ReportModule } from './apis/report';
import { SearchModule } from './apis/search';
import { UserModule } from './apis/user';
import { UserBlockModule } from './apis/userblock';
>>>>>>> 09162ff7ada4e088a004a97bf79e7e58f869d8b5

@Module({
  imports: [
    InquiryModule,
<<<<<<< HEAD
    // AuthModule,
    // UserModule,
    // PostsModule,
    // CommentsModule,
    // FollowModule,
    // PointsModule,
    // LikesModule,
    // SearchModule,
=======
    AuthModule,
    UserModule,
    PostsModule,
    CommentsModule,
    FollowModule,
    PointsModule,
    LikesModule,
    SearchModule,
    ReportModule,
    UserBlockModule,
    AdminBlockModule,
    LevelThresholdModule,
    AdBannerModule,
>>>>>>> 09162ff7ada4e088a004a97bf79e7e58f869d8b5
  ],
})
export class V1Module {}
