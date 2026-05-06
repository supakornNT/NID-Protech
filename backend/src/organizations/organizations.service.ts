import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import type { Organization } from './interfaces/organization.interface';

@Injectable()
export class OrganizationsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<Organization[]> {
    const [rows] = await this.db.query<Organization[]>(
      `SELECT
      organizations.id,
      organizations.name,
      organizations.type,
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
      'INSERT INTO organizations (name, type, status) VALUES (?, ?, ?)',
      [dto.name, dto.type, dto.status ?? 'active'],
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
        status = ?
      WHERE id = ?`,
      [
        dto.name ?? current.name,
        dto.type ?? current.type,
        dto.status ?? current.status,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE organizations SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }
}
