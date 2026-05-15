import type { RowDataPacket } from 'mysql2/promise';

export interface Organization extends RowDataPacket {
  id: number;
  name: string;
  type: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: Date | null;
  updated_at: Date | null;
}
