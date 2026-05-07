export class CreateTicketAssignmentDto {
  ticket_id: number;

  assigned_team_id?: number;

  assigned_staff_id?: number;

  assigned_by?: number;

  note?: string;
}
