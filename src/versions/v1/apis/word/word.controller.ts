// src/posts/posts.controller.ts
import { Auth } from '@/decorators';
import { Controller, Get } from '@nestjs/common';

import { WordService } from './word.service';
@Controller({
  path: 'word',
  version: '1',
})
export class WordController {
  constructor(private readonly WordService: WordService) {}

  @Auth(['ANY'])
  @Get()
  async getWords() {
    return await this.WordService.getWords();
  }
}
