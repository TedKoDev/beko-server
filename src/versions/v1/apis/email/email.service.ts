import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

import { CreateEmailDto } from './email.dto';

export const EMAIL_SERVICE_TOKEN = 'EMAIL_SERVICE_TOKEN';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(email: string, token: string) {
    const url = `http://localhost:3000/api/v1/auth/confirm?token=${token}`;
    console.log(email, url);
    return this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Our App! Confirm your Email',
      template: 'confirmation', // 이메일 템플릿 (HTML 파일)
      context: {
        url, // 템플릿에서 사용할 URL
      },
    });
  }

  async sendEmail(createEmailDto: CreateEmailDto) {
    this.mailerService.sendMail({
      to: createEmailDto.receiverEmail,
      subject: createEmailDto.subject,
      text: createEmailDto.content,
    });
  }
}
