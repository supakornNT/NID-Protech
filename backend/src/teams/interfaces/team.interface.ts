import type { RowDataPacket } from 'mysql2/promise';

export interface Team extends RowDataPacket {
  id: number;
  name: string;
  status: string;
  created_at: Date | null;
  updated_at: Date | null;
}
