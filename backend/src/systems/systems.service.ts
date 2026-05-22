import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';

import { getCountTotal, optionalEnumValue, optionalText, positiveIntFromQuery } from '@/common/validation/input-rules';
import { CreateSystemDto } from './dto/create-system.dto';
import { SystemQueryDto } from './dto/query-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import type { AdminSystem, CountRow, PublicAdminSystemList } from './interfaces/admin.interface';
import type { System, SystemOption } from './interfaces/system.interface';

const SYSTEM_STATUS_VALUES = ['active', 'inactive'] as const;

@Injectable()
export class SystemsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  private readonly baseSelectSql = `
    SELECT
      systems.id AS id,
      systems.name AS name,
      systems.organization_id AS organizationId,
      organizations.name AS organizationName,
      systems.status AS status,
      systems.created_at AS createdAt,
      systems.updated_at AS updatedAt
    FROM systems
    LEFT JOIN organizations
      ON organizations.id = systems.organization_id
  `;

  private normalizeQuery(query: SystemQueryDto) {
    return {
      page: positiveIntFromQuery(query.page, 'page', 1),
      limit: positiveIntFromQuery(query.limit, 'limit', 10, 100),
      search: optionalText(query.search, 'search', 255),
      status: optionalEnumValue(query.status, 'status', SYSTEM_STATUS_VALUES),
    };
  }

  private buildWhere(query: SystemQueryDto) {
    const normalizedQuery = this.normalizeQuery(query);
    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    if (normalizedQuery.search) {
      const like = `%${normalizedQuery.search}%`;
      whereClauses.push(`(
        organizations.name LIKE ?
        OR systems.name LIKE ?
      )`);
      params.push(like, like);
    }

    if (normalizedQuery.status) {
      whereClauses.push(`systems.status = ?`);
      params.push(normalizedQuery.status);
    }

    return {
      normalizedQuery,
      whereSql:
        whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '',
      params,
    };
  }

  async findAll(): Promise<System[]> {
    const [rows] = await this.db.query<System[]>(
      `
        ${this.baseSelectSql}
        ORDER BY systems.created_at DESC, systems.id DESC
      `,
    );

    return rows;
  }

  async findTable(query: SystemQueryDto): Promise<PublicAdminSystemList> {
    const { normalizedQuery, whereSql, params } = this.buildWhere(query);
    const page = normalizedQuery.page;
    const limit = normalizedQuery.limit;

    const [countRows] = await this.db.query<CountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM systems
        LEFT JOIN organizations
          ON organizations.id = systems.organization_id
        ${whereSql}
      `,
      params,
    );

    const total = getCountTotal(countRows, 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    const [rows] = await this.db.query<AdminSystem[]>(
      `
        ${this.baseSelectSql}
        ${whereSql}
        ORDER BY systems.created_at DESC, systems.id DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    return {
      items: rows,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: number): Promise<System | null> {
    const [rows] = await this.db.query<System[]>(
      `
        ${this.baseSelectSql}
        WHERE systems.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async findByOrganization(organizationId: number): Promise<SystemOption[]> {
    const [rows] = await this.db.query<SystemOption[]>(
      `
        SELECT
          systems.id AS id,
          systems.name AS name
        FROM systems
        WHERE systems.organization_id = ?
          AND systems.status = 'active'
        ORDER BY systems.name ASC, systems.id ASC
      `,
      [organizationId],
    );

    return rows;
  }

  async findName(id: number): Promise<SystemOption | null> {
    const [rows] = await this.db.query<SystemOption[]>(
      `
        SELECT
          systems.id AS id,
          systems.name AS name
        FROM systems
        WHERE systems.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateSystemDto): Promise<System | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      `
        INSERT INTO systems (organization_id, name, status)
        VALUES (?, ?, ?)
      `,
      [
        dto.organizationId,
        dto.name,
        dto.status ?? 'active',
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateSystemDto): Promise<System | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `
        UPDATE systems
        SET
          organization_id = ?,
          name = ?,
          status = ?
        WHERE id = ?
      `,
      [
        dto.organizationId ?? current.organizationId,
        dto.name ?? current.name,
        dto.status ?? current.status,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number): Promise<System | null> {
    await this.db.query<ResultSetHeader>(
      `
        UPDATE systems
        SET status = ?
        WHERE id = ?
      `,
      ['inactive', id],
    );

    return this.findOne(id);
  }
}
