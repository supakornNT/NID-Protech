import type { RowDataPacket } from 'mysql2/promise';

export interface TicketResolutionRequest extends RowDataPacket {
  id: number;
  ticket_id: number;
  requested_by: number;
  summary: string;
  status: string;
  reviewed_by: number;
  reviewed_at: Date | null;
  reject_reason: string;
  created_at: Date | null;
}
