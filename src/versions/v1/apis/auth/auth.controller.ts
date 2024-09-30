import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as config from 'config';
import { Response } from 'express';

import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { SlackService } from '../utils/slack/slack.service';
import { AUTH_SERVICE_TOKEN, AuthService } from './auth.service';
import {
  AuthorizeDto,
  ConfirmEmailDto,
  DevLoginDto,
  GetTokenDto,
  GetUserInfoBodyDto,
  KeojakGetTokenDto,
  LoginUserDto,
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

  // Google 로그인 시작 경로
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    console.log(req);
    // Passport가 Google로 리디렉션합니다.
  }

  // Google 로그인 콜백 경로
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { user, token } = await this.authService.googleLogin(req); // 로그인 처리
    res.redirect(`/profile?token=${token}`); // JWT 토큰을 포함한 리디렉션
    console.log(user);
  }

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

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Res() res: Response) {
    const { email, password, redirect_uri, state } = dto;
    const result = await this.authService.loginUser(email, password);
    if (!result) {
      return res.status(401).send('Invalid credentials');
    }

    const redirectUrl = `${redirect_uri}?code=${result.authCode}&state=${state}&keojak_code=${result.keojakCode}`;
    res.redirect(redirectUrl);
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

  @Post('keojak-dev-login')
  async keojakDevLogin(@Body() dto: DevLoginDto) {
    const { email, password } = dto;
    const { keojakCode } = await this.authService.loginUser(email, password);
    const { access_token } = await this.authService.getKeojakToken(keojakCode);

    return { access_token };
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
}
