import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import { AuthService } from '@/auth/auth.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ResetCustomerPasswordDto } from './dto/reset-customer-password.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import type { Customer } from './interfaces/customer.interface';
import {
  AdminCustomer,
  CountRow,
  GetCustomersQuery,
  PublicAdminCustomerList,
} from './interfaces/admin.interface';
import {
  ACTIVE_STATUS_VALUES,
  getCountTotal,
  optionalEmail,
  optionalPhone,
  optionalText,
  positiveIntFromQuery,
  requireText,
} from '@/common/validation/input-rules';

function parsePositiveOptionalId(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new BadRequestException(`${fieldName} must be a positive integer`);
  }

  return parsed;
}

function parseCitizenId(value: unknown) {
  const normalized = optionalText(value, 'citizenId', 13);

  if (!normalized) {
    return null;
  }

  if (!/^\d{13}$/.test(normalized)) {
    throw new BadRequestException('citizenId must contain 13 digits');
  }

  return normalized;
}

function parseRequiredEmail(value: unknown) {
  const normalized = requireText(value, 'email', 255).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new BadRequestException('email must be a valid email');
  }

  return normalized;
}

function requireFiveDigitOtp(value: unknown) {
  const normalized = requireText(value, 'otp', 5);

  if (!/^\d{5}$/.test(normalized)) {
    throw new BadRequestException('otp must contain exactly 5 digits');
  }

  return normalized;
}

@Injectable()
export class CustomersService {
  constructor(
    @Inject('DB') private readonly db: Pool,
    private readonly authService: AuthService,
  ) {}

  private async ensureUniqueEmail(email: string, excludeId?: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `
      SELECT id
      FROM customers
      WHERE LOWER(email) = LOWER(?)
        ${excludeId ? 'AND id <> ?' : ''}
      LIMIT 1
    `,
      excludeId ? [email, excludeId] : [email],
    );

    if (rows.length > 0) {
      throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว');
    }
  }

  private async ensureUniqueCitizenId(
    citizenId: string | null,
    excludeId?: number,
  ) {
    if (!citizenId) {
      return;
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      `
      SELECT id
      FROM customers
      WHERE citizen_id = ?
        ${excludeId ? 'AND id <> ?' : ''}
      LIMIT 1
    `,
      excludeId ? [citizenId, excludeId] : [citizenId],
    );

    if (rows.length > 0) {
      throw new BadRequestException('เลขบัตรประชาชนนี้ถูกใช้งานแล้ว');
    }
  }

  private async ensurePrefixExists(prefixId: number | null) {
    if (!prefixId) {
      return;
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT id FROM prefixes WHERE id = ? LIMIT 1',
      [prefixId],
    );

    if (rows.length === 0) {
      throw new BadRequestException('prefixId does not exist');
    }
  }

  private async ensureOrganizationExists(organizationId: number | null) {
    if (!organizationId) {
      return;
    }

    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT id FROM organizations WHERE id = ? LIMIT 1',
      [organizationId],
    );

    if (rows.length === 0) {
      throw new BadRequestException('organizationId does not exist');
    }
  }

  async findAll(): Promise<Customer[]> {
    const [rows] = await this.db.query<Customer[]>(
      `SELECT
      customers.id,
      customers.prefix_id,
      customers.name,
      customers.surname,
      customers.email,
      customers.phone,
      customers.citizen_id,
      customers.customer_type,
      customers.organization_id,
      customers.password_hash,
      customers.status,
      customers.created_at,
      customers.updated_at
      FROM customers
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<Customer | null> {
    const [rows] = await this.db.query<Customer[]>(
      `SELECT
      customers.id,
      customers.prefix_id,
      customers.name,
      customers.surname,
      customers.email,
      customers.phone,
      customers.citizen_id,
      customers.customer_type,
      customers.organization_id,
      customers.password_hash,
      customers.status,
      customers.created_at,
      customers.updated_at
      FROM customers
      WHERE customers.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }
  async findName(id: number): Promise<Customer | null> {
    const [rows] = await this.db.query<Customer[]>(
      `SELECT
      customers.name,
      customers.surname,
      customers.email,
      customers.phone,
      customers.organization_id
      FROM customers
      WHERE customers.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }
  async findUnapproved(
    query: GetCustomersQuery,
  ): Promise<PublicAdminCustomerList> {
    const page = positiveIntFromQuery(query.page, 'page', 1);
    const limit = positiveIntFromQuery(query.limit, 'limit', 10, 100);
    const offset = (page - 1) * limit;
    const search = optionalText(query.search, 'search', 255) ?? '';

    const whereClauses = [`customers.status = 'pending'`];
    const params: Array<string | number> = [];

    if (search) {
      whereClauses.push(`(
        customers.name LIKE ?
        OR customers.surname LIKE ?
        OR customers.email LIKE ?
        OR customers.phone LIKE ?
      )`);
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    const whereSql = whereClauses.join(' AND ');

    const [countRows] = await this.db.query<CountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM customers
        WHERE ${whereSql}
      `,
      params,
    );

    const [rows] = await this.db.query<AdminCustomer[]>(
      `
        SELECT
          customers.id,
          CONCAT(customers.name, ' ', customers.surname) AS name,
          customers.email,
          customers.phone,
          customers.customer_type AS customerType,
          organizations.name AS organizationName,
          customers.status,
          customers.created_at AS createdAt,
          customers.updated_at AS updatedAt
        FROM customers
        LEFT JOIN organizations
          ON organizations.id = customers.organization_id
        WHERE ${whereSql}
        ORDER BY customers.created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    const total = getCountTotal(countRows, 0);

    return {
      items: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateCustomerDto): Promise<Customer | null> {
    const prefixId = parsePositiveOptionalId(
      dto.prefixId ?? dto.prefix_id,
      'prefixId',
    );
    const name = requireText(dto.name, 'name', 255);
    const surname = optionalText(dto.surname, 'surname', 255) ?? null;
    const email = parseRequiredEmail(dto.email);
    const phone = optionalPhone(dto.phone, 'phone', 20) ?? null;
    const citizenId = parseCitizenId(dto.citizenId ?? dto.citizen_id);
    const customerType = requireText(
      dto.customerType ?? dto.customer_type,
      'customerType',
      32,
    );
    const organizationId = parsePositiveOptionalId(
      dto.organizationId ?? dto.organization_id,
      'organizationId',
    );
    const passwordHash = requireText(
      dto.passwordHash ?? dto.password_hash ?? 'temporary-password',
      'passwordHash',
      255,
    );
    const status = optionalText(dto.status, 'status', 32) ?? 'pending';

    await this.ensurePrefixExists(prefixId);
    await this.ensureOrganizationExists(organizationId);
    await this.ensureUniqueEmail(email);
    await this.ensureUniqueCitizenId(citizenId);

    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO customers (
        prefix_id,
        name,
        surname,
        email,
        phone,
        citizen_id,
        customer_type,
        organization_id,
        password_hash,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prefixId,
        name,
        surname,
        email,
        phone,
        citizenId,
        customerType,
        organizationId,
        passwordHash,
        status,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    const prefixId =
      dto.prefixId === undefined && dto.prefix_id === undefined
        ? current.prefix_id
        : parsePositiveOptionalId(dto.prefixId ?? dto.prefix_id, 'prefixId');
    const name =
      dto.name === undefined ? current.name : requireText(dto.name, 'name', 255);
    const surname =
      dto.surname === undefined
        ? current.surname
        : optionalText(dto.surname, 'surname', 255) ?? null;
    const email =
      dto.email === undefined ? current.email : parseRequiredEmail(dto.email);
    const phone =
      dto.phone === undefined
        ? current.phone
        : optionalPhone(dto.phone, 'phone', 20) ?? null;
    const citizenId =
      dto.citizenId === undefined && dto.citizen_id === undefined
        ? current.citizen_id
        : parseCitizenId(dto.citizenId ?? dto.citizen_id);
    const customerType =
      dto.customerType === undefined && dto.customer_type === undefined
        ? current.customer_type
        : requireText(
            dto.customerType ?? dto.customer_type,
            'customerType',
            32,
          );
    const organizationId =
      dto.organizationId === undefined && dto.organization_id === undefined
        ? current.organization_id
        : parsePositiveOptionalId(
            dto.organizationId ?? dto.organization_id,
            'organizationId',
          );
    const passwordHash =
      dto.passwordHash === undefined && dto.password_hash === undefined
        ? current.password_hash
        : requireText(
            dto.passwordHash ?? dto.password_hash,
            'passwordHash',
            255,
          );
    const status = optionalText(dto.status, 'status', 32) ?? current.status;

    await this.ensurePrefixExists(prefixId);
    await this.ensureOrganizationExists(organizationId);
    await this.ensureUniqueEmail(email, id);
    await this.ensureUniqueCitizenId(citizenId, id);

    await this.db.query<ResultSetHeader>(
      `UPDATE customers
      SET
        prefix_id = ?,
        name = ?,
        surname = ?,
        email = ?,
        phone = ?,
        citizen_id = ?,
        customer_type = ?,
        organization_id = ?,
        password_hash = ?,
        status = ?
      WHERE id = ?`,
      [
        prefixId,
        name,
        surname,
        email,
        phone,
        citizenId,
        customerType,
        organizationId,
        passwordHash,
        status,
        id,
      ],
    );

    return this.findOne(id);
  }

  async sendPasswordResetOtp(id: number) {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.authService.sendOtpToEmail(
      current.email,
      'รหัส OTP สำหรับเปลี่ยนรหัสผ่านผู้ใช้งาน',
    );

    return { message: 'sent' };
  }

  async resetPasswordWithOtp(id: number, dto: ResetCustomerPasswordDto) {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    const password = requireText(dto.password, 'password', 255);
    const otp = requireFiveDigitOtp(dto.otp);

    if (password.length < 8) {
      throw new BadRequestException('password must be at least 8 characters');
    }

    this.authService.verifyOtp(current.email, otp);

    const passwordHash = await bcrypt.hash(password, 10);

    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET password_hash = ? WHERE id = ?',
      [passwordHash, id],
    );

    await this.db.query<ResultSetHeader>(
      `
      INSERT INTO password_logs (
        user_type,
        user_id,
        password_hash
      ) VALUES ('customer', ?, ?)
    `,
      [id, passwordHash],
    );

    return { message: 'updated' };
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }

  async approve(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['approved', id],
    );

    return this.findOne(id);
  }

  async reject(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['rejected', id],
    );

    return this.findOne(id);
  }

  async inactive(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }
}
