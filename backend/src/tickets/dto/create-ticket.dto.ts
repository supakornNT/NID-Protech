export class CreateTicketDto {
  ticketNo!: string;

  reportId!: number;

  parentTicketId?: number;

  assignedTeamId?: number;

  assignedStaffId?: number;

  assignedBy?: number;

  title!: string;

  description!: string;

  status!: string;

  resolvedAt?: string;

  closedAt?: string;
}
