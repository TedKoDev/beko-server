// app.module.ts
import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';

@Module({
  providers: [SlackService],
  exports: [SlackService], // Export to use in other modules
})
export class SlackModule {}
