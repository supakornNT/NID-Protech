import type { RowDataPacket } from 'mysql2/promise';

export interface Ticket extends RowDataPacket {
  id: number;
  ticket_no: string;
  report_id: number;
  report_no: string;
  assigned_team_id: number;
  assigned_team_name: string;
  assigned_staff_id: number;
  assigned_staff_name: string;
  assigned_by: number;
  assigned_by_name: string;
  title: string;
  description: string;
  status: string;
  created_at: Date | null;
  resolved_at: Date | null;
  closed_at: Date | null;
}
