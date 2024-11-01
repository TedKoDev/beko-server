import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import * as config from 'config';
import { Response } from 'express';

import { JwtService } from '@nestjs/jwt';
import { SlackService } from '../utils/slack/slack.service';
import { AUTH_SERVICE_TOKEN, AuthService } from './auth.service';
import {
  AuthorizeDto,
  ConfirmEmailDto,
  DevLoginDto,
  GetTokenDto,
  GetUserInfoBodyDto,
  KeojakGetTokenDto,
  RegisterUserDto,
} from './dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE_TOKEN)
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly slackService: SlackService, // Inject SlackService
  ) {}

  /** GET */
  @Get('confirm')
  async confirmEmail(@Query() dto: ConfirmEmailDto, @Res() res: Response) {
    const { token } = dto;
    await this.authService.confirmEmail(token);
    return res.send('이메일 인증이 완료되었습니다. 로그인해주세요.');
  }

  @Get('authorize')
  async authorize(@Query() dto: AuthorizeDto, @Res() res: Response) {
    const { client_id, redirect_uri, response_type, state } = dto;
    const cafe24ClientId = config.get<string>('cafe24.clientId');
    const isInvalidRequest =
      response_type !== 'code' || client_id !== cafe24ClientId;
    if (isInvalidRequest) {
      return res.status(400).send('Invalid request');
    }

    res.render('login', {
      clientId: client_id,
      redirectUri: redirect_uri,
      state,
    });
  }

  /** POST */
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const { email, name, password } = dto;
    const result = await this.authService.registerUser(email, password, name);

    // Send a notification to Slack upon successful registration
    await this.slackService.sendMessage(
      '#알림봇테스트',
      `New user registered: ${name} (${email})`,
    );

    return result; // Ensure the result from the AuthService is returned
  }

  @Post('token')
  async getToken(@Body() dto: GetTokenDto) {
    const { code, client_id, client_secret, grant_type } = dto;
    if (grant_type !== 'authorization_code') {
      throw new Error('Unsupported grant type');
    }

    const innerClientId = config.get<string>('cafe24.clientId');
    const innerClientSecret = config.get<string>('cafe24.secret');
    if (client_id !== innerClientId || client_secret !== innerClientSecret) {
      throw new Error('Invalid client credentials');
    }

    return this.authService.getToken(code);
  }

  @Post('login')
  async Login(@Body() dto: DevLoginDto) {
    const { email, password } = dto;
    const { keojakCode, user } = await this.authService.loginUser(
      email,
      password,
    );
    const { access_token } = await this.authService.getKeojakToken(keojakCode);

    return { keojakCode, access_token, user };
  }

  @Post('keojak-token')
  async getKeojakToken(@Body() { keojakCode }: KeojakGetTokenDto) {
    return this.authService.getKeojakToken(keojakCode);
  }

  @Post('user-info-body')
  async getUserInfoBody(@Body() dto: GetUserInfoBodyDto) {
    const { access_token } = dto;
    const payload = this.jwtService.verify(access_token);
    return this.authService.getUserInfoBody(payload.userId);
  }

  @Post('check-email')
  async checkEmail(@Body('email') email: string) {
    return this.authService.checkEmail(email);
  }

  @Post('check-name')
  async checkName(@Body('name') name: string) {
    return this.authService.checkName(name);
  }
}
