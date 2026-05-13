import type { RowDataPacket } from 'mysql2/promise';

export interface RequestTrackRow extends RowDataPacket {
  id: number;
  request_no: string;
  title: string;
  detail: string;
  score: number | null;
  customer_id: number;
  request_status: string;
  request_created_at: Date | string;
  resolution_request_status: string | null;
  resolution_summary: string | null;
  reviewed_at: Date | string | null;
  repaired_by_name: string | null;
  repaired_by_surname: string | null;
}

export interface StatusLogRow extends RowDataPacket {
  new_status: string;
  created_at: Date | string;
}
