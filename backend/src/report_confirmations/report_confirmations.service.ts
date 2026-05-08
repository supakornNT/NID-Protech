import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateReportConfirmationDto } from './dto/create-report-confirmation.dto';
import { UpdateReportConfirmationDto } from './dto/update-report-confirmation.dto';
import type { ReportConfirmation } from './interfaces/report-confirmation.interface';

@Injectable()
export class ReportConfirmationsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<ReportConfirmation[]> {
    const [rows] = await this.db.query<ReportConfirmation[]>(
      `SELECT
      report_confirmations.id,
      report_confirmations.report_id,
      report_confirmations.customer_id,
      report_confirmations.result,
      report_confirmations.comment,
      report_confirmations.score,
      report_confirmations.confirmed_at
      FROM report_confirmations
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<ReportConfirmation | null> {
    const [rows] = await this.db.query<ReportConfirmation[]>(
      `SELECT
      report_confirmations.id,
      report_confirmations.report_id,
      report_confirmations.customer_id,
      report_confirmations.result,
      report_confirmations.comment,
      report_confirmations.score,
      report_confirmations.confirmed_at
      FROM report_confirmations
      WHERE report_confirmations.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(
    dto: CreateReportConfirmationDto,
  ): Promise<ReportConfirmation | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO report_confirmations (report_id, customer_id, result, comment, score) VALUES (?, ?, ?, ?, ?)',
      [dto.reportId, dto.customerId, dto.result, dto.comment, dto.score],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateReportConfirmationDto,
  ): Promise<ReportConfirmation | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE report_confirmations
      SET
        report_id = ?,
        customer_id = ?,
        result = ?,
        comment = ?,
        score = ?
      WHERE id = ?`,
      [
        dto.reportId ?? current.report_id,
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
      'DELETE FROM report_confirmations WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }
}
