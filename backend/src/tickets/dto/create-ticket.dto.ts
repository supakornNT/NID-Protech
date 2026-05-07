export class CreateTicketDto {
  ticket_no: string;

  report_id: number;

  parent_ticket_id?: number;

  assigned_team_id?: number;

  assigned_staff_id?: number;

  assigned_by?: number;

  title: string;

  description: string;

  status: string;

  resolved_at?: string;

  closed_at?: string;
}
