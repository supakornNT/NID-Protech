import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateTicketAssignmentDto } from './dto/create-ticket-assignment.dto';
import { UpdateTicketAssignmentDto } from './dto/update-ticket-assignment.dto';
import type { TicketAssignment } from './interfaces/ticket-assignment.interface';

@Injectable()
export class TicketAssignmentsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<TicketAssignment[]> {
    const [rows] = await this.db.query<TicketAssignment[]>(
      `SELECT
      ticket_assignments.id,
      ticket_assignments.ticket_id,
      ticket_assignments.assigned_team_id,
      ticket_assignments.assigned_staff_id,
      ticket_assignments.assigned_by,
      ticket_assignments.note,
      ticket_assignments.assigned_at
      FROM ticket_assignments
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<TicketAssignment | null> {
    const [rows] = await this.db.query<TicketAssignment[]>(
      `SELECT
      ticket_assignments.id,
      ticket_assignments.ticket_id,
      ticket_assignments.assigned_team_id,
      ticket_assignments.assigned_staff_id,
      ticket_assignments.assigned_by,
      ticket_assignments.note,
      ticket_assignments.assigned_at
      FROM ticket_assignments
      WHERE ticket_assignments.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(
    dto: CreateTicketAssignmentDto,
  ): Promise<TicketAssignment | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO ticket_assignments (ticket_id, assigned_team_id, assigned_staff_id, assigned_by, note) VALUES (?, ?, ?, ?, ?)',
      [
        dto.ticketId,
        dto.assignedTeamId,
        dto.assignedStaffId,
        dto.assignedBy,
        dto.note,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateTicketAssignmentDto,
  ): Promise<TicketAssignment | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE ticket_assignments
      SET
        ticket_id = ?,
        assigned_team_id = ?,
        assigned_staff_id = ?,
        assigned_by = ?,
        note = ?
      WHERE id = ?`,
      [
        dto.ticketId ?? current.ticket_id,
        dto.assignedTeamId ?? current.assigned_team_id,
        dto.assignedStaffId ?? current.assigned_staff_id,
        dto.assignedBy ?? current.assigned_by,
        dto.note ?? current.note,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'DELETE FROM ticket_assignments WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }
}
