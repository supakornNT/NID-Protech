export class CreateTicketDto {
  ticketNo!: string;

  requestId!: number;

  assignedTeamId?: number;

  assignedStaffId?: number;

  assignedBy?: number;

  dueAt?: string;

  title!: string;

  description!: string;

  status!: string;

  closedAt?: string;
}
