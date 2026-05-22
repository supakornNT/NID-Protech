import type { RowDataPacket } from 'mysql2';

import type { PaginationMeta } from '@/user_portal/interfaces/public-request-list.interface';
import type { LoginLog } from './login-log.interface';

export type LoginLogChartPeriod = 'day' | 'month' | 'year';

export interface LoginLogSummaryBucket {
  success: number;
  failed: number;
  staff: number;
  customer: number;
}

export interface LoginLogSummary {
  day: LoginLogSummaryBucket;
  month: LoginLogSummaryBucket;
  year: LoginLogSummaryBucket;
}

export interface LoginLogSummaryRow extends RowDataPacket {
  daySuccess: number | null;
  dayFailed: number | null;
  dayStaff: number | null;
  dayCustomer: number | null;
  monthSuccess: number | null;
  monthFailed: number | null;
  monthStaff: number | null;
  monthCustomer: number | null;
  yearSuccess: number | null;
  yearFailed: number | null;
  yearStaff: number | null;
  yearCustomer: number | null;
}

export interface LoginLogChartItem {
  label: string;
  success: number;
  failed: number;
  staff: number;
  customer: number;
}

export interface LoginLogChartRow extends RowDataPacket {
  bucket: string;
  success: number | null;
  failed: number | null;
  staff: number | null;
  customer: number | null;
}

export interface LoginLogChartResponse {
  period: LoginLogChartPeriod;
  selectedDate: string;
  selectedMonth: string;
  selectedYear: number;
  items: LoginLogChartItem[];
}

export interface LoginLogMetaResponse {
  availableYears: number[];
}

export interface LoginLogDateScopeQuery {
  date?: string;
  month?: string;
  year?: string;
}

export interface PublicAdminLoginLogList {
  items: LoginLog[];
  pagination: PaginationMeta;
}

export interface GetLoginLogsQuery {
  page?: string;
  limit?: string;
  search?: string;
  userType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetLoginLogChartQuery extends LoginLogDateScopeQuery {
  period?: string;
}

export interface CountRow extends RowDataPacket {
  total: number;
}
