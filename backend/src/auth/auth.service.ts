import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';

import { SendOtpDto } from './dto/send-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

interface StaffRow extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  name: string;
  status: string;
}

interface PermissionRow extends RowDataPacket {
  key: string;
  label: string;
}

type Permission = {
  key: string;
  label: string;
};

type ModuleItem = {
  key: string;
  label: string;
  children: Permission[];
};

const OTP_LENGTH = 5;

const MODULE_MAP: Record<string, { key: string; label: string }> = {
  screening: {
    key: 'screening',
    label: 'คัดกรอง',
  },
  assignment: {
    key: 'assignment',
    label: 'มอบหมายงาน',
  },
  tracking: {
    key: 'tracking',
    label: 'ติดตามงาน',
  },
  operation: {
    key: 'operation',
    label: 'ผลการปฏิบัติงาน',
  },
  report: {
    key: 'report',
    label: 'รายงาน',
  },
  admin: {
    key: 'admin',
    label: 'ผู้ดูแลระบบ',
  },
};

function mapPermissionsToModules(permissions: Permission[]): ModuleItem[] {
  const moduleMap = new Map<string, ModuleItem>();

  for (const permission of permissions) {
    const prefix = permission.key.split('.')[0];
    const moduleInfo = MODULE_MAP[prefix];

    if (!moduleInfo) continue;

    if (!moduleMap.has(prefix)) {
      moduleMap.set(prefix, {
        key: moduleInfo.key,
        label: moduleInfo.label,
        children: [],
      });
    }

    moduleMap.get(prefix)!.children.push(permission);
  }

  return Array.from(moduleMap.values());
}

export function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown Device';

  let browser = 'Browser';
  let os = 'Unknown OS';

  // 1. Detect OS
  if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'MacOS';
  } else if (/iphone/i.test(ua)) {
    os = 'iPhone';
  } else if (/ipad/i.test(ua)) {
    os = 'iPad';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // 2. Detect Browser
  if (/edge|edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/chrome|crios/i.test(ua) && !/opr/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/opr/i.test(ua)) {
    browser = 'Opera';
  } else if (/wv/i.test(ua) || /webview/i.test(ua)) {
    browser = 'WebView';
  }

  return `${browser} on ${os}`;
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
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH;
    const code = Math.floor(min + Math.random() * (max - min)).toString();
    const expiresAt = Date.now() + 60 * 1000;

    this.otpStore.set(email, {
      code,
      expiresAt,
    });

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
        text: `รหัส OTP ของคุณคือ: ${code} (หมดอายุใน 1 นาที)`,
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

    const [existing] = await this.db.query<RowDataPacket[]>(
      `
      SELECT id
      FROM customers
      WHERE email = ?
      LIMIT 1
      `,
      [dto.email],
    );

    if (existing.length > 0) {
      throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.db.query<ResultSetHeader>(
      `
      INSERT INTO customers (
        name,
        surname,
        email,
        phone,
        password_hash,
        customer_type,
        organization_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
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

  async recordLoginLog(
    userType: 'customer' | 'staff',
    userId: number,
    ipAddress: string | null,
    userAgent: string | null,
    status: 'success' | 'failed',
    failReason: string | null = null,
  ): Promise<void> {
    const cleanUserAgent = userAgent ? parseUserAgent(userAgent) : null;
    await this.db.query(
      `
      INSERT INTO login_logs (user_type, user_id, ip_address, user_agent, status, fail_reason, login_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [userType, userId, ipAddress, cleanUserAgent, status, failReason],
    );
  }

  async login(
    dto: LoginDto,
    ipAddress: string | null = null,
    userAgent: string | null = null,
  ) {
    const [staffRows] = await this.db.query<StaffRow[]>(
      `
      SELECT
        id,
        email,
        password_hash AS password,
        concat(name, ' ', surname) AS name,
        status
      FROM staffs
      WHERE email = ?
      LIMIT 1
      `,
      [dto.email],
    );

    const staff = staffRows[0];

    if (!staff) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    if (staff.status !== 'active') {
      await this.recordLoginLog(
        'staff',
        staff.id,
        ipAddress,
        userAgent,
        'failed',
        'account_inactive',
      );
      throw new UnauthorizedException('บัญชีผู้ใช้ถูกระงับการใช้งาน');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, staff.password);

    if (!isPasswordValid) {
      await this.recordLoginLog(
        'staff',
        staff.id,
        ipAddress,
        userAgent,
        'failed',
        'invalid_password',
      );
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    await this.recordLoginLog('staff', staff.id, ipAddress, userAgent, 'success');

    const [permissionRows] = await this.db.query<PermissionRow[]>(
      `
      SELECT DISTINCT
        permissions.code AS \`key\`,
        permissions.name AS label
      FROM staff_team_roles
      INNER JOIN team_permissions
        ON team_permissions.team_id = staff_team_roles.team_id
      INNER JOIN permissions
        ON permissions.id = team_permissions.permission_id
      WHERE staff_team_roles.staff_id = ?
      ORDER BY permissions.id ASC
      `,
      [staff.id],
    );

    const permissions: Permission[] = permissionRows.map((row) => ({
      key: row.key,
      label: row.label,
    }));

    const modules = mapPermissionsToModules(permissions);

    return {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      modules,
    };
  }
}