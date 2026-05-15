import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { TicketByRequest } from './interfaces/ticket.interface';

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
        AND tickets.status NOT IN ('resolved', 'closed')`,
      [staffId],
    );
    return rows;
  }

  async findAllByRequest(id: number) {
    const [rows] = await this.db.query<TicketByRequest[]>(
      `
      SELECT
        tickets.id,
        CONCAT(staffs.name,staffs.surname) AS assignedStaffName,
        tickets.title,
        tickets.status,
        tickets.resolved_at AS resolvedAt
      FROM tickets
      LEFT JOIN staffs ON staffs.id = tickets.assigned_staff_id
      WHERE tickets.request_id = ?
      `,
      [id],
    );
    return rows;
  }
}
