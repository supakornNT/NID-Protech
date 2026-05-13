export class CreateAttachmentDto {
  requestId?: number;

  ticketId?: number;

  attachmentType!: string;

  originalName!: string;

  fileExt!: string;
}
