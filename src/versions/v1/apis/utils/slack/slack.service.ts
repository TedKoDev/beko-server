// slack.service.ts
import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';

@Injectable()
export class SlackService {
  private slackClient: WebClient;

  constructor() {
    this.slackClient = new WebClient(process.env.SLACK_API_TOKEN); // Use your token
  }

  async sendMessage(channel: string, text: string): Promise<void> {
    await this.slackClient.chat.postMessage({
      channel,
      text,
    });
  }
}
