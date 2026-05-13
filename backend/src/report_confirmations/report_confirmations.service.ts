import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateRequestConfirmationDto } from './dto/create-report-confirmation.dto';
import { UpdateRequestConfirmationDto } from './dto/update-report-confirmation.dto';
import type { RequestConfirmation } from './interfaces/report-confirmation.interface';

@Injectable()
export class RequestConfirmationsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<RequestConfirmation[]> {
    const [rows] = await this.db.query<RequestConfirmation[]>(
      `SELECT
      request_confirmations.id,
      request_confirmations.request_id,
      request_confirmations.customer_id,
      request_confirmations.result,
      request_confirmations.comment,
      request_confirmations.score,
      request_confirmations.confirmed_at
      FROM request_confirmations
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<RequestConfirmation | null> {
    const [rows] = await this.db.query<RequestConfirmation[]>(
      `SELECT
      request_confirmations.id,
      request_confirmations.request_id,
      request_confirmations.customer_id,
      request_confirmations.result,
      request_confirmations.comment,
      request_confirmations.score,
      request_confirmations.confirmed_at
      FROM request_confirmations
      WHERE request_confirmations.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(
    dto: CreateRequestConfirmationDto,
  ): Promise<RequestConfirmation | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO request_confirmations (request_id, customer_id, result, comment, score) VALUES (?, ?, ?, ?, ?)',
      [dto.requestId, dto.customerId, dto.result, dto.comment, dto.score],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateRequestConfirmationDto,
  ): Promise<RequestConfirmation | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE request_confirmations
      SET
        request_id = ?,
        customer_id = ?,
        result = ?,
        comment = ?,
        score = ?
      WHERE id = ?`,
      [
        dto.requestId ?? current.request_id,
        dto.customerId ?? current.customer_id,
        dto.result ?? current.result,
        dto.comment ?? current.comment,
        dto.score ?? current.score,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'DELETE FROM request_confirmations WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }
}
