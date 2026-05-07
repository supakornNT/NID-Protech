import type { RowDataPacket } from 'mysql2/promise';

export interface Staff extends RowDataPacket {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  password_hash: string;
  status: string;
  created_at: Date | null;
  updated_at: Date | null;
}
