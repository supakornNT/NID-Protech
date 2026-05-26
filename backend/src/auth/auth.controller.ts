import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import session from 'express-session';

import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

type SessionRequest = Request & {
  session: session.Session &
    Partial<session.SessionData> & {
      user?: {
        id: number;
        email: string;
      };
    };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(200)
  async sendOtp(@Body() dto: SendOtpDto) {
    await this.authService.sendOtp(dto);
    return { message: 'ส่ง OTP สำเร็จ' };
  }

  @Post('register')
  @HttpCode(201)
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
    return { message: 'ลงทะเบียนสำเร็จ' };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: SessionRequest) {
    const user = await this.authService.login(dto);

    req.session.user = {
      id: user.id,
      email: user.email,
    };

    return { message: 'login success' };
  }

  @Get('me')
  getMe(@Req() req: SessionRequest) {
    if (!req.session.user) {
      throw new UnauthorizedException();
    }

    return req.session.user;
  }

  @Post('logout')
  logout(@Req() req: SessionRequest) {
    req.session.destroy(() => {});
    return { message: 'logout success' };
  }
}