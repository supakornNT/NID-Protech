import type { RowDataPacket } from 'mysql2/promise';

export interface ReportStatusLog extends RowDataPacket {
  id: number;
  report_id: number;
  old_status: string;
  new_status: string;
  changed_by_type: string;
  changed_by_id: number;
  note: string;
  created_at: Date | null;
}
