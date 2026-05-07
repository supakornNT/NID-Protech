import type { RowDataPacket } from 'mysql2/promise';

export interface Report extends RowDataPacket {
  id: number;
  report_no: string;
  customer_name: string;
  organization: string | null;
  system_name: string;
  problem_type_name: string;
  title: string;
  status: string;
  score: number;
  created_at: Date | null;
  closed_at: Date | null;
}
