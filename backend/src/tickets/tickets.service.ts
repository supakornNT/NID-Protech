import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { findById, TicketByRequest } from './interfaces/ticket.interface';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findByStaff(staffId: number) {
    const [rows] = await this.db.query<TicketByRequest[]>(
      `SELECT
        tickets.id,
        tickets.title,
        requests.detail,
        tickets.resolved_at AS resolvedAt,
        problem_types.name AS problemName,
        problem_types.request_type AS requestType
      FROM tickets
      LEFT JOIN requests ON requests.id = tickets.request_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      WHERE tickets.assigned_staff_id = ?
        AND tickets.status NOT IN ('resolved', 'closed', 'cancelled') `,
      [staffId],
    );
    return rows;
  }

  async findAllByRequest(id: number) {
    const [rows] = await this.db.query<TicketByRequest[]>(
      `
      SELECT
        tickets.id,
        CONCAT(staffs.name,' ',staffs.surname) AS assignedStaffName,
        tickets.title,
        tickets.status,
        tickets.resolved_at AS resolvedAt
      FROM tickets
      LEFT JOIN staffs ON staffs.id = tickets.assigned_staff_id
      WHERE tickets.request_id = ? AND tickets.status != 'cancelled'
      `,
      [id],
    );
    return rows;
  }

  async createSubTicket(dto: CreateTicketDto) {
    const ticketNo = `TK-${Date.now().toString().slice(-6)}`;
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO tickets
        (ticket_no, request_id, assigned_team_id, assigned_staff_id, assigned_by, due_at, title, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketNo,
        dto.requestId,
        dto.assignedTeamId,
        dto.assignedStaffId,
        dto.assignedBy,
        dto.dueAt,
        dto.title,
        dto.description,
        dto.status,
      ],
    );
    return {
      id: result.insertId,
      ticketNo: ticketNo,
      requestId: dto.requestId,
      assignedTeamId: dto.assignedTeamId,
      assignedStaffId: dto.assignedStaffId,
      assignedBy: dto.assignedBy,
      dueAt: dto.dueAt,
      title: dto.title,
      description: dto.description,
      status: dto.status,
    };
  }

  async findById(id: number) {
    const [rows] = await this.db.query<findById[]>(
      `
      SELECT
        CONCAT(staff.name,' ',staff.surname) AS fullName,
        tickets.title,
        tickets.description,
        tickets.due_at AS dueAt
      FROM tickets
      LEFT JOIN staff ON staff.id = tickets.assigned_staff_id
      WHERE id = ?
      `,
      [id],
    );
    return rows[0];
  }

  async updateSubTicket(id: number, dto: UpdateTicketDto) {
    await this.db.query(
      `
      UPDATE tickets
      SET due_at = ? , title = ? ,description = ? WHERE id = ?
      `,
      [dto.dueAt, dto.title, dto.description, id],
    );
  }

  async deleteSubticket(id: number) {
    await this.db.query(
      `
      UPDATE tickets
      SET status = 'cancelled' WHERE id = ?
      `,
      [id],
    );
  }
}
