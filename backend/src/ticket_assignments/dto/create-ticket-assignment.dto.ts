export class CreateTicketAssignmentDto {
  ticketId!: number;

  assignedTeamId?: number;

  assignedStaffId?: number;

  assignedBy?: number;

  note?: string;
}
