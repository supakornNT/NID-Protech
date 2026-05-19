import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { renderToBuffer } from '@react-pdf/renderer';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import React from 'react';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateExternalRequestDto } from './dto/create-request-external.dto';
import { CreateInternalRequestDto } from './dto/create-request-internal.dto';
import { CreateServiceRequestDto } from './dto/create-request-service.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import type { RequestRecord } from './interfaces/request.interface';
import type {
  RequestsAssign,
  RequestsDetail,
  RequestsScreening,
} from './interfaces/requests.interface';
import { RequestTemplate, type RequestData } from './templates/report.template';

@Injectable()
export class RequestsService implements OnModuleInit {
  constructor(@Inject('DB') private readonly db: Pool) {}
  private readonly pdfDir = join(process.cwd(), '..', 'uploads', 'pdf');

  onModuleInit() {
    mkdirSync(this.pdfDir, { recursive: true });
  }

  async findAll(): Promise<RequestRecord[]> {
    const [rows] = await this.db.query<RequestRecord[]>(
      `SELECT
        requests.id,
        requests.request_no,
        requests.customer_id,
        requests.system_id,
        requests.problem_type_id,
        requests.detail,
        CONCAT(customers.name, ' ', customers.surname) AS customer_name,
        requests.organization,
        systems.name AS system_name,
        problem_types.name AS problem_type_name,
        requests.title,
        requests.status,
        requests.score,
        requests.created_at,
        NULL AS resolve_due_at,
        requests.closed_at
      FROM requests
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id`,
    );

    return rows;
  }

  async findScreening(type: string): Promise<RequestsScreening[]> {
    const [rows] = await this.db.query<RequestsScreening[]>(
      `SELECT
        requests.id,
        requests.request_no AS requestNo,
        systems.name AS systemName,
        problem_types.request_type AS requestTypeName,
        requests.created_at AS createdAt
      FROM requests
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      WHERE problem_types.request_type = ?
      AND requests.status = 'screening'`,
      [type],
    );

    return rows;
  }

  async findDetail(id: number): Promise<RequestsDetail | null> {
    const [rows] = await this.db.query<RequestsDetail[]>(
      `SELECT
        requests.id,
        requests.request_no AS requestNo,
        customers.name AS customerName,
        requests.organization AS organizationName,
        systems.name AS systemName,
        problem_types.name AS problemName,
        requests.title AS title,
        requests.detail AS detail,
        requests.closed_at AS closedAt,
        requests.due_at AS dueAt
      FROM requests 
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      WHERE requests.id = ?`,
      [id],
    );

    return rows[0] ?? null;
  }

  async findOne(id: number): Promise<RequestRecord | null> {
    const [rows] = await this.db.query<RequestRecord[]>(
      `SELECT
        requests.id,
        requests.request_no,
        requests.customer_id,
        requests.system_id,
        requests.problem_type_id,
        requests.detail,
        CONCAT(customers.name, ' ', customers.surname) AS customer_name,
        requests.organization,
        systems.name AS system_name,
        problem_types.name AS problem_type_name,
        requests.title,
        requests.status,
        requests.score,
        requests.created_at,
        NULL AS resolve_due_at,
        requests.closed_at
      FROM requests
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      WHERE requests.id = ?`,
      [id],
    );

    return rows[0] ?? null;
  }

  async findAttachments(requestId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT id, original_name AS originalName, saved_name AS savedName, file_ext AS fileExt
       FROM attachments
       WHERE request_id = ?`,
      [requestId],
    );

    return rows;
  }

  async create(dto: CreateRequestDto): Promise<RequestRecord | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO requests (request_no, customer_id, organization, system_id, problem_type_id, title, detail, status, score, closed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        dto.requestNo ?? dto.request_no,
        dto.customerId ?? dto.customer_id,
        dto.organization ?? null,
        dto.systemId ?? dto.system_id ?? null,
        dto.problemTypeId ?? dto.problem_type_id,
        dto.title,
        dto.detail,
        dto.status,
        dto.score ?? null,
        dto.closedAt ?? dto.closed_at ?? null,
      ],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateRequestDto,
  ): Promise<RequestRecord | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE requests
      SET
        request_no = ?,
        customer_id = ?,
        organization = ?,
        system_id = ?,
        problem_type_id = ?,
        title = ?,
        detail = ?,
        status = ?,
        score = ?,
        closed_at = ?
      WHERE id = ?`,
      [
        dto.request_no ?? current.request_no,
        dto.customer_id ?? current.customer_id,
        dto.organization ?? current.organization,
        dto.system_id ?? current.system_id,
        dto.problem_type_id ?? current.problem_type_id,
        dto.title ?? current.title,
        dto.detail ?? current.detail,
        dto.status ?? current.status,
        dto.score ?? current.score,
        dto.closed_at ?? current.closed_at,
        id,
      ],
    );

    return this.findOne(id);
  }

  async updateStatus(id: number, status: string) {
    const [rows] = await this.db.query<ResultSetHeader>(
      'UPDATE requests SET status = ? WHERE id = ?',
      [status, id],
    );

    return rows;
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>('DELETE FROM requests WHERE id = ?', [
      id,
    ]);

    return { message: 'deleted' };
  }

  async findAssign(): Promise<RequestsAssign[]> {
    const [rows] = await this.db.query<RequestsAssign[]>(
      `SELECT
        requests.id,
        requests.title,
        systems.name AS systemName,
        customers.name AS customerName,
        customers.surname AS customerSurname,
        problem_types.request_type AS probleTypeName,
        problem_types.name AS problemName
      FROM requests
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      WHERE requests.status = 'assigned'`,
    );

    return rows;
  }

  private async insertAttachments(
    requestId: number,
    files: Express.Multer.File[],
  ) {
    for (const file of files) {
      const ext = file.originalname.split('.').pop() ?? '';
      await this.db.query(
        'INSERT INTO attachments (request_id, original_name, saved_name, file_ext) VALUES (?, ?, ?, ?)',
        [requestId, file.originalname, file.filename, ext],
      );
    }
  }

  async createRequestInternal(
    dto: CreateInternalRequestDto,
    files: Express.Multer.File[],
  ) {
    const requestNo = `REQ-${Date.now()}`;
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO requests (request_no, customer_id, organization, system_id, problem_type_id, title, detail, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'screening')`,
      [
        requestNo,
        dto.customer_id,
        dto.organization,
        dto.system_id,
        dto.problem_type_id,
        dto.title,
        dto.detail,
      ],
    );
    await this.insertAttachments(result.insertId, files);
    return { id: result.insertId, requestNo };
  }

  async createRequestExternal(
    dto: CreateExternalRequestDto,
    files: Express.Multer.File[],
  ) {
    const requestNo = `REQ-${Date.now()}`;
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO requests (request_no, customer_id, system_id, problem_type_id, title, detail, status)
       VALUES (?, ?, ?, ?, ?, ?, 'screening')`,
      [
        requestNo,
        dto.customer_id,
        dto.system_id,
        dto.problem_type_id,
        dto.title,
        dto.detail,
      ],
    );
    await this.insertAttachments(result.insertId, files);
    return { id: result.insertId, requestNo };
  }

  async createRequestService(
    dto: CreateServiceRequestDto,
    files: Express.Multer.File[],
  ) {
    const requestNo = `REQ-${Date.now()}`;
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO requests (request_no, customer_id, problem_type_id, title, detail, status)
       VALUES (?, ?, ?, ?, ?, 'screening')`,
      [
        requestNo,
        dto.customer_id ?? null,
        dto.problem_type_id,
        dto.title,
        dto.detail,
      ],
    );
    await this.insertAttachments(result.insertId, files);
    return { id: result.insertId, requestNo };
  }

  async updateResolved(id: number, resolved: string) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `
      UPDATE
      requests SET resolved_at = ? WHERE id = ?
      `,
      [resolved, id],
    );
    return rows;
  }

  async updateDueAt(id: number, dueAt: string) {
    await this.db.query(`UPDATE requests SET due_at = ? WHERE id = ?`, [
      dueAt,
      id,
    ]);
  }

  async getOrGenerate(data: RequestData): Promise<string> {
    const filePath = join(this.pdfDir, `${data.id}.pdf`);

    if (!existsSync(filePath)) {
      const element = React.createElement(RequestTemplate, {
        data,
      }) as unknown as React.ReactElement<any>;
      const buffer = await renderToBuffer(element);
      await writeFile(filePath, buffer);
    }

    return filePath;
  }
}
