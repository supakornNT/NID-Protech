export class CreateTicketResolutionRequestDto {
  ticketId!: number;

  requestedBy!: number;

  summary!: string;

  status!: string;

  reviewedBy?: number;

  reviewedAt?: string;

  rejectReason?: string;
}
