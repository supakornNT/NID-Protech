import type { RowDataPacket } from 'mysql2/promise';

export interface Role extends RowDataPacket {
  id: number;
  name: string;
  created_at: Date | null;
}
