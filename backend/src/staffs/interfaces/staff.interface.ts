import type { RowDataPacket } from 'mysql2/promise';

export interface Staff extends RowDataPacket {
  id: number;
  prefix_id: number | null;
  name: string;
  surname: string | null;
  email: string;
  phone: string | null;
  citizen_id: string | null;
  password_hash: string;
  status: string;
  created_at: Date | null;
  updated_at: Date | null;
}
