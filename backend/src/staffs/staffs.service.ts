import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import type { Staff } from './interfaces/staff.interface';

@Injectable()
export class StaffsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<Staff[]> {
    const [rows] = await this.db.query<Staff[]>(
      `SELECT
      staffs.id,
      staffs.name,
      staffs.surname,
      staffs.email,
      staffs.phone,
      staffs.password_hash,
      staffs.status,
      staffs.created_at,
      staffs.updated_at
      FROM staffs
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<Staff | null> {
    const [rows] = await this.db.query<Staff[]>(
      `SELECT
      staffs.id,
      staffs.name,
      staffs.surname,
      staffs.email,
      staffs.phone,
      staffs.password_hash,
      staffs.status,
      staffs.created_at,
      staffs.updated_at
      FROM staffs
      WHERE staffs.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateStaffDto): Promise<Staff | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO staffs (name, surname, email, phone, password_hash, status) VALUES (?, ?, ?, ?, ?, ?)',
      [
        dto.name,
        dto.surname,
        dto.email,
        dto.phone,
        dto.passwordHash,
        dto.status ?? 'active',
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateStaffDto): Promise<Staff | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE staffs
      SET
        name = ?,
        surname = ?,
        email = ?,
        phone = ?,
        password_hash = ?,
        status = ?
      WHERE id = ?`,
      [
        dto.name ?? current.name,
        dto.surname ?? current.surname,
        dto.email ?? current.email,
        dto.phone ?? current.phone,
        dto.passwordHash ?? current.password_hash,
        dto.status ?? current.status,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE staffs SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }

  async inactive(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE staffs SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }

  async active(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE staffs SET status = ? WHERE id = ?',
      ['active', id],
    );

    return this.findOne(id);
  }
}
