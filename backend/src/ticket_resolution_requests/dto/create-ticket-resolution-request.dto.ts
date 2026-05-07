export class CreateTicketResolutionRequestDto {
  ticket_id: number;

  requested_by: number;

  summary: string;

  status: string;

  reviewed_by?: number;

  reviewed_at?: string;

  reject_reason?: string;
}
