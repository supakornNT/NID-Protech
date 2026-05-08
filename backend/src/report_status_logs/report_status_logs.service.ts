import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateReportStatusLogDto } from './dto/create-report-status-log.dto';
import { UpdateReportStatusLogDto } from './dto/update-report-status-log.dto';
import type { ReportStatusLog } from './interfaces/report-status-log.interface';

@Injectable()
export class ReportStatusLogsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<ReportStatusLog[]> {
    const [rows] = await this.db.query<ReportStatusLog[]>(
      `SELECT
      report_status_logs.id,
      report_status_logs.report_id,
      report_status_logs.old_status,
      report_status_logs.new_status,
      report_status_logs.changed_by_type,
      report_status_logs.changed_by_id,
      report_status_logs.note,
      report_status_logs.created_at
      FROM report_status_logs
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<ReportStatusLog | null> {
    const [rows] = await this.db.query<ReportStatusLog[]>(
      `SELECT
      report_status_logs.id,
      report_status_logs.report_id,
      report_status_logs.old_status,
      report_status_logs.new_status,
      report_status_logs.changed_by_type,
      report_status_logs.changed_by_id,
      report_status_logs.note,
      report_status_logs.created_at
      FROM report_status_logs
      WHERE report_status_logs.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateReportStatusLogDto): Promise<ReportStatusLog | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO report_status_logs (report_id, old_status, new_status, changed_by_type, changed_by_id, note) VALUES (?, ?, ?, ?, ?, ?)',
      [
        dto.reportId,
        dto.oldStatus,
        dto.newStatus,
        dto.changedByType,
        dto.changedById,
        dto.note,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateReportStatusLogDto,
  ): Promise<ReportStatusLog | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE report_status_logs
      SET
        report_id = ?,
        old_status = ?,
        new_status = ?,
        changed_by_type = ?,
        changed_by_id = ?,
        note = ?
      WHERE id = ?`,
      [
        dto.reportId ?? current.report_id,
        dto.oldStatus ?? current.old_status,
        dto.newStatus ?? current.new_status,
        dto.changedByType ?? current.changed_by_type,
        dto.changedById ?? current.changed_by_id,
        dto.note ?? current.note,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'DELETE FROM report_status_logs WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }
}
