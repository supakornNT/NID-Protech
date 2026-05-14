import type { RowDataPacket } from 'mysql2';

import type { PaginationMeta } from '@/user_portal/interfaces/public-request-list.interface';
import type { LoginLog } from './login-log.interface';

export interface LoginLogSummary extends RowDataPacket {
  todaySuccess: number;
  todayFailed: number;
  staff: number;
  customer: number;
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

export interface CountRow extends RowDataPacket {
  total: number;
}
