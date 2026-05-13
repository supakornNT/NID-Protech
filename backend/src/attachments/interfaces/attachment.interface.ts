import type { RowDataPacket } from 'mysql2/promise';

export interface Attachment extends RowDataPacket {
  id: number;
  request_id: number | null;
  ticket_id: number;
  attachment_type: string;
  original_name: string;
  file_ext: string;
  uploaded_at: Date | null;
}
