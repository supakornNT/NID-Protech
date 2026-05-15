import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';

import type {
  CountRow,
  GetLoginLogsQuery,
  LoginLogSummary,
  PublicAdminLoginLogList,
} from './interfaces/admin.interface';
import type { LoginLog } from './interfaces/login-log.interface';

@Injectable()
export class LoginLogsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  private readonly selectSql = `
    SELECT
      login_logs.id,
      login_logs.user_type AS userType,
      login_logs.user_id AS userId,
      CASE
        WHEN login_logs.user_type = 'customer'
          THEN NULLIF(TRIM(CONCAT(COALESCE(customers.name, ''), ' ', COALESCE(customers.surname, ''))), '')
        WHEN login_logs.user_type = 'staff'
          THEN NULLIF(TRIM(CONCAT(COALESCE(staffs.name, ''), ' ', COALESCE(staffs.surname, ''))), '')
        ELSE NULL
      END AS userName,
      CASE
        WHEN login_logs.user_type = 'customer' THEN customers.email
        WHEN login_logs.user_type = 'staff' THEN staffs.email
        ELSE NULL
      END AS userEmail,
      login_logs.ip_address AS ipAddress,
      login_logs.user_agent AS userAgent,
      login_logs.login_at AS loginAt,
      login_logs.status,
      login_logs.fail_reason AS failReason
    FROM login_logs
    LEFT JOIN customers
      ON login_logs.user_type = 'customer'
      AND login_logs.user_id = customers.id
    LEFT JOIN staffs
      ON login_logs.user_type = 'staff'
      AND login_logs.user_id = staffs.id
  `;

  private buildWhere(query: GetLoginLogsQuery): {
    whereSql: string;
    params: Array<string | number>;
  } {
    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    const search = query.search?.trim() ?? '';
    const userType = query.userType?.trim() ?? '';
    const status = query.status?.trim() ?? '';
    const startDate = query.startDate?.trim() ?? '';
    const endDate = query.endDate?.trim() ?? '';

    if (search) {
      whereClauses.push(`(
        CONCAT(COALESCE(customers.name, ''), ' ', COALESCE(customers.surname, '')) LIKE ?
        OR CONCAT(COALESCE(staffs.name, ''), ' ', COALESCE(staffs.surname, '')) LIKE ?
        OR COALESCE(customers.email, '') LIKE ?
        OR COALESCE(staffs.email, '') LIKE ?
      )`);
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    if (userType && userType !== 'all') {
      whereClauses.push(`login_logs.user_type = ?`);
      params.push(userType);
    }

    if (status && status !== 'all') {
      whereClauses.push(`login_logs.status = ?`);
      params.push(status);
    }

    if (startDate) {
      whereClauses.push(`DATE(login_logs.login_at) >= ?`);
      params.push(startDate);
    }

    if (endDate) {
      whereClauses.push(`DATE(login_logs.login_at) <= ?`);
      params.push(endDate);
    }

    return {
      whereSql: whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '',
      params,
    };
  }

  async findAll(query: GetLoginLogsQuery): Promise<PublicAdminLoginLogList> {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const offset = (page - 1) * limit;

    const { whereSql, params } = this.buildWhere(query);

    const [countRows] = await this.db.query<CountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM login_logs
        LEFT JOIN customers
          ON login_logs.user_type = 'customer'
          AND login_logs.user_id = customers.id
        LEFT JOIN staffs
          ON login_logs.user_type = 'staff'
          AND login_logs.user_id = staffs.id
        ${whereSql}
      `,
      params,
    );

    const total = Number(countRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const safeOffset = (safePage - 1) * limit;

    const [rows] = await this.db.query<LoginLog[]>(
      `
        ${this.selectSql}
        ${whereSql}
        ORDER BY login_logs.login_at DESC, login_logs.id DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, safeOffset],
    );

    return {
      items: rows,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getSummary(): Promise<LoginLogSummary> {
    const [rows] = await this.db.query<LoginLogSummary[]>(
      `
        SELECT
          SUM(
            CASE
              WHEN DATE(login_logs.login_at) = CURRENT_DATE
                AND login_logs.status = 'success'
              THEN 1 ELSE 0
            END
          ) AS todaySuccess,
          SUM(
            CASE
              WHEN DATE(login_logs.login_at) = CURRENT_DATE
                AND login_logs.status = 'failed'
              THEN 1 ELSE 0
            END
          ) AS todayFailed,
          SUM(CASE WHEN login_logs.user_type = 'staff' THEN 1 ELSE 0 END) AS staff,
          SUM(CASE WHEN login_logs.user_type = 'customer' THEN 1 ELSE 0 END) AS customer
        FROM login_logs
      `,
    );

    return {
      todaySuccess: Number(rows[0]?.todaySuccess ?? 0),
      todayFailed: Number(rows[0]?.todayFailed ?? 0),
      staff: Number(rows[0]?.staff ?? 0),
      customer: Number(rows[0]?.customer ?? 0),
    } as LoginLogSummary;
  }

  async findOne(id: number): Promise<LoginLog | null> {
    const [rows] = await this.db.query<LoginLog[]>(
      `
        ${this.selectSql}
        WHERE login_logs.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }
}
