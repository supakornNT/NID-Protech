export class CreateTicketStatusLogDto {
  ticket_id: number;

  old_status: string;

  new_status: string;

  changed_by: number;

  note?: string;
}
