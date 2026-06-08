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
  session: session.Session & Partial<session.SessionData>;
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

  @Get('register-options')
  async getRegisterOptions() {
    return this.authService.getRegisterOptions();
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: SessionRequest) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      req.ip ||
      null;
    const userAgent = req.headers['user-agent'] || null;

    const staff = await this.authService.login(dto, ipAddress, userAgent);

    req.session.staff = {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      modules: staff.modules,
    };

    return {
      message: 'login success',
    };
  }

  @Post('login/customer')
@HttpCode(200)
async customerLogin(
  @Body() dto: LoginDto,
  @Req() req: SessionRequest,
) {
  const ipAddress =
    (req.headers['x-forwarded-for'] as string) ||
    req.socket.remoteAddress ||
    req.ip ||
    null;

  const userAgent = req.headers['user-agent'] || null;

  const customer = await this.authService.customerLogin(
    dto,
    ipAddress,
    userAgent,
  );

  req.session.customer = {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    customerType: customer.customerType,
    organizationId: customer.organizationId,
  };

  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });

  return {
    message: 'login success',
    user: {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      customerType: customer.customerType,
      organizationId: customer.organizationId,
    },
  };
}
  @Get('me')
  getMe(@Req() req: SessionRequest) {
    if (!req.session.staff) {
      throw new UnauthorizedException();
    }

    const maxAge = req.session.cookie.maxAge;
    const sessionExpiresAt =
      typeof maxAge === 'number'
        ? new Date(Date.now() + maxAge).toISOString()
        : null;

    return {
      ...req.session.staff,
      sessionExpiresAt,
    };
  }

  @Get('me/customer')
  getCustomerMe(@Req() req: SessionRequest) {
    if (!req.session.customer) {
      throw new UnauthorizedException();
    }

    const maxAge = req.session.cookie.maxAge;
    const sessionExpiresAt =
      typeof maxAge === 'number'
        ? new Date(Date.now() + maxAge).toISOString()
        : null;

    return {
      ...req.session.customer,
      sessionExpiresAt,
    };
  }

  @Post('logout')
  logout(@Req() req: SessionRequest) {
    req.session.destroy(() => {});

    return {
      message: 'logout success',
    };
  }
}
