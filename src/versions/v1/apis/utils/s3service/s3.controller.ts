import { Controller, Get, Query } from '@nestjs/common';
import { S3Service } from './s3.service';

@Controller({
  path: 's3',
  version: '1',
})
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get('presigned-url')
  async getPresignedUrl(
    @Query('fileName') fileName: string,
    @Query('fileType') fileType: string,
  ) {
    const url = await this.s3Service.getPresignedUrl(fileName, fileType);
    return { url };
  }
}
