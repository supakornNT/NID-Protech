import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import type { Report } from './interfaces/report.interface';

@Injectable()
export class ReportsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<Report[]> {
    const [rows] = await this.db.query<Report[]>(
      `SELECT
      reports.id,
      reports.report_no,
      CONCAT(customers.name, ' ', customers.surname) AS customer_name,
      systems.name AS system_name,
      problem_types.name AS problem_type_name,
      reports.title,
      reports.status,
      reports.score,
      reports.created_at,
      reports.closed_at
      FROM reports
      LEFT JOIN customers ON customers.id = reports.customer_id
      LEFT JOIN systems ON systems.id = reports.system_id
      LEFT JOIN problem_types ON problem_types.id = reports.problem_type_id
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<Report | null> {
    const [rows] = await this.db.query<Report[]>(
      `SELECT
      reports.id,
      reports.report_no,
      CONCAT(customers.name, ' ', customers.surname) AS customer_name,
      systems.name AS system_name,
      problem_types.name AS problem_type_name,
      reports.title,
      reports.status,
      reports.score,
      reports.created_at,
      reports.closed_at
      FROM reports
      LEFT JOIN customers ON customers.id = reports.customer_id
      LEFT JOIN systems ON systems.id = reports.system_id
      LEFT JOIN problem_types ON problem_types.id = reports.problem_type_id
      WHERE reports.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateReportDto): Promise<Report | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO reports (report_no, customer_id, system_id, problem_type_id, title, detail, status, score, reject_reason, resolve_due_at, closed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        dto.reportNo,
        dto.customerId,
        dto.systemId,
        dto.problemTypeId,
        dto.title,
        dto.detail,
        dto.status,
        dto.score,
        dto.rejectReason,
        dto.resolveDueAt,
        dto.closedAt,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateReportDto): Promise<Report | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE reports
      SET
        report_no = ?,
        customer_id = ?,
        system_id = ?,
        problem_type_id = ?,
        title = ?,
        detail = ?,
        status = ?,
        score = ?,
        reject_reason = ?,
        resolve_due_at = ?,
        closed_at = ?
      WHERE id = ?`,
      [
        dto.reportNo ?? current.report_no,
        dto.customerId ?? current.customer_id,
        dto.systemId ?? current.system_id,
        dto.problemTypeId ?? current.problem_type_id,
        dto.title ?? current.title,
        dto.detail ?? current.detail,
        dto.status ?? current.status,
        dto.score ?? current.score,
        dto.rejectReason ?? current.reject_reason,
        dto.resolveDueAt ?? current.resolve_due_at,
        dto.closedAt ?? current.closed_at,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE reports SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }
}
