import { Module } from '@nestjs/common';
import { S3Controller } from './s3.controller';
import { S3Service } from './s3.service';

@Module({
  providers: [S3Service],
  controllers: [S3Controller],
  exports: [S3Service], // 다른 모듈에서 사용 가능
})
export class S3Module {}
