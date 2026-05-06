import type { RowDataPacket } from 'mysql2/promise';

export interface ProblemType extends RowDataPacket {
  id: number;
  name: string;
  report_type: string;
  status: string;
  created_at: Date | null;
  updated_at: Date | null;
}
