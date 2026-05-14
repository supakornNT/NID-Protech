import type { RowDataPacket } from 'mysql2/promise';

export interface LoginLog extends RowDataPacket {
  id: number;
  userType: string;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  loginAt: Date | null;
  status: string;
  failReason: string | null;
}
