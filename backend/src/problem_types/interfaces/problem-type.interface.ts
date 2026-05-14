import type { RowDataPacket } from 'mysql2/promise';

export interface ProblemType extends RowDataPacket {
  id: number;
  code: string | null;
  name: string;
  request_type: string;
  status: string;
  created_at: Date | null;
  updated_at: Date | null;
}
