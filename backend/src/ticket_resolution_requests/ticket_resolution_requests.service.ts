import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateTicketResolutionRequestDto } from './dto/create-ticket-resolution-request.dto';
import { UpdateTicketResolutionRequestDto } from './dto/update-ticket-resolution-request.dto';
import type { TicketResolutionRequest } from './interfaces/ticket-resolution-request.interface';

@Injectable()
export class TicketResolutionRequestsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<TicketResolutionRequest[]> {
    const [rows] = await this.db.query<TicketResolutionRequest[]>(
      `SELECT
      ticket_resolution_requests.id,
      ticket_resolution_requests.ticket_id,
      ticket_resolution_requests.requested_by,
      ticket_resolution_requests.summary,
      ticket_resolution_requests.status,
      ticket_resolution_requests.reviewed_by,
      ticket_resolution_requests.reviewed_at,
      ticket_resolution_requests.reject_reason,
      ticket_resolution_requests.created_at
      FROM ticket_resolution_requests
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<TicketResolutionRequest | null> {
    const [rows] = await this.db.query<TicketResolutionRequest[]>(
      `SELECT
      ticket_resolution_requests.id,
      ticket_resolution_requests.ticket_id,
      ticket_resolution_requests.requested_by,
      ticket_resolution_requests.summary,
      ticket_resolution_requests.status,
      ticket_resolution_requests.reviewed_by,
      ticket_resolution_requests.reviewed_at,
      ticket_resolution_requests.reject_reason,
      ticket_resolution_requests.created_at
      FROM ticket_resolution_requests
      WHERE ticket_resolution_requests.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(
    dto: CreateTicketResolutionRequestDto,
  ): Promise<TicketResolutionRequest | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO ticket_resolution_requests (ticket_id, requested_by, summary, status, reviewed_by, reviewed_at, reject_reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        dto.ticketId,
        dto.requestedBy,
        dto.summary,
        dto.status,
        dto.reviewedBy,
        dto.reviewedAt,
        dto.rejectReason,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateTicketResolutionRequestDto,
  ): Promise<TicketResolutionRequest | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE ticket_resolution_requests
      SET
        ticket_id = ?,
        requested_by = ?,
        summary = ?,
        status = ?,
        reviewed_by = ?,
        reviewed_at = ?,
        reject_reason = ?
      WHERE id = ?`,
      [
        dto.ticketId ?? current.ticket_id,
        dto.requestedBy ?? current.requested_by,
        dto.summary ?? current.summary,
        dto.status ?? current.status,
        dto.reviewedBy ?? current.reviewed_by,
        dto.reviewedAt ?? current.reviewed_at,
        dto.rejectReason ?? current.reject_reason,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE ticket_resolution_requests SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }
}
