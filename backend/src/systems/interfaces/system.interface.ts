import type { RowDataPacket } from 'mysql2/promise';

export interface System extends RowDataPacket {
  id: number;
  name: string;
  organization_id: number;
  organization_name: string;
  status: string;
  created_at: Date | null;
  updated_at: Date | null;
}
