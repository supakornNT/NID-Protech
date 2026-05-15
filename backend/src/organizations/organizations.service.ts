import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import type { Organization } from './interfaces/organization.interface';
import {
  AdminOrganization,
  PublicAdminOrganizationList,
} from './interfaces/admin.interface';
import { OrganizationQueryDto } from './dto/query-organization.dto';
import { CountRow } from '@/customers/interfaces/admin.interface';

@Injectable()
export class OrganizationsService {
  constructor(@Inject('DB') private readonly db: Pool) {}
  async maketable(
    query: OrganizationQueryDto,
  ): Promise<PublicAdminOrganizationList> {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const offset = (page - 1) * limit;
    const search = query.search?.trim() ?? '';
    const status = query.status?.trim() ?? '';
    const organizationType = query.type?.trim() ?? '';

    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    if (search) {
      whereClauses.push(`(
        organizations.name LIKE ?
        OR organizations.email LIKE ?
        OR organizations.phone LIKE ?
      )`);
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    if (status) {
      whereClauses.push(`organizations.status = ?`);
      params.push(status);
    }

    if (organizationType) {
      whereClauses.push(`organizations.type = ?`);
      params.push(organizationType);
    }

    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const [countRows] = await this.db.query<CountRow[]>(
      `
    SELECT COUNT(*) AS total
    FROM organizations
    ${whereSql}
  `,
      params,
    );

    const [rows] = await this.db.query<AdminOrganization[]>(
      `
        SELECT
          organizations.id,
          organizations.name AS organizationName,
          organizations.email,
          organizations.phone,
          organizations.type AS organizationType,
          organizations.status,
          organizations.created_at AS createdAt,
          organizations.updated_at AS updatedAt
        FROM organizations
        ${whereSql}
        ORDER BY organizations.created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    const total = Number(countRows[0]?.total ?? 0);

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
  async findAll(): Promise<Organization[]> {
    const [rows] = await this.db.query<Organization[]>(
      `SELECT
      organizations.id,
      organizations.name,
      organizations.type,
      organizations.email,
      organizations.phone,
      organizations.status,
      organizations.created_at,
      organizations.updated_at
      FROM organizations
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<Organization | null> {
    const [rows] = await this.db.query<Organization[]>(
      `SELECT
      organizations.id,
      organizations.name,
      organizations.type,
      organizations.email,
      organizations.phone,
      organizations.status,
      organizations.created_at,
      organizations.updated_at
      FROM organizations
      WHERE organizations.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateOrganizationDto): Promise<Organization | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO organizations (name, type, email, phone, status) VALUES (?, ?, ?, ?, ?)',
      [
        dto.name?.trim(),
        dto.type?.trim() ?? null,
        dto.email?.trim() || null,
        dto.phone?.trim() || null,
        dto.status?.trim() ?? 'active',
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateOrganizationDto,
  ): Promise<Organization | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE organizations
      SET
        name = ?,
        type = ?,
        email = ?,
        phone = ?,
        status = ?
      WHERE id = ?`,
      [
        dto.name ?? current.name,
        dto.type ?? current.type,
        dto.email ?? current.email,
        dto.phone ?? current.phone,
        dto.status ?? current.status,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    const deleted = await this.findOne(id);

    await this.db.query<ResultSetHeader>(
      'DELETE FROM organizations WHERE id = ?',
      [id],
    );

    return deleted;
  }

  async findActive(): Promise<Organization[]> {
    const [rows] = await this.db.query<Organization[]>(
      `SELECT id, name, type, email, phone FROM organizations WHERE status = 'active'`,
    );

    return rows;
  }

  async findName(id: number): Promise<Organization | null> {
    const [rows] = await this.db.query<Organization[]>(
      `SELECT id, name, email, phone FROM organizations WHERE id = ? `,
      [id],
    );
    return rows[0] ?? null;
  }
}
