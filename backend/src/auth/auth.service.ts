import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { SendOtpDto } from './dto/send-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private otpStore = new Map<string, OtpEntry>();

  constructor(@Inject('DB') private readonly db: Pool) {}

  async sendOtp(dto: SendOtpDto): Promise<void> {
    await this.sendOtpToEmail(dto.email);
  }

  async sendOtpToEmail(
    email: string,
    subject = 'รหัส OTP สำหรับยืนยันตัวตน',
  ): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    this.otpStore.set(email, { code, expiresAt });
    await this.sendOtpMail(email, code, subject);
  }

  async sendCustomOtpToEmail(
    email: string,
    code: string,
    subject = 'รหัส OTP สำหรับยืนยันตัวตน',
  ): Promise<void> {
    await this.sendOtpMail(email, code, subject);
  }

  private async sendOtpMail(
    email: string,
    code: string,
    subject: string,
  ): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new BadRequestException('ยังไม่ได้ตั้งค่า SMTP สำหรับส่ง OTP');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject,
        text: `รหัส OTP ของคุณคือ: ${code} (หมดอายุใน 5 นาที)`,
      });
    } catch (error) {
      console.error('ส่งอีเมลไม่สำเร็จ:', error);
      throw new BadRequestException('ไม่สามารถส่งอีเมล OTP ได้');
    }
  }

  verifyOtp(email: string, otp: string) {
    const entry = this.otpStore.get(email);

    if (!entry) {
      throw new BadRequestException('ไม่พบ OTP กรุณาขอ OTP ใหม่');
    }

    if (Date.now() > entry.expiresAt) {
      this.otpStore.delete(email);
      throw new BadRequestException('OTP หมดอายุแล้ว กรุณาขอ OTP ใหม่');
    }

    if (entry.code !== otp) {
      throw new BadRequestException('OTP ไม่ถูกต้อง');
    }

    this.otpStore.delete(email);
  }

  async register(dto: RegisterDto): Promise<void> {
    this.verifyOtp(dto.email, dto.otp);

    const [existing] = await this.db.query<any[]>(
      'SELECT id FROM customers WHERE email = ?',
      [dto.email],
    );

    if (existing.length > 0) {
      throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.db.query<ResultSetHeader>(
      'INSERT INTO customers (name, surname, email, phone, password_hash, customer_type, organization_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        dto.name,
        dto.surname,
        dto.email,
        dto.phone,
        hashedPassword,
        dto.customer_type,
        dto.organization_id ?? null,
        'pending',
      ],
    );
  }

    async login(dto: LoginDto) {
    if (dto.email !== 'test@gmail.com' || dto.password !== '1234') {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    return {
      id: 1,
      email: dto.email,
    };
  }
}
