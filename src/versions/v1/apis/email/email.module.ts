import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import * as config from 'config';

import { EmailProvider } from './email.provider';

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
      }),
    }),
  ],
  providers: [EmailProvider],
  exports: [EmailProvider],
})
export class EmailModule {}
