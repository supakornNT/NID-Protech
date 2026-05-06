import type { RowDataPacket } from 'mysql2/promise';

export interface LoginLog extends RowDataPacket {
  id: number;
  user_type: string;
  user_id: number;
  ip_address: string;
  user_agent: string;
  login_at: Date | null;
  status: string;
  fail_reason: string;
}
