import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import type { Role } from './interfaces/role.interface';

@Injectable()
export class RolesService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<Role[]> {
    const [rows] = await this.db.query<Role[]>(
      `SELECT
      roles.id,
      roles.name,
      roles.created_at
      FROM roles
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<Role | null> {
    const [rows] = await this.db.query<Role[]>(
      `SELECT
      roles.id,
      roles.name,
      roles.created_at
      FROM roles
      WHERE roles.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateRoleDto): Promise<Role | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO roles (name) VALUES (?)',
      [dto.name],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE roles
      SET
        name = ?
      WHERE id = ?`,
      [dto.name ?? current.name, id],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>('DELETE FROM roles WHERE id = ?', [
      id,
    ]);

    return { message: 'deleted' };
  }
}
