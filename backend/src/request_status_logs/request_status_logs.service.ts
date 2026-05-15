import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateRequestStatusLogDto } from './dto/create-request-status-log.dto';
import { UpdateRequestStatusLogDto } from './dto/update-request-status-log.dto';
import type { RequestStatusLog } from './interfaces/request-status-log.interface';

@Injectable()
export class RequestStatusLogsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<RequestStatusLog[]> {
    const [rows] = await this.db.query<RequestStatusLog[]>(
      `SELECT
      request_status_logs.id,
      request_status_logs.request_id,
      request_status_logs.old_status,
      request_status_logs.new_status,
      request_status_logs.changed_by_type,
      request_status_logs.changed_by_id,
      request_status_logs.note,
      request_status_logs.created_at
      FROM request_status_logs
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<RequestStatusLog | null> {
    const [rows] = await this.db.query<RequestStatusLog[]>(
      `SELECT
      request_status_logs.id,
      request_status_logs.request_id,
      request_status_logs.old_status,
      request_status_logs.new_status,
      request_status_logs.changed_by_type,
      request_status_logs.changed_by_id,
      request_status_logs.note,
      request_status_logs.created_at
      FROM request_status_logs
      WHERE request_status_logs.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateRequestStatusLogDto): Promise<RequestStatusLog | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO request_status_logs (request_id, old_status, new_status, changed_by_type, changed_by_id, note) VALUES (?, ?, ?, ?, ?, ?)',
      [
        dto.requestId,
        dto.oldStatus,
        dto.newStatus,
        dto.changedByType,
        dto.changedById,
        dto.note,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateRequestStatusLogDto,
  ): Promise<RequestStatusLog | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE request_status_logs
      SET
        request_id = ?,
        old_status = ?,
        new_status = ?,
        changed_by_type = ?,
        changed_by_id = ?,
        note = ?
      WHERE id = ?`,
      [
        dto.requestId ?? current.request_id,
        dto.oldStatus ?? current.old_status,
        dto.newStatus ?? current.new_status,
        dto.changedByType ?? current.changed_by_type,
        dto.changedById ?? current.changed_by_id,
        dto.note ?? current.note,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'DELETE FROM request_status_logs WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }
}
