import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import { AuthService } from '@/auth/auth.service';
import { CountRow } from '@/customers/interfaces/admin.interface';
import {
  ACTIVE_STATUS_VALUES,
  getCountTotal,
  optionalEmail,
  optionalPhone,
  optionalText,
  positiveIntFromQuery,
  requireEnumValue,
  requireText,
} from '@/common/validation/input-rules';
import { CreateStaffDto } from './dto/create-staff.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { ResetStaffPasswordDto } from './dto/reset-staff-password.dto';
import { SendStaffRegistrationOtpDto } from './dto/send-staff-registration-otp.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import type {
  AdminStaffListItem,
  AdminStaffListResponse,
  AdminStaffListRow,
  AdminStaffOptionsResponse,
  GetAdminStaffsQuery,
  PrefixOptionRow,
  RoleOptionRow,
} from './interfaces/admin.interface';
import type { Staff } from './interfaces/staff.interface';

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

function splitPipeList(value: string | null) {
  return value ? value.split('||').filter(Boolean) : [];
}

function parseTeamIds(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new BadRequestException('teamIds must contain at least one item');
  }

  const teamIds = [...new Set(value.map((teamId) => Number(teamId)))];

  if (!teamIds.every((teamId) => Number.isInteger(teamId) && teamId > 0)) {
    throw new BadRequestException('teamIds must contain positive integers');
  }

  return teamIds;
}

@Injectable()
export class StaffsService {
  private registrationOtpStore = new Map<
    string,
    { code: string; expiresAt: number }
  >();

  constructor(
    @Inject('DB') private readonly db: Pool,
    private readonly authService: AuthService,
  ) {}

  private async ensureUniqueEmail(email: string, excludeId?: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `
      SELECT id
      FROM staffs
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
      FROM staffs
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

  private mapAdminStaffRow(row: AdminStaffListRow): AdminStaffListItem {
    return {
      userType: row.userType === 'customer' ? 'customer' : 'staff',
      id: row.id,
      prefixId: row.prefixId,
      prefixName: row.prefixName,
      name: row.name,
      surname: row.surname,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      citizenId: row.citizenId,
      status: row.status,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : row.createdAt ?? null,
      updatedAt:
        row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : row.updatedAt ?? null,
      lastPasswordChangedAt:
        row.lastPasswordChangedAt instanceof Date
          ? row.lastPasswordChangedAt.toISOString()
          : row.lastPasswordChangedAt ?? null,
      customerType: row.customerType,
      organizationName: row.organizationName,
      roleNames: splitPipeList(row.roleNames),
      teamNames: splitPipeList(row.teamNames),
    };
  }

  private verifyRegistrationOtp(email: string, otp: string) {
    const entry = this.registrationOtpStore.get(email);

    if (!entry) {
      throw new BadRequestException('ไม่พบ OTP กรุณาขอ OTP ใหม่');
    }

    if (Date.now() > entry.expiresAt) {
      this.registrationOtpStore.delete(email);
      throw new BadRequestException('OTP หมดอายุแล้ว กรุณาขอ OTP ใหม่');
    }

    if (entry.code !== otp) {
      throw new BadRequestException('OTP ไม่ถูกต้อง');
    }

    this.registrationOtpStore.delete(email);
  }

  async findAll(): Promise<Staff[]> {
    const [rows] = await this.db.query<Staff[]>(
      `SELECT
        staffs.id,
        staffs.prefix_id,
        staffs.name,
        staffs.surname,
        staffs.email,
        staffs.phone,
        staffs.citizen_id,
        staffs.password_hash,
        staffs.status,
        staffs.created_at,
        staffs.updated_at
      FROM staffs`,
    );

    return rows;
  }

  async findOne(id: number): Promise<Staff | null> {
    const [rows] = await this.db.query<Staff[]>(
      `SELECT
        staffs.id,
        staffs.prefix_id,
        staffs.name,
        staffs.surname,
        staffs.email,
        staffs.phone,
        staffs.citizen_id,
        staffs.password_hash,
        staffs.status,
        staffs.created_at,
        staffs.updated_at
      FROM staffs
      WHERE staffs.id = ?`,
      [id],
    );

    return rows[0] ?? null;
  }

  async findAdminUsers(query: GetAdminStaffsQuery = {}): Promise<AdminStaffListResponse> {
    const page = positiveIntFromQuery(query.page, 'page', 1);
    const limit = positiveIntFromQuery(query.limit, 'limit', 10, 10);
    const offset = (page - 1) * limit;
    const search = optionalText(query.search, 'search', 255) ?? '';
    const status = optionalText(query.status, 'status', 32);
    const userType = optionalText(query.userType, 'userType', 16);

    if (userType && userType !== 'staff' && userType !== 'customer') {
      throw new BadRequestException('userType must be staff or customer');
    }

    const staffWhereClauses: string[] = [];
    const customerWhereClauses: string[] = [];
    const staffParams: Array<string | number> = [];
    const customerParams: Array<string | number> = [];

    if (search) {
      const like = `%${search}%`;
      staffWhereClauses.push(
        `(CONCAT(COALESCE(staffs.name, ''), ' ', COALESCE(staffs.surname, '')) LIKE ?
          OR staffs.email LIKE ?
          OR COALESCE(staffs.phone, '') LIKE ?
          OR COALESCE(staffs.citizen_id, '') LIKE ?)`,
      );
      customerWhereClauses.push(
        `(CONCAT(COALESCE(customers.name, ''), ' ', COALESCE(customers.surname, '')) LIKE ?
          OR customers.email LIKE ?
          OR COALESCE(customers.phone, '') LIKE ?
          OR COALESCE(customers.citizen_id, '') LIKE ?)`,
      );
      staffParams.push(like, like, like, like);
      customerParams.push(like, like, like, like);
    }

    if (status) {
      staffWhereClauses.push('staffs.status = ?');
      customerWhereClauses.push('customers.status = ?');
      staffParams.push(status);
      customerParams.push(status);
    }

    if (userType === 'staff') {
      customerWhereClauses.push('1 = 0');
    }

    if (userType === 'customer') {
      staffWhereClauses.push('1 = 0');
    }

    const staffWhereSql =
      staffWhereClauses.length > 0
        ? `WHERE ${staffWhereClauses.join(' AND ')}`
        : '';
    const customerWhereSql =
      customerWhereClauses.length > 0
        ? `WHERE ${customerWhereClauses.join(' AND ')}`
        : '';

    const unionSql = `
      SELECT
        'staff' AS userType,
        staffs.id,
        staffs.prefix_id AS prefixId,
        prefixes.name AS prefixName,
        staffs.name,
        staffs.surname,
        TRIM(CONCAT(COALESCE(prefixes.name, ''), ' ', COALESCE(staffs.name, ''), ' ', COALESCE(staffs.surname, ''))) AS fullName,
        staffs.email,
        staffs.phone,
        staffs.citizen_id AS citizenId,
        staffs.status,
        staffs.created_at AS createdAt,
        staffs.updated_at AS updatedAt,
        MAX(password_logs.changed_at) AS lastPasswordChangedAt,
        NULL AS customerType,
        NULL AS organizationName,
        '' AS roleNames,
        '' AS teamNames
      FROM staffs
      LEFT JOIN prefixes
        ON prefixes.id = staffs.prefix_id
      LEFT JOIN password_logs
        ON password_logs.user_type = 'staff'
        AND password_logs.user_id = staffs.id
      ${staffWhereSql}
      GROUP BY
        staffs.id,
        staffs.prefix_id,
        prefixes.name,
        staffs.name,
        staffs.surname,
        staffs.email,
        staffs.phone,
        staffs.citizen_id,
        staffs.status,
        staffs.created_at,
        staffs.updated_at

      UNION ALL

      SELECT
        'customer' AS userType,
        customers.id,
        customers.prefix_id AS prefixId,
        prefixes.name AS prefixName,
        customers.name,
        customers.surname,
        TRIM(CONCAT(COALESCE(prefixes.name, ''), ' ', COALESCE(customers.name, ''), ' ', COALESCE(customers.surname, ''))) AS fullName,
        customers.email,
        customers.phone,
        customers.citizen_id AS citizenId,
        customers.status,
        customers.created_at AS createdAt,
        customers.updated_at AS updatedAt,
        MAX(password_logs.changed_at) AS lastPasswordChangedAt,
        customers.customer_type AS customerType,
        organizations.name AS organizationName,
        '' AS roleNames,
        '' AS teamNames
      FROM customers
      LEFT JOIN prefixes
        ON prefixes.id = customers.prefix_id
      LEFT JOIN organizations
        ON organizations.id = customers.organization_id
      LEFT JOIN password_logs
        ON password_logs.user_type = 'customer'
        AND password_logs.user_id = customers.id
      ${customerWhereSql}
      GROUP BY
        customers.id,
        customers.prefix_id,
        prefixes.name,
        customers.name,
        customers.surname,
        customers.email,
        customers.phone,
        customers.citizen_id,
        customers.status,
        customers.created_at,
        customers.updated_at,
        customers.customer_type,
        organizations.name
    `;

    const unionParams = [...staffParams, ...customerParams];

    const [countRows] = await this.db.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM (${unionSql}) AS admin_users_count`,
      unionParams,
    );

    const [rows] = await this.db.query<AdminStaffListRow[]>(
      `
      SELECT *
      FROM (${unionSql}) AS admin_users
      ORDER BY createdAt ASC, id ASC
      LIMIT ? OFFSET ?
    `,
      [...unionParams, limit, offset],
    );

    const total = getCountTotal(countRows, 0);

    return {
      items: rows.map((row) => this.mapAdminStaffRow(row)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findAdminUserOptions(): Promise<AdminStaffOptionsResponse> {
    const [[prefixRows], [roleRows]] = await Promise.all([
      this.db.query<PrefixOptionRow[]>(
        `
        SELECT
          prefixes.id AS value,
          prefixes.name AS label
        FROM prefixes
        ORDER BY prefixes.id ASC
      `,
      ),
      this.db.query<RoleOptionRow[]>(
        `
        SELECT
          roles.id AS value,
          roles.name AS label
        FROM roles
        ORDER BY roles.id ASC
      `,
      ),
    ]);

    return {
      prefixes: prefixRows.map((row) => ({
        value: row.value,
        label: row.label,
      })),
      roles: roleRows.map((row) => ({
        value: row.value,
        label: row.label,
      })),
    };
  }

  async create(dto: CreateStaffDto): Promise<Staff | null> {
    const prefixId = parsePositiveOptionalId(dto.prefixId, 'prefixId');
    const name = requireText(dto.name, 'name', 255);
    const surname = optionalText(dto.surname, 'surname', 255) ?? null;
    const email = parseRequiredEmail(dto.email);
    const phone = optionalPhone(dto.phone, 'phone', 20) ?? null;
    const citizenId = parseCitizenId(dto.citizenId);
    const password = requireText(dto.passwordHash, 'passwordHash', 255);
    const status =
      dto.status === undefined
        ? 'active'
        : requireEnumValue(dto.status, 'status', ACTIVE_STATUS_VALUES);

    if (password.length < 8) {
      throw new BadRequestException('password must be at least 8 characters');
    }

    await this.ensurePrefixExists(prefixId);
    await this.ensureUniqueEmail(email);
    await this.ensureUniqueCitizenId(citizenId);

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await this.db.query<ResultSetHeader>(
      `
      INSERT INTO staffs (
        prefix_id,
        name,
        surname,
        email,
        phone,
        citizen_id,
        password_hash,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [prefixId, name, surname, email, phone, citizenId, passwordHash, status],
    );

    return this.findOne(result.insertId);
  }

  async sendRegistrationOtp(dto: SendStaffRegistrationOtpDto) {
    const email = parseRequiredEmail(dto.email);
    await this.ensureUniqueEmail(email);

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    this.registrationOtpStore.set(email, { code, expiresAt });
    await this.authService.sendCustomOtpToEmail(
      email,
      code,
      'รหัส OTP สำหรับลงทะเบียนเจ้าหน้าที่',
    );
    console.log(`Generated OTP for ${email}: ${code} (expires at ${new Date(expiresAt).toISOString()})`);
    return { message: 'sent' };
  }
async register(dto: RegisterStaffDto): Promise<Staff | null> {
  const prefixId = parsePositiveOptionalId(dto.prefixId, 'prefixId');
  const name = requireText(dto.name, 'name', 255);
  const surname = optionalText(dto.surname, 'surname', 255) ?? null;
  const email = parseRequiredEmail(dto.email);
  const phone = optionalPhone(dto.phone, 'phone', 20) ?? null;
  const citizenId = parseCitizenId(dto.citizenId);
  const password = requireText(dto.password, 'password', 255);
  const otp = requireText(dto.otp, 'otp', 12);
  const teamIds = parseTeamIds(dto.teamIds);

  const status =
    dto.status === undefined
      ? 'active'
      : requireEnumValue(dto.status, 'status', ACTIVE_STATUS_VALUES);

  if (password.length < 8) {
    throw new BadRequestException(
      'password must be at least 8 characters',
    );
  }

  await this.ensurePrefixExists(prefixId);
  await this.ensureUniqueEmail(email);
  await this.ensureUniqueCitizenId(citizenId);

  this.verifyRegistrationOtp(email, otp);

  const passwordHash = await bcrypt.hash(password, 10);

  const connection = await this.db.getConnection();

  try {
    await connection.beginTransaction();

    // ตรวจสอบ team
    if (teamIds.length > 0) {
      const [teamRows] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM teams WHERE id IN (${teamIds
          .map(() => '?')
          .join(', ')})`,
        teamIds,
      );

      if (teamRows.length !== teamIds.length) {
        throw new BadRequestException(
          'Some teamIds do not exist',
        );
      }
    }

    // insert staff
    const [result] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO staffs (
        prefix_id,
        name,
        surname,
        email,
        phone,
        citizen_id,
        password_hash,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        prefixId,
        name,
        surname,
        email,
        phone,
        citizenId,
        passwordHash,
        status,
      ],
    );

    const insertId = result.insertId;

    // insert staff_team_roles
    if (teamIds.length > 0) {
      const values = teamIds
        .map(() => '(?, ?)')
        .join(', ');

      const params = teamIds.flatMap((teamId) => [
        insertId,
        teamId,
      ]);

      await connection.query<ResultSetHeader>(
        `
        INSERT INTO staff_team_roles (
          staff_id,
          team_id
        ) VALUES ${values}
        `,
        params,
      );
    }

    await connection.commit();

    return this.findOne(insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

  async update(id: number, dto: UpdateStaffDto): Promise<Staff | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    const prefixId =
      dto.prefixId === undefined
        ? current.prefix_id
        : parsePositiveOptionalId(dto.prefixId, 'prefixId');
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
      dto.citizenId === undefined
        ? current.citizen_id
        : parseCitizenId(dto.citizenId);
    const passwordHash =
      dto.passwordHash === undefined
        ? current.password_hash
        : requireText(dto.passwordHash, 'passwordHash', 255);
    const status =
      dto.status === undefined
        ? current.status
        : requireEnumValue(dto.status, 'status', ACTIVE_STATUS_VALUES);

    await this.ensurePrefixExists(prefixId);
    await this.ensureUniqueEmail(email, id);
    await this.ensureUniqueCitizenId(citizenId, id);

    await this.db.query<ResultSetHeader>(
      `
      UPDATE staffs
      SET
        prefix_id = ?,
        name = ?,
        surname = ?,
        email = ?,
        phone = ?,
        citizen_id = ?,
        password_hash = ?,
        status = ?
      WHERE id = ?
    `,
      [prefixId, name, surname, email, phone, citizenId, passwordHash, status, id],
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

  async resetPasswordWithOtp(id: number, dto: ResetStaffPasswordDto) {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    const password = requireText(dto.password, 'password', 255);
    const otp = requireText(dto.otp, 'otp', 12);

    if (password.length < 8) {
      throw new BadRequestException('password must be at least 8 characters');
    }

    this.authService.verifyOtp(current.email, otp);

    const passwordHash = await bcrypt.hash(password, 10);

    await this.db.query<ResultSetHeader>(
      'UPDATE staffs SET password_hash = ? WHERE id = ?',
      [passwordHash, id],
    );

    await this.db.query<ResultSetHeader>(
      `
      INSERT INTO password_logs (
        user_type,
        user_id,
        password_hash
      ) VALUES ('staff', ?, ?)
    `,
      [id, passwordHash],
    );

    return { message: 'updated' };
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE staffs SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }

  async inactive(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE staffs SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }

  async active(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE staffs SET status = ? WHERE id = ?',
      ['active', id],
    );

    return this.findOne(id);
  }

  async findWithTaskCount() {
    const [rows] = await this.db.query<Staff[]>(
      `SELECT
        staffs.id,
        CONCAT(staffs.name, ' ', staffs.surname) AS fullName,
        MIN(teams.id) AS teamId,
        MIN(teams.name) AS teamName,
        COUNT(DISTINCT tickets.id) AS activeTaskCount
      FROM staffs
      LEFT JOIN staff_team_roles ON staff_team_roles.staff_id = staffs.id
      LEFT JOIN teams ON teams.id = staff_team_roles.team_id
      LEFT JOIN tickets ON tickets.assigned_staff_id = staffs.id
        AND tickets.status NOT IN ('resolved', 'closed')
      WHERE staffs.status = 'active' AND tickets.status != 'cancelled'
      GROUP BY staffs.id, staffs.name, staffs.surname`,
    );
    return rows;
  }
}
