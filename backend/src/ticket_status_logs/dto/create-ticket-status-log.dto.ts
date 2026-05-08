export class CreateTicketStatusLogDto {
  ticketId!: number;

  oldStatus!: string;

  newStatus!: string;

  changedBy!: number;

  note?: string;
}
