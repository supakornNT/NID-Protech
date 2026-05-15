import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateProblemTypeDto } from './dto/create-problem-type.dto';
import { QueryProblemTypeDto } from './dto/query-problem-type.dto';
import { UpdateProblemTypeDto } from './dto/update-problem-type.dto';
import type {
  ProblemType,
  ProblemTypeCountRow,
  PublicProblemTypeList,
} from './interfaces/problem-type.interface';
import {
  ACTIVE_STATUS_VALUES,
  PROBLEM_TYPE_REQUEST_TYPES,
  normalizeOptionalString,
  optionalEnumValue,
  optionalText,
  positiveIntFromQuery,
  requireEnumValue,
  requireText,
  getCountTotal,
} from '@/common/validation/input-rules';

@Injectable()
export class ProblemTypesService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  private readonly problemTypesBaseSelect = `
    SELECT
      problem_types.id,
      problem_types.code,
      problem_types.name,
      problem_types.request_type AS requestType,
      problem_types.status,
      problem_types.created_at AS createdAt,
      problem_types.updated_at AS updatedAt
    FROM problem_types
  `;

  private normalizeListQuery(query: QueryProblemTypeDto) {
    return {
      page: positiveIntFromQuery(query.page, 'page', 1),
      limit: positiveIntFromQuery(query.limit, 'limit', 10, 100),
      search: optionalText(query.search, 'search', 255),
      requestType: optionalEnumValue(
        query.requestType ?? query.request_type,
        'requestType',
        PROBLEM_TYPE_REQUEST_TYPES,
      ),
    };
  }

  private normalizeProblemTypePayload(
    dto: CreateProblemTypeDto | UpdateProblemTypeDto,
  ) {
    const requestTypeInput = normalizeOptionalString(
      dto.requestType ?? dto.request_type,
    );

    return {
      name:
        dto.name === undefined ? undefined : requireText(dto.name, 'name', 255),
      requestType:
        requestTypeInput === undefined
          ? undefined
          : requireEnumValue(
              requestTypeInput,
              'requestType',
              PROBLEM_TYPE_REQUEST_TYPES,
            ),
      status:
        dto.status === undefined
          ? undefined
          : requireEnumValue(dto.status, 'status', ACTIVE_STATUS_VALUES),
    };
  }

  async findAll(
    query: QueryProblemTypeDto = {},
  ): Promise<PublicProblemTypeList> {
    const normalizedQuery = this.normalizeListQuery(query);
    const page = normalizedQuery.page;
    const limit = normalizedQuery.limit;
    const offset = (page - 1) * limit;
    const where: string[] = [];
    const params: Array<number | string> = [];
    const search = normalizedQuery.search;
    const requestType = normalizedQuery.requestType;

    if (requestType) {
      where.push('pt.requestType = ?');
      params.push(requestType);
    }

    if (search) {
      where.push('(pt.code LIKE ? OR pt.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await this.db.query<ProblemTypeCountRow[]>(
      `SELECT COUNT(*) AS total
       FROM (${this.problemTypesBaseSelect}) AS pt
       ${whereSql}
      `,
      params,
    );

    const [rows] = await this.db.query<ProblemType[]>(
      `SELECT pt.*
       FROM (${this.problemTypesBaseSelect}) AS pt
       ${whereSql}
       ORDER BY pt.createdAt ASC, pt.id ASC
       LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    const total = getCountTotal(countRows, 0);

    return {
      items: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
      maxCodeNumber: number | null;
    };

    const prefix = requestType === 'complaint' ? 'CO' : 'IS';
    const [rows] = await this.db.query<ProblemTypeCodeAggregate[]>(
      `SELECT
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
    const nextNumber = Number(rows[0]?.maxCodeNumber ?? 0) + 1;

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  }

  async create(dto: CreateProblemTypeDto): Promise<ProblemType | null> {
    const payload = this.normalizeProblemTypePayload(dto);
    const name = payload.name ?? requireText(dto.name, 'name', 255);
    const requestType = payload.requestType ?? 'issue';
    const status = payload.status ?? 'active';
    const code = await this.generateCode(requestType);

    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO problem_types (code, name, request_type, status) VALUES (?, ?, ?, ?)',
      [code, name, requestType, status],
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

    const payload = this.normalizeProblemTypePayload(dto);

    await this.db.query<ResultSetHeader>(
      `UPDATE problem_types
      SET
        name = ?,
        request_type = ?,
        status = ?
      WHERE id = ?`,
      [
        payload.name ?? current.name,
        payload.requestType ?? current.requestType,
        payload.status ?? current.status,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    const [relationRows] = await this.db.query<
      Array<RowDataPacket & { total: number }>
    >(
      `SELECT COUNT(*) AS total
       FROM requests
       WHERE problem_type_id = ?`,
      [id],
    );

    if (Number(relationRows[0]?.total ?? 0) > 0) {
      throw new BadRequestException(
        'ไม่สามารถลบประเภทนี้ได้ เนื่องจากมีคำขอที่ใช้งานประเภทนี้อยู่',
      );
    }

    const deleted = await this.findOne(id);

    await this.db.query<ResultSetHeader>(
      'DELETE FROM problem_types WHERE id = ?',
      [id],
    );

    return deleted;
  }

  async findByRequestType(type: string): Promise<ProblemType[]> {
    const [rows] = await this.db.query<ProblemType[]>(
      `SELECT pt.*
       FROM (${this.problemTypesBaseSelect}) AS pt
       WHERE pt.requestType = ? AND pt.status = 'active'`,
      [type],
    );

    return rows;
  }
}
