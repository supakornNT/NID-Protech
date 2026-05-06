import type { RowDataPacket } from 'mysql2/promise';

export interface Organization extends RowDataPacket {
  id: number;
  name: string;
  type: 'company' | 'government' | 'other';
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}
