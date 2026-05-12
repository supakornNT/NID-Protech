import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { SendOtpDto } from './dto/send-otp.dto';
import { RegisterDto } from './dto/register.dto';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private otpStore = new Map<string, OtpEntry>();

  constructor(@Inject('DB') private readonly db: Pool) {}

  async sendOtp(dto: SendOtpDto): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // หมดอายุใน 5 นาที

    this.otpStore.set(dto.email, { code, expiresAt });

    // log ไว้ทดสอบก่อน
    console.log(`OTP for ${dto.email}: ${code}`);

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
        to: dto.email,
        subject: 'รหัส OTP สำหรับลงทะเบียน',
        text: `รหัส OTP ของคุณคือ: ${code} (หมดอายุใน 5 นาที)`,
      });
    } catch (e) {
      console.error('ส่งอีเมลไม่สำเร็จ:', e);
    }
  }

  async register(dto: RegisterDto): Promise<void> {
    const entry = this.otpStore.get(dto.email);

    if (!entry) throw new BadRequestException('ไม่พบ OTP กรุณาขอ OTP ใหม่');
    if (Date.now() > entry.expiresAt) {
      this.otpStore.delete(dto.email);
      throw new BadRequestException('OTP หมดอายุแล้ว กรุณาขอ OTP ใหม่');
    }
    if (entry.code !== dto.otp) throw new BadRequestException('OTP ไม่ถูกต้อง');

    // เช็คว่า email ซ้ำไหม
    const [existing] = await this.db.query<any[]>(
      'SELECT id FROM customers WHERE email = ?',
      [dto.email],
    );
    if (existing.length > 0)
      throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว');

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

    this.otpStore.delete(dto.email);
  }
}
