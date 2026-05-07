import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import type { Ticket } from './interfaces/ticket.interface';

@Injectable()
export class TicketsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<Ticket[]> {
    const [rows] = await this.db.query<Ticket[]>(
      `SELECT
      tickets.id,
      tickets.ticket_no,
      tickets.report_id,
      reports.report_no,
      tickets.assigned_team_id,
      teams.name AS assigned_team_name,
      tickets.assigned_staff_id,
      CONCAT(assigned_staff.name, ' ', assigned_staff.surname) AS assigned_staff_name,
      tickets.assigned_by,
      CONCAT(assigned_by_staff.name, ' ', assigned_by_staff.surname) AS assigned_by_name,
      tickets.title,
      tickets.description,
      tickets.status,
      tickets.created_at,
      tickets.resolved_at,
      tickets.closed_at
      FROM tickets
      LEFT JOIN reports ON reports.id = tickets.report_id
      LEFT JOIN teams ON teams.id = tickets.assigned_team_id
      LEFT JOIN staffs AS assigned_staff ON assigned_staff.id = tickets.assigned_staff_id
      LEFT JOIN staffs AS assigned_by_staff ON assigned_by_staff.id = tickets.assigned_by
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<Ticket | null> {
    const [rows] = await this.db.query<Ticket[]>(
      `SELECT
      tickets.id,
      tickets.ticket_no,
      tickets.report_id,
      reports.report_no,
      tickets.assigned_team_id,
      teams.name AS assigned_team_name,
      tickets.assigned_staff_id,
      CONCAT(assigned_staff.name, ' ', assigned_staff.surname) AS assigned_staff_name,
      tickets.assigned_by,
      CONCAT(assigned_by_staff.name, ' ', assigned_by_staff.surname) AS assigned_by_name,
      tickets.title,
      tickets.description,
      tickets.status,
      tickets.created_at,
      tickets.resolved_at,
      tickets.closed_at
      FROM tickets
      LEFT JOIN reports ON reports.id = tickets.report_id
      LEFT JOIN teams ON teams.id = tickets.assigned_team_id
      LEFT JOIN staffs AS assigned_staff ON assigned_staff.id = tickets.assigned_staff_id
      LEFT JOIN staffs AS assigned_by_staff ON assigned_by_staff.id = tickets.assigned_by
      WHERE tickets.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateTicketDto): Promise<Ticket | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO tickets (ticket_no, report_id, parent_ticket_id, assigned_team_id, assigned_staff_id, assigned_by, title, description, status, resolved_at, closed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        dto.ticket_no,
        dto.report_id,
        dto.parent_ticket_id,
        dto.assigned_team_id,
        dto.assigned_staff_id,
        dto.assigned_by,
        dto.title,
        dto.description,
        dto.status,
        dto.resolved_at,
        dto.closed_at,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateTicketDto): Promise<Ticket | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE tickets
      SET
        ticket_no = ?,
        report_id = ?,
        parent_ticket_id = ?,
        assigned_team_id = ?,
        assigned_staff_id = ?,
        assigned_by = ?,
        title = ?,
        description = ?,
        status = ?,
        resolved_at = ?,
        closed_at = ?
      WHERE id = ?`,
      [
        dto.ticket_no ?? current.ticket_no,
        dto.report_id ?? current.report_id,
        dto.parent_ticket_id ?? current.parent_ticket_id,
        dto.assigned_team_id ?? current.assigned_team_id,
        dto.assigned_staff_id ?? current.assigned_staff_id,
        dto.assigned_by ?? current.assigned_by,
        dto.title ?? current.title,
        dto.description ?? current.description,
        dto.status ?? current.status,
        dto.resolved_at ?? current.resolved_at,
        dto.closed_at ?? current.closed_at,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE tickets SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }


}
