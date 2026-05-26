import type { RowDataPacket } from 'mysql2/promise';

export interface RequestStatusLog extends RowDataPacket {
  id: number;
  request_id: number;
  status: string;
  changed_by_type: string;
  changed_by_id: number;
  note: string;
  created_at: Date | null;
}
