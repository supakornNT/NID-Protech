import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateProblemTypeDto } from './dto/create-problem-type.dto';
import { QueryProblemTypeDto } from './dto/query-problem-type.dto';
import { UpdateProblemTypeDto } from './dto/update-problem-type.dto';
import type { ProblemType } from './interfaces/problem-type.interface';

@Injectable()
export class ProblemTypesService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  private readonly problemTypesBaseSelect = `
    SELECT
      problem_types.id,
      problem_types.code,
      problem_types.name,
      problem_types.request_type,
      problem_types.status,
      problem_types.created_at,
      problem_types.updated_at
    FROM problem_types
  `;

  async findAll(query: QueryProblemTypeDto = {}): Promise<ProblemType[]> {
    const where: string[] = [];
    const params: Array<number | string> = [];
    const search = query.search?.trim();
    const requestType = query.requestType ?? query.request_type;

    if (requestType) {
      where.push('pt.request_type = ?');
      params.push(requestType);
    }

    if (search) {
      where.push('(pt.code LIKE ? OR pt.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await this.db.query<ProblemType[]>(
      `SELECT pt.*
       FROM (${this.problemTypesBaseSelect}) AS pt
       ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY pt.created_at ASC, pt.id ASC
      `,
      params,
    );

    return rows;
  }

  async findOne(id: number): Promise<ProblemType | null> {
    const [rows] = await this.db.query<ProblemType[]>(
      `SELECT pt.*
      FROM (${this.problemTypesBaseSelect}) AS pt
      WHERE pt.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  private async generateCode(requestType: string): Promise<string> {
    type ProblemTypeCodeAggregate = RowDataPacket & {
      total: number | null;
      maxCodeNumber: number | null;
    };

    const prefix = requestType === 'complaint' ? 'CO' : 'IS';
    const [rows] = await this.db.query<ProblemTypeCodeAggregate[]>(
      `SELECT
         COUNT(*) AS total,
         MAX(
           CASE
             WHEN code REGEXP ? THEN CAST(SUBSTRING(code, 3) AS UNSIGNED)
             ELSE NULL
           END
         ) AS maxCodeNumber
       FROM problem_types
       WHERE request_type = ?`,
      [`^${prefix}[0-9]{3}$`, requestType],
    );
    const nextNumber =
      Math.max(
        Number(rows[0]?.total ?? 0),
        Number(rows[0]?.maxCodeNumber ?? 0),
      ) + 1;

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  }

  async create(dto: CreateProblemTypeDto): Promise<ProblemType | null> {
    const name = dto.name?.trim();
    const requestType = dto.requestType ?? dto.request_type ?? 'issue';
    const code = await this.generateCode(requestType);

    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO problem_types (code, name, request_type, status) VALUES (?, ?, ?, ?)',
      [code, name, requestType, dto.status ?? 'active'],
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
        request_type = ?,
        status = ?
      WHERE id = ?`,
      [
        dto.name?.trim() ?? current.name,
        dto.requestType ?? dto.request_type ?? current.request_type,
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

  async findByRequestType(type: string): Promise<ProblemType[]> {
    const [rows] = await this.db.query<ProblemType[]>(
      `SELECT pt.id, pt.code, pt.name, pt.request_type
       FROM (${this.problemTypesBaseSelect}) AS pt
       WHERE pt.request_type = ? AND pt.status = 'active'`,
      [type],
    );

    return rows;
  }
}
