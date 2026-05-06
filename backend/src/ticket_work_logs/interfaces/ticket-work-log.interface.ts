import type { RowDataPacket } from 'mysql2/promise';

export interface TicketWorkLog extends RowDataPacket {
  id: number;
  ticket_id: number;
  staff_id: number;
  work_detail: string;
  work_status: string;
  created_at: Date | null;
}
