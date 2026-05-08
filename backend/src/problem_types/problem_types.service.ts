import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateProblemTypeDto } from './dto/create-problem-type.dto';
import { UpdateProblemTypeDto } from './dto/update-problem-type.dto';
import type { ProblemType } from './interfaces/problem-type.interface';

@Injectable()
export class ProblemTypesService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<ProblemType[]> {
    const [rows] = await this.db.query<ProblemType[]>(
      `SELECT
      problem_types.id,
      problem_types.name,
      problem_types.report_type,
      problem_types.status,
      problem_types.created_at,
      problem_types.updated_at
      FROM problem_types
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<ProblemType | null> {
    const [rows] = await this.db.query<ProblemType[]>(
      `SELECT
      problem_types.id,
      problem_types.name,
      problem_types.report_type,
      problem_types.status,
      problem_types.created_at,
      problem_types.updated_at
      FROM problem_types
      WHERE problem_types.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateProblemTypeDto): Promise<ProblemType | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO problem_types (name, report_type, status) VALUES (?, ?, ?)',
      [dto.name, dto.report_type, dto.status ?? 'active'],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateProblemTypeDto,
  ): Promise<ProblemType | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE problem_types
      SET
        name = ?,
        report_type = ?,
        status = ?
      WHERE id = ?`,
      [
        dto.name ?? current.name,
        dto.report_type ?? current.report_type,
        dto.status ?? current.status,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE problem_types SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }

  async findByReportType(type: string): Promise<ProblemType[]> {
    const [rows] = await this.db.query<ProblemType[]>(
      `SELECT id, name, report_type
       FROM problem_types
       WHERE report_type = ? AND status = 'active'`,
      [type],
    );

    return rows;
  }
}
