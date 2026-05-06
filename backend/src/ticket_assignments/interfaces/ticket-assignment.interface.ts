import type { RowDataPacket } from 'mysql2/promise';

export interface TicketAssignment extends RowDataPacket {
  id: number;
  ticket_id: number;
  assigned_team_id: number;
  assigned_staff_id: number;
  assigned_by: number;
  note: string;
  assigned_at: Date | null;
}
