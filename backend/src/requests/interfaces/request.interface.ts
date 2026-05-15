import type { RowDataPacket } from 'mysql2/promise';

export interface RequestRecord extends RowDataPacket {
  id: number;
  request_no: string;
  customer_id: number | null;
  system_id: number | null;
  problem_type_id: number | null;
  detail: string;
  customer_name: string;
  organization: string | null;
  system_name: string;
  problem_type_name: string;
  title: string;
  status: string;
  score: number;
  created_at: Date | null;
  resolve_due_at: string | null;
  closed_at: Date | null;
}
