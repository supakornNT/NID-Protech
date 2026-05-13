import type { RowDataPacket } from 'mysql2/promise';

export interface RequestConfirmation extends RowDataPacket {
  id: number;
  report_id: number;
  customer_id: number;
  result: string;
  comment: string;
  score: number;
  confirmed_at: Date | null;
}
