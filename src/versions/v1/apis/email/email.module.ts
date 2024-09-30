import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'; // EJS 어댑터 추가
import { Module } from '@nestjs/common';
import * as config from 'config';
import { join } from 'path'; // 경로 설정을 위해 join을 사용
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: config.get<string>('mail.host'),
          port: config.get<number>('mail.port'),
          secure: true,
          auth: {
            user: config.get<string>('mail.user'),
            pass: config.get<string>('mail.pass'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get<string>('mail.from')}>`,
        },
        template: {
          dir: join(__dirname, '../../../../views/'), // 템플릿 파일이 있는 디렉토리 설정
          adapter: new EjsAdapter(), // EJS 어댑터 설정
          options: {
            strict: false, // EJS 옵션 설정
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
