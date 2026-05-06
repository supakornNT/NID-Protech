import type { RowDataPacket } from 'mysql2/promise';

export interface Screening extends RowDataPacket {
  id: number;
  report_id: number;
  screened_by: number;
  result: string;
  note: string;
  screened_at: Date | null;
}
