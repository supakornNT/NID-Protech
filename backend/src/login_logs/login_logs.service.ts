import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';

import type {
  CountRow,
  GetLoginLogChartQuery,
  GetLoginLogsQuery,
  LoginLogChartItem,
  LoginLogChartPeriod,
  LoginLogChartResponse,
  LoginLogChartRow,
  LoginLogDateScopeQuery,
  LoginLogMetaResponse,
  LoginLogSummary,
  LoginLogSummaryRow,
  PublicAdminLoginLogList,
} from './interfaces/admin.interface';
import type { LoginLog } from './interfaces/login-log.interface';
import {
  getCountTotal,
  LOGIN_STATUS_VALUES,
  LOGIN_USER_TYPES,
  optionalEnumValue,
  optionalIsoDate,
  optionalText,
  positiveIntFromQuery,
} from '@/common/validation/input-rules';

const LOGIN_CHART_PERIODS = ['day', 'month', 'year'] as const;

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

  private getTodayString(): string {
    const value = new Date();
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getCurrentMonthString(): string {
    return this.getTodayString().slice(0, 7);
  }

  private getCurrentYear(): number {
    return Number(this.getTodayString().slice(0, 4));
  }

  private addDays(date: string, days: number): string {
    const value = new Date(`${date}T00:00:00.000Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
  }

  private addMonths(month: string, months: number): string {
    const [year, monthValue] = month.split('-').map(Number);
    const value = new Date(Date.UTC(year, monthValue - 1, 1));
    value.setUTCMonth(value.getUTCMonth() + months);
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  private normalizeChartPeriod(
    query: GetLoginLogChartQuery,
  ): LoginLogChartPeriod {
    return (
      optionalEnumValue(query.period, 'period', LOGIN_CHART_PERIODS) ?? 'day'
    );
  }

  private normalizeSelectedDate(query?: LoginLogDateScopeQuery): string {
    return optionalIsoDate(query?.date, 'date') ?? this.getTodayString();
  }

  private normalizeSelectedMonth(query?: LoginLogDateScopeQuery): string {
    const rawMonth = query?.month?.trim();

    if (!rawMonth) {
      return this.getCurrentMonthString();
    }

    if (!/^\d{4}-\d{2}$/.test(rawMonth)) {
      throw new BadRequestException('month must be in YYYY-MM format');
    }

    const monthNumber = Number(rawMonth.slice(5, 7));

    if (monthNumber < 1 || monthNumber > 12) {
      throw new BadRequestException('month must be between 01 and 12');
    }

    return rawMonth;
  }

  private normalizeSelectedYear(query?: LoginLogDateScopeQuery): number {
    const rawYear = query?.year?.trim();

    if (!rawYear) {
      return this.getCurrentYear();
    }

    const year = Number(rawYear);

    if (!Number.isInteger(year) || year < 2000 || year > 9999) {
      throw new BadRequestException('year must be a valid 4-digit number');
    }

    return year;
  }

  private normalizeQuery(query: GetLoginLogsQuery) {
    const startDate = optionalIsoDate(query.startDate, 'startDate');
    const endDate = optionalIsoDate(query.endDate, 'endDate');

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'startDate must be less than or equal to endDate',
      );
    }

    return {
      page: positiveIntFromQuery(query.page, 'page', 1),
      limit: positiveIntFromQuery(query.limit, 'limit', 10, 100),
      search: optionalText(query.search, 'search', 255),
      userType: optionalEnumValue(query.userType, 'userType', LOGIN_USER_TYPES),
      status: optionalEnumValue(query.status, 'status', LOGIN_STATUS_VALUES),
      startDate,
      endDate,
    };
  }

  private buildWhere(query: GetLoginLogsQuery): {
    whereSql: string;
    params: Array<string | number>;
  } {
    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    const normalizedQuery = this.normalizeQuery(query);
    const search = normalizedQuery.search ?? '';
    const userType = normalizedQuery.userType ?? '';
    const status = normalizedQuery.status ?? '';
    const startDate = normalizedQuery.startDate ?? '';
    const endDate = normalizedQuery.endDate ?? '';

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

    if (userType) {
      whereClauses.push(`login_logs.user_type = ?`);
      params.push(userType);
    }

    if (status) {
      whereClauses.push(`login_logs.status = ?`);
      params.push(status);
    }

    if (startDate) {
      whereClauses.push(`login_logs.login_at >= ?`);
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      whereClauses.push(`login_logs.login_at < ?`);
      params.push(`${this.addDays(endDate, 1)} 00:00:00`);
    }

    return {
      whereSql:
        whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '',
      params,
    };
  }

  async findAll(query: GetLoginLogsQuery): Promise<PublicAdminLoginLogList> {
    const normalizedQuery = this.normalizeQuery(query);
    const page = normalizedQuery.page;
    const limit = normalizedQuery.limit;
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

    const total = getCountTotal(countRows, 0);
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

  async getSummary(query?: LoginLogDateScopeQuery): Promise<LoginLogSummary> {
    const selectedDate = this.normalizeSelectedDate(query);
    const nextDate = this.addDays(selectedDate, 1);
    const selectedMonth = this.normalizeSelectedMonth(query);
    const nextMonth = this.addMonths(selectedMonth, 1);
    const selectedYear = this.normalizeSelectedYear(query);
    const nextYear = selectedYear + 1;

    const [rows] = await this.db.query<LoginLogSummaryRow[]>(
      `
        SELECT
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.status = 'success'
              THEN 1 ELSE 0
            END
          ) AS daySuccess,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.status = 'failed'
              THEN 1 ELSE 0
            END
          ) AS dayFailed,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.user_type = 'staff'
              THEN 1 ELSE 0
            END
          ) AS dayStaff,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.user_type = 'customer'
              THEN 1 ELSE 0
            END
          ) AS dayCustomer,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.status = 'success'
              THEN 1 ELSE 0
            END
          ) AS monthSuccess,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.status = 'failed'
              THEN 1 ELSE 0
            END
          ) AS monthFailed,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.user_type = 'staff'
              THEN 1 ELSE 0
            END
          ) AS monthStaff,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.user_type = 'customer'
              THEN 1 ELSE 0
            END
          ) AS monthCustomer,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.status = 'success'
              THEN 1 ELSE 0
            END
          ) AS yearSuccess,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.status = 'failed'
              THEN 1 ELSE 0
            END
          ) AS yearFailed,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.user_type = 'staff'
              THEN 1 ELSE 0
            END
          ) AS yearStaff,
          SUM(
            CASE
              WHEN login_logs.login_at >= ?
                AND login_logs.login_at < ?
                AND login_logs.user_type = 'customer'
              THEN 1 ELSE 0
            END
          ) AS yearCustomer
        FROM login_logs
      `,
      [
        `${selectedDate} 00:00:00`,
        `${nextDate} 00:00:00`,
        `${selectedDate} 00:00:00`,
        `${nextDate} 00:00:00`,
        `${selectedDate} 00:00:00`,
        `${nextDate} 00:00:00`,
        `${selectedDate} 00:00:00`,
        `${nextDate} 00:00:00`,
        `${selectedMonth}-01 00:00:00`,
        `${nextMonth}-01 00:00:00`,
        `${selectedMonth}-01 00:00:00`,
        `${nextMonth}-01 00:00:00`,
        `${selectedMonth}-01 00:00:00`,
        `${nextMonth}-01 00:00:00`,
        `${selectedMonth}-01 00:00:00`,
        `${nextMonth}-01 00:00:00`,
        `${selectedYear}-01-01 00:00:00`,
        `${nextYear}-01-01 00:00:00`,
        `${selectedYear}-01-01 00:00:00`,
        `${nextYear}-01-01 00:00:00`,
        `${selectedYear}-01-01 00:00:00`,
        `${nextYear}-01-01 00:00:00`,
        `${selectedYear}-01-01 00:00:00`,
        `${nextYear}-01-01 00:00:00`,
      ],
    );

    const row = rows[0];

    return {
      day: {
        success: Number(row?.daySuccess ?? 0),
        failed: Number(row?.dayFailed ?? 0),
        staff: Number(row?.dayStaff ?? 0),
        customer: Number(row?.dayCustomer ?? 0),
      },
      month: {
        success: Number(row?.monthSuccess ?? 0),
        failed: Number(row?.monthFailed ?? 0),
        staff: Number(row?.monthStaff ?? 0),
        customer: Number(row?.monthCustomer ?? 0),
      },
      year: {
        success: Number(row?.yearSuccess ?? 0),
        failed: Number(row?.yearFailed ?? 0),
        staff: Number(row?.yearStaff ?? 0),
        customer: Number(row?.yearCustomer ?? 0),
      },
    };
  }

  async getMeta(): Promise<LoginLogMetaResponse> {
    const currentYear = this.getCurrentYear();
    const [rows] = await this.db.query<
      Array<{ year: number | null } & CountRow>
    >(
      `
        SELECT DISTINCT YEAR(login_logs.login_at) AS year
        FROM login_logs
        WHERE login_logs.login_at IS NOT NULL
        ORDER BY year DESC
      `,
    );

    const availableYears = rows
      .map((row) => Number(row.year))
      .filter((year) => Number.isInteger(year) && year > 0);

    return {
      availableYears:
        availableYears.length > 0 ? availableYears : [currentYear],
    };
  }

  async getChart(query: GetLoginLogChartQuery): Promise<LoginLogChartResponse> {
    const period = this.normalizeChartPeriod(query);
    const selectedDate = this.normalizeSelectedDate(query);
    const nextDate = this.addDays(selectedDate, 1);
    const selectedMonth = this.normalizeSelectedMonth(query);
    const nextMonth = this.addMonths(selectedMonth, 1);
    const selectedYear = this.normalizeSelectedYear(query);
    const nextYear = selectedYear + 1;

    let bucketSql = `DATE_FORMAT(login_logs.login_at, '%H:00')`;
    let groupOrderSql = `bucket ASC`;
    let rangeStart = `${selectedDate} 00:00:00`;
    let rangeEnd = `${nextDate} 00:00:00`;

    if (period === 'month') {
      bucketSql = `DATE_FORMAT(login_logs.login_at, '%d')`;
      groupOrderSql = `bucket ASC`;
      rangeStart = `${selectedMonth}-01 00:00:00`;
      rangeEnd = `${nextMonth}-01 00:00:00`;
    } else if (period === 'year') {
      bucketSql = `DATE_FORMAT(login_logs.login_at, '%m')`;
      groupOrderSql = `bucket ASC`;
      rangeStart = `${selectedYear}-01-01 00:00:00`;
      rangeEnd = `${nextYear}-01-01 00:00:00`;
    }

    const [rows] = await this.db.query<LoginLogChartRow[]>(
      `
        SELECT
          ${bucketSql} AS bucket,
          SUM(CASE WHEN login_logs.status = 'success' THEN 1 ELSE 0 END) AS success,
          SUM(CASE WHEN login_logs.status = 'failed' THEN 1 ELSE 0 END) AS failed,
          SUM(CASE WHEN login_logs.user_type = 'staff' THEN 1 ELSE 0 END) AS staff,
          SUM(CASE WHEN login_logs.user_type = 'customer' THEN 1 ELSE 0 END) AS customer
        FROM login_logs
        WHERE login_logs.login_at >= ?
          AND login_logs.login_at < ?
        GROUP BY bucket
        ORDER BY ${groupOrderSql}
      `,
      [rangeStart, rangeEnd],
    );

    const items: LoginLogChartItem[] = rows.map((row) => ({
      label: row.bucket,
      success: Number(row.success ?? 0),
      failed: Number(row.failed ?? 0),
      staff: Number(row.staff ?? 0),
      customer: Number(row.customer ?? 0),
    }));

    return {
      period,
      selectedDate,
      selectedMonth,
      selectedYear,
      items,
    };
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
