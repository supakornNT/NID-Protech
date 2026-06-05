import type { RowDataPacket } from 'mysql2/promise';

export interface TicketStatusLog extends RowDataPacket {
  id: number;
  ticket_id: number;
  old_status: string;
  new_status: string;
  changed_by: number;
  note: string;
  created_at: Date | null;
}
