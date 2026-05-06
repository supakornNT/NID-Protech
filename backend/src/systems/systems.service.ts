import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import type { System } from './interfaces/system.interface';

@Injectable()
export class SystemsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<System[]> {
    const [rows] = await this.db.query<System[]>(
      `SELECT
      systems.id,
      systems.name,
      systems.organization_id,
      organizations.name AS organization_name,
      systems.status,
      systems.created_at,
      systems.updated_at
      FROM systems
      LEFT JOIN organizations ON organizations.id = systems.organization_id
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<System | null> {
    const [rows] = await this.db.query<System[]>(
      `SELECT
      systems.id,
      systems.name,
      systems.organization_id,
      organizations.name AS organization_name,
      systems.status,
      systems.created_at,
      systems.updated_at
      FROM systems
      LEFT JOIN organizations ON organizations.id = systems.organization_id
      WHERE systems.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateSystemDto): Promise<System | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO systems (organization_id, name, status) VALUES (?, ?, ?)',
      [
        dto.organization_id,
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
      `UPDATE systems
      SET
        organization_id = ?,
        name = ?,
        status = ?
      WHERE id = ?`,
      [
        dto.organization_id ?? current.organization_id,
        dto.name ?? current.name,
        dto.status ?? current.status,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE systems SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }


}
