import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import type { Role } from './role.interface';

@Injectable()
export class RolesService {
  private readonly db: Pool;

  constructor(@Inject('DB') db: unknown) {
    this.db = db as Pool;
  }

  async findAll(): Promise<Role[]> {
    const [rows] = await this.db.query<Role[]>(
      'SELECT id, name, created_at FROM roles ORDER BY id ASC',
    );
    return rows;
  }

  async findOne(id: number): Promise<Role | null> {
    const [rows] = await this.db.query<Role[]>(
      'SELECT id, name, created_at FROM roles WHERE id = ?',
      [id],
    );
    return rows[0] ?? null;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO roles (name) VALUES (?)',
      [dto.name],
    );

    return (await this.findOne(result.insertId)) as Role;
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role | null> {
    await this.db.query<ResultSetHeader>(
      'UPDATE roles SET name = ? WHERE id = ?',
      [dto.name, id],
    );

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.db.query<ResultSetHeader>('DELETE FROM roles WHERE id = ?', [
      id,
    ]);
    return { message: 'deleted' };
  }
}
