export class CreateAttachmentDto {
  reportId?: number;

  ticketId?: number;

  attachmentType!: string;

  originalName!: string;

  fileExt!: string;
}
