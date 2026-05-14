import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { extname } from 'path';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import type { RequestRecord } from './interfaces/request.interface';
import { CreateInternalRequestDto } from './dto/create-request-internal.dto';
import { CreateExternalRequestDto } from './dto/create-request-external.dto';
import { CreateServiceRequestDto } from './dto/create-request-service.dto';
import type {
  RequestsAssign,
  RequestsDetail,
  RequestsScreening,
} from './interfaces/requests.interface';

@Injectable()
export class RequestsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  // --- Staff screening methods ---
  async findScreening(type: string) {
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

  async findDetail(id: number) {
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
        requests.closed_at AS closedAt
      FROM requests
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      WHERE requests.id = ?`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findAttachments(requestId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT id, original_name, saved_name, file_ext
       FROM attachments
       WHERE request_id = ?`,
      [requestId],
    );
    return rows;
  }

  async updateStatus(id: number, status: string) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `UPDATE requests SET status = ? WHERE id = ?`,
      [status, id],
    );
    return rows;
  }

  async findAssign() {
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

  // --- CRUD methods ---
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

  async create(dto: CreateRequestDto): Promise<RequestRecord | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO requests
        (request_no, customer_id, organization, system_id, problem_type_id, title, detail, status, score, closed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    if (!current) return null;

    await this.db.query<ResultSetHeader>(
      `UPDATE requests SET
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

  async remove(id: number) {
    await this.db.query<ResultSetHeader>('DELETE FROM requests WHERE id = ?', [
      id,
    ]);
    return { message: 'deleted' };
  }

  async createRequestInternal(
    dto: CreateInternalRequestDto,
    files: Express.Multer.File[],
  ): Promise<RequestRecord | null> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [countRows] = await this.db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM requests WHERE DATE(created_at) = CURDATE()',
    );
    const seq = String((countRows[0].total as number) + 1).padStart(3, '0');
    const requestNo = `RPT-${dateStr}-${seq}`;

    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO requests
        (request_no, customer_id, organization, system_id, problem_type_id, title, detail, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'screening')`,
      [
        requestNo,
        Number(dto.customer_id),
        dto.organization,
        Number(dto.system_id),
        Number(dto.problem_type_id),
        dto.title,
        dto.detail,
      ],
    );
    const requestId = result.insertId;

    for (const file of files) {
      await this.db.query<ResultSetHeader>(
        `INSERT INTO attachments (request_id, attachment_type, original_name, file_ext)
         VALUES (?, 'request_evidence', ?, ?)`,
        [
          requestId,
          file.originalname,
          extname(file.originalname).replace('.', ''),
        ],
      );
    }
    return this.findOne(requestId);
  }

  async createRequestExternal(
    dto: CreateExternalRequestDto,
    files: Express.Multer.File[],
  ): Promise<RequestRecord | null> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [countRows] = await this.db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM requests WHERE DATE(created_at) = CURDATE()',
    );
    const seq = String((countRows[0].total as number) + 1).padStart(3, '0');
    const requestNo = `RPT-${dateStr}-${seq}`;

    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO requests
        (request_no, customer_id, system_id, problem_type_id, title, detail, status)
       VALUES (?, ?, ?, ?, ?, ?, 'screening')`,
      [
        requestNo,
        Number(dto.customer_id),
        Number(dto.system_id),
        Number(dto.problem_type_id),
        dto.title,
        dto.detail,
      ],
    );
    const requestId = result.insertId;

    for (const file of files) {
      await this.db.query<ResultSetHeader>(
        `INSERT INTO attachments (request_id, attachment_type, original_name, file_ext)
         VALUES (?, 'request_evidence', ?, ?)`,
        [
          requestId,
          file.originalname,
          extname(file.originalname).replace('.', ''),
        ],
      );
    }
    return this.findOne(requestId);
  }

  async createRequestService(
    dto: CreateServiceRequestDto,
    files: Express.Multer.File[],
  ): Promise<RequestRecord | null> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [countRows] = await this.db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM requests WHERE DATE(created_at) = CURDATE()',
    );
    const seq = String((countRows[0].total as number) + 1).padStart(3, '0');
    const requestNo = `CP-${dateStr}-${seq}`;

    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO requests
        (request_no, customer_id, problem_type_id, title, detail, status)
       VALUES (?, ?, ?, ?, ?, 'screening')`,
      [
        requestNo,
        dto.customer_id ? Number(dto.customer_id) : null,
        Number(dto.problem_type_id),
        dto.title,
        dto.detail,
      ],
    );
    const requestId = result.insertId;

    for (const file of files) {
      await this.db.query<ResultSetHeader>(
        `INSERT INTO attachments (request_id, attachment_type, original_name, file_ext)
         VALUES (?, 'request_evidence', ?, ?)`,
        [
          requestId,
          file.originalname,
          extname(file.originalname).replace('.', ''),
        ],
      );
    }
    return this.findOne(requestId);
  }
}
