import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateTicketStatusLogDto } from './dto/create-ticket-status-log.dto';
import { UpdateTicketStatusLogDto } from './dto/update-ticket-status-log.dto';
import type { TicketStatusLog } from './interfaces/ticket-status-log.interface';

@Injectable()
export class TicketStatusLogsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<TicketStatusLog[]> {
    const [rows] = await this.db.query<TicketStatusLog[]>(
      `SELECT
      ticket_status_logs.id,
      ticket_status_logs.ticket_id,
      ticket_status_logs.old_status,
      ticket_status_logs.new_status,
      ticket_status_logs.changed_by,
      ticket_status_logs.note,
      ticket_status_logs.created_at
      FROM ticket_status_logs
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<TicketStatusLog | null> {
    const [rows] = await this.db.query<TicketStatusLog[]>(
      `SELECT
      ticket_status_logs.id,
      ticket_status_logs.ticket_id,
      ticket_status_logs.old_status,
      ticket_status_logs.new_status,
      ticket_status_logs.changed_by,
      ticket_status_logs.note,
      ticket_status_logs.created_at
      FROM ticket_status_logs
      WHERE ticket_status_logs.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateTicketStatusLogDto): Promise<TicketStatusLog | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO ticket_status_logs (ticket_id, old_status, new_status, changed_by, note) VALUES (?, ?, ?, ?, ?)',
      [
        dto.ticket_id,
        dto.old_status,
        dto.new_status,
        dto.changed_by,
        dto.note,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateTicketStatusLogDto): Promise<TicketStatusLog | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE ticket_status_logs
      SET
        ticket_id = ?,
        old_status = ?,
        new_status = ?,
        changed_by = ?,
        note = ?
      WHERE id = ?`,
      [
        dto.ticket_id ?? current.ticket_id,
        dto.old_status ?? current.old_status,
        dto.new_status ?? current.new_status,
        dto.changed_by ?? current.changed_by,
        dto.note ?? current.note,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'DELETE FROM ticket_status_logs WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }


}
