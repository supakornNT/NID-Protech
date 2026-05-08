import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import type { Attachment } from './interfaces/attachment.interface';

@Injectable()
export class AttachmentsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<Attachment[]> {
    const [rows] = await this.db.query<Attachment[]>(
      `SELECT
      attachments.id,
      attachments.report_id,
      attachments.ticket_id,
      attachments.attachment_type,
      attachments.original_name,
      attachments.file_ext,
      attachments.uploaded_at
      FROM attachments
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<Attachment | null> {
    const [rows] = await this.db.query<Attachment[]>(
      `SELECT
      attachments.id,
      attachments.report_id,
      attachments.ticket_id,
      attachments.attachment_type,
      attachments.original_name,
      attachments.file_ext,
      attachments.uploaded_at
      FROM attachments
      WHERE attachments.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateAttachmentDto): Promise<Attachment | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO attachments (report_id, ticket_id, attachment_type, original_name, file_ext) VALUES (?, ?, ?, ?, ?)',
      [
        dto.reportId,
        dto.ticketId,
        dto.attachmentType,
        dto.originalName,
        dto.fileExt,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateAttachmentDto,
  ): Promise<Attachment | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE attachments
      SET
        report_id = ?,
        ticket_id = ?,
        attachment_type = ?,
        original_name = ?,
        file_ext = ?
      WHERE id = ?`,
      [
        dto.reportId ?? current.report_id,
        dto.ticketId ?? current.ticket_id,
        dto.attachmentType ?? current.attachment_type,
        dto.originalName ?? current.original_name,
        dto.fileExt ?? current.file_ext,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'DELETE FROM attachments WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }
}
