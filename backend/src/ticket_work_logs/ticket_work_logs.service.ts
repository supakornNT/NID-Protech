import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateTicketWorkLogDto } from './dto/create-ticket-work-log.dto';
import { UpdateTicketWorkLogDto } from './dto/update-ticket-work-log.dto';
import type { TicketWorkLog } from './interfaces/ticket-work-log.interface';

@Injectable()
export class TicketWorkLogsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<TicketWorkLog[]> {
    const [rows] = await this.db.query<TicketWorkLog[]>(
      `SELECT
      ticket_work_logs.id,
      ticket_work_logs.ticket_id,
      ticket_work_logs.staff_id,
      ticket_work_logs.work_detail,
      ticket_work_logs.work_status,
      ticket_work_logs.created_at
      FROM ticket_work_logs
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<TicketWorkLog | null> {
    const [rows] = await this.db.query<TicketWorkLog[]>(
      `SELECT
      ticket_work_logs.id,
      ticket_work_logs.ticket_id,
      ticket_work_logs.staff_id,
      ticket_work_logs.work_detail,
      ticket_work_logs.work_status,
      ticket_work_logs.created_at
      FROM ticket_work_logs
      WHERE ticket_work_logs.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateTicketWorkLogDto): Promise<TicketWorkLog | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO ticket_work_logs (ticket_id, staff_id, work_detail, work_status) VALUES (?, ?, ?, ?)',
      [
        dto.ticket_id,
        dto.staff_id,
        dto.work_detail,
        dto.work_status,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateTicketWorkLogDto): Promise<TicketWorkLog | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE ticket_work_logs
      SET
        ticket_id = ?,
        staff_id = ?,
        work_detail = ?,
        work_status = ?
      WHERE id = ?`,
      [
        dto.ticket_id ?? current.ticket_id,
        dto.staff_id ?? current.staff_id,
        dto.work_detail ?? current.work_detail,
        dto.work_status ?? current.work_status,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'DELETE FROM ticket_work_logs WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }


}
