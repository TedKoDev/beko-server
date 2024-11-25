import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { SlackService } from '../utils/slack/slack.service';
import { AUTH_SERVICE_TOKEN, AuthService } from './auth.service';
import {
  ConfirmEmailDto,
  DevLoginDto,
  GetUserInfoBodyDto,
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
    private readonly slackService: SlackService,
  ) {}

  /** GET */
  @Get('confirm')
  async confirmEmail(@Query() dto: ConfirmEmailDto, @Res() res: Response) {
    const { token } = dto;
    await this.authService.confirmEmail(token);
    return res.send('이메일 인증이 완료되었습니다. 로그인해주세요.');
  }

  /** POST */
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const { email, name, password, country_id } = dto;
    console.log('country_id', country_id);
    const result = await this.authService.registerUser(
      email,
      password,
      name,
      country_id,
    );

    await this.slackService.sendMessage(
      '#알림봇테스트',
      `New user registered: ${name} (${email})`,
    );

    return result;
  }

  @Post('login')
  async Login(@Body() dto: DevLoginDto) {
    const { email, password } = dto;
    return this.authService.loginUser(email, password);
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
