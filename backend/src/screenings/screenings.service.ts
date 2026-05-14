import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import type { Screening } from './interfaces/screening.interface';

@Injectable()
export class ScreeningsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<Screening[]> {
    const [rows] = await this.db.query<Screening[]>(
      `SELECT
      screenings.id,
      screenings.request_id,
      screenings.screened_by,
      screenings.result,
      screenings.note,
      screenings.screened_at
      FROM screenings
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<Screening | null> {
    const [rows] = await this.db.query<Screening[]>(
      `SELECT
      screenings.id,
      screenings.request_id,
      screenings.screened_by,
      screenings.result,
      screenings.note,
      screenings.screened_at
      FROM screenings
      WHERE screenings.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateScreeningDto): Promise<Screening | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO screenings (request_id, screened_by, result, note) VALUES (?, ?, ?, ?)',
      [dto.requestId, dto.screenedBy, dto.result, dto.note],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateScreeningDto): Promise<Screening | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE screenings
      SET
        request_id = ?,
        screened_by = ?,
        result = ?,
        note = ?
      WHERE id = ?`,
      [
        dto.requestId ?? current.request_id,
        dto.screenedBy ?? current.screened_by,
        dto.result ?? current.result,
        dto.note ?? current.note,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'DELETE FROM screenings WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }
}
