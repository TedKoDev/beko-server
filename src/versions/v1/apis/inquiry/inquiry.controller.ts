import { CustomException } from '@/plugins';
import { ServiceName } from '@/types/v1';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import * as config from 'config';

import { EMAIL_SERVICE_TOKEN, EmailService } from '../email';
import { CreateInquiryDto } from './dto';
import { INQUIRY_SERVICE_TOKEN, InquiryService } from './inquiry.service';

@Controller({
  path: 'general-inquiry',
  version: '1',
})
export class InquiryController {
  constructor(
    @Inject(INQUIRY_SERVICE_TOKEN)
    private readonly inquiryService: InquiryService,
    @Inject(EMAIL_SERVICE_TOKEN)
    private readonly emailService: EmailService,
  ) {}

  @Post()
  async create(@Body() createGeneralInquiryDto: CreateInquiryDto) {
    try {
      const response = await this.inquiryService.create(
        createGeneralInquiryDto,
      );

      const serviceName =
        createGeneralInquiryDto.serviceType ===
        ServiceName.GENERAL_COFFEE_COORDINATOR
          ? '제너럴커피코디네이터'
          : createGeneralInquiryDto.serviceType === ServiceName.HONGI_GROUP
            ? '홍이그룹'
            : '커작어린이본부';

      await this.emailService.sendEmail({
        receiverEmail: config.get('mail.receiverEmail'),
        subject: `${serviceName} - ${createGeneralInquiryDto.inquiryType} 문의`,
        content: `
          이메일: ${createGeneralInquiryDto.email}\n
          내용:${createGeneralInquiryDto.message}\n
        `,
      });
      return response;
    } catch (error) {
      throw new CustomException({});
    }
  }
}
