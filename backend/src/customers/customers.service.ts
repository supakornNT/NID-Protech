import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import type { Customer } from './interfaces/customer.interface';
import {
  AdminCustomer,
  CountRow,
  GetCustomersQuery,
  PublicAdminCustomerList,
} from './interfaces/admin.interface';

@Injectable()
export class CustomersService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<Customer[]> {
    const [rows] = await this.db.query<Customer[]>(
      `SELECT
      customers.id,
      customers.name,
      customers.surname,
      customers.email,
      customers.phone,
      customers.customer_type,
      customers.organization_id,
      customers.status,
      customers.created_at,
      customers.updated_at
      FROM customers
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<Customer | null> {
    const [rows] = await this.db.query<Customer[]>(
      `SELECT
      customers.id,
      customers.name,
      customers.surname,
      customers.email,
      customers.phone,
      customers.customer_type,
      customers.organization_id,
      customers.status,
      customers.created_at,
      customers.updated_at
      FROM customers
      WHERE customers.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }
  async findName(id: number): Promise<Customer | null> {
    const [rows] = await this.db.query<Customer[]>(
      `SELECT
      customers.name,
      customers.surname,
      customers.email,
      customers.phone,
      customers.organization_id
      FROM customers
      WHERE customers.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }
  async findUnapproved(
    query: GetCustomersQuery,
  ): Promise<PublicAdminCustomerList> {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const offset = (page - 1) * limit;
    const search = query.search?.trim() ?? '';

    const whereClauses = [`customers.status = 'pending'`];
    const params: Array<string | number> = [];

    if (search) {
      whereClauses.push(`(
        customers.name LIKE ?
        OR customers.surname LIKE ?
        OR customers.email LIKE ?
        OR customers.phone LIKE ?
      )`);
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    const whereSql = whereClauses.join(' AND ');

    const [countRows] = await this.db.query<CountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM customers
        WHERE ${whereSql}
      `,
      params,
    );

    const [rows] = await this.db.query<AdminCustomer[]>(
      `
        SELECT
          customers.id,
          CONCAT(customers.name, ' ', customers.surname) AS name,
          customers.email,
          customers.phone,
          customers.customer_type AS customerType,
          customers.organization_id AS organizationId,
          customers.status,
          customers.created_at AS createdAt,
          customers.updated_at AS updatedAt
        FROM customers
        WHERE ${whereSql}
        ORDER BY customers.created_at DESC
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
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    };
  }

  async create(dto: CreateCustomerDto): Promise<Customer | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO customers (name, surname, email, phone, customer_type, organization_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        dto.name,
        dto.surname,
        dto.email,
        dto.phone,
        dto.customerType ?? dto.customer_type,
        dto.organizationId ?? dto.organization_id ?? null,
        dto.status ?? 'pending',
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE customers
      SET
        name = ?,
        surname = ?,
        email = ?,
        phone = ?,
        customer_type = ?,
        organization_id = ?,
        status = ?
      WHERE id = ?`,
      [
        dto.name ?? current.name,
        dto.surname ?? current.surname,
        dto.email ?? current.email,
        dto.phone ?? current.phone,
        dto.customerType ?? dto.customer_type ?? current.customer_type,
        dto.organizationId ?? dto.organization_id ?? current.organization_id,
        dto.status ?? current.status,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }

  async approve(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['approved', id],
    );

    return this.findOne(id);
  }

  async reject(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['rejected', id],
    );

    return this.findOne(id);
  }

  async inactive(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE customers SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }
}
