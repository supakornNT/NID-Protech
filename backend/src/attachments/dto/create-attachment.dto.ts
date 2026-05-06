export class CreateAttachmentDto {
  report_id?: number;

  ticket_id?: number;

  attachment_type: string;

  original_name: string;

  file_ext: string;
}
