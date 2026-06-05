import { Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
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
  RequestTracking,
  RequestTrackingLogRow,
  RequestTrackingRow,
} from './interfaces/requests.interface';
import { RequestTemplate, type RequestData } from './templates/report.template';

@Injectable()
export class RequestsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

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
      INNER JOIN problem_types ON problem_types.id = requests.problem_type_id
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
        requests.status AS status,
        requests.closed_at AS closedAt,
        requests.due_at AS dueAt,
        CONCAT(s2.name, ' ', s2.surname) AS assignedStaffName,
        EXISTS (
          SELECT 1 FROM request_confirmations
          WHERE request_id = requests.id AND result = 'reopened'
        ) AS wasReopened,
        (
          SELECT comment FROM request_confirmations
          WHERE request_id = requests.id AND result = 'reopened'
          ORDER BY id DESC LIMIT 1
        ) AS latestReopenComment
      FROM requests
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN tickets t ON t.id = (
        SELECT t2.id FROM tickets t2
        WHERE t2.request_id = requests.id
        ORDER BY t2.id DESC LIMIT 1
      )
      LEFT JOIN staffs s2 ON s2.id = t.assigned_staff_id
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
       WHERE request_id = ? AND ticket_id IS NULL AND status = 'show'`,
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
        requests.request_no AS requestNo,
        requests.title,
        systems.name AS systemName,
        customers.name AS customerName,
        customers.surname AS customerSurname,
        problem_types.request_type AS probleTypeName,
        problem_types.name AS problemName,
        CASE WHEN requests.status = 'in_progress'
          AND EXISTS (
            SELECT 1 FROM request_status_logs
            WHERE request_id = requests.id
              AND status = 'in_progress'
              AND changed_by_type = 'operator'
          )
        THEN 1 ELSE 0 END AS wasRejected
      FROM requests
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      WHERE requests.status = 'assigned'
        OR (
          requests.status = 'in_progress'
          AND EXISTS (
            SELECT 1 FROM request_status_logs
            WHERE request_id = requests.id
              AND status = 'in_progress'
              AND changed_by_type = 'operator'
          )
        )`,
    );

    return rows;
  }

  private async insertScreeningLog(requestId: number) {
    await this.db.query(
      `INSERT INTO request_status_logs (request_id, status, changed_by_type, changed_by_id, note)
       VALUES (?, 'screening', 'system', NULL, NULL)`,
      [requestId],
    );
  }

  private async generateRequestNo(prefix: 'REQ' | 'RPT'): Promise<string> {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt
       FROM requests
       WHERE request_no LIKE ?`,
      [`${prefix}-${dateStr}-%`],
    );

    const count = (rows[0]?.cnt as number) ?? 0;
    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}-${dateStr}-${seq}`;
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
    const requestNo = await this.generateRequestNo('REQ');
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
    await this.insertScreeningLog(result.insertId);
    return { id: result.insertId, requestNo };
  }

  async createRequestExternal(
    dto: CreateExternalRequestDto,
    files: Express.Multer.File[],
  ) {
    const requestNo = await this.generateRequestNo('REQ');
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
    await this.insertScreeningLog(result.insertId);
    return { id: result.insertId, requestNo };
  }

  async createRequestService(
    dto: CreateServiceRequestDto,
    files: Express.Multer.File[],
  ) {
    const requestNo = await this.generateRequestNo('RPT');
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
    await this.insertScreeningLog(result.insertId);
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

  async submitWork(requestId: number, staffId: number) {
    await this.db.query(
      `UPDATE requests SET status = 'waiting_confirm' WHERE id = ?`,
      [requestId],
    );
    await this.db.query(
      `INSERT INTO request_status_logs (request_id, status, changed_by_type, changed_by_id, note)
       VALUES (?, 'waiting_confirm', 'staff', ?, NULL)`,
      [requestId, staffId],
    );
    return { success: true };
  }

  async rejectWork(requestId: number, operatorId: number, note: string) {
    await this.db.query(
      `UPDATE requests SET status = 'in_progress' WHERE id = ?`,
      [requestId],
    );
    await this.db.query(
      `INSERT INTO request_status_logs (request_id, status, changed_by_type, changed_by_id, note)
       VALUES (?, 'in_progress', 'operator', ?, ?)`,
      [requestId, operatorId, note],
    );
    return { success: true };
  }

  async updateDueAt(id: number, dueAt: string) {
    await this.db.query(`UPDATE requests SET due_at = ? WHERE id = ?`, [
      dueAt,
      id,
    ]);
    await this.db.query(
      `UPDATE tickets
       SET due_at = ?
       WHERE request_id = ?
         AND status = 'assigned'
         AND due_at > ?`,
      [dueAt, id, dueAt],
    );
  }

  getPdfPath(id: number): string {
    return join(process.cwd(), '..', 'uploads', 'pdf', 'screening', `${id}.pdf`);
  }

  async findTracking(): Promise<RequestTracking[]> {
    const [requests] = await this.db.query<RequestTrackingRow[]>(
      `SELECT
        r.id,
        r.title,
        r.status,
        r.created_at AS createdAt,
        r.due_at AS dueAt,
        CONCAT(c.name, ' ', c.surname) AS customerName,
        s.name AS systemName,
        pt.name AS problemName,
        CASE WHEN
          (SELECT COUNT(*) FROM tickets t2 WHERE t2.request_id = r.id
           AND t2.status NOT IN ('resolved', 'waiting_confirm', 'closed', 'cancelled')) = 0
          AND
          (SELECT COUNT(*) FROM tickets t2 WHERE t2.request_id = r.id
           AND t2.status != 'cancelled') > 0
        THEN 1 ELSE 0 END AS allResolved,
        CASE WHEN r.status = 'in_progress'
          AND EXISTS (
            SELECT 1 FROM request_status_logs
            WHERE request_id = r.id
              AND status = 'in_progress'
              AND changed_by_type = 'operator'
          )
        THEN 1 ELSE 0 END AS wasRejected
      FROM requests r
      LEFT JOIN customers c ON c.id = r.customer_id
      LEFT JOIN systems s ON s.id = r.system_id
      LEFT JOIN problem_types pt ON pt.id = r.problem_type_id
      WHERE r.status NOT IN ('screening', 'rejected')
      ORDER BY r.created_at DESC`,
    );

    if (requests.length === 0) return [];

    const ids = requests.map((r) => r.id);
    const [logs] = await this.db.query<RequestTrackingLogRow[]>(
      `SELECT request_id, status, created_at
       FROM request_status_logs
       WHERE request_id IN (?)
       ORDER BY created_at DESC`,
      [ids],
    );

    const logMap = new Map<number, RequestTrackingLogRow[]>();
    for (const log of logs) {
      if (!logMap.has(log.request_id)) logMap.set(log.request_id, []);
      logMap.get(log.request_id)!.push(log);
    }

    const fmt = (d: Date | string | undefined, label: string) => {
      if (!d) return null;
      const dt = new Date(d);
      const h = String(dt.getHours()).padStart(2, '0');
      const m = String(dt.getMinutes()).padStart(2, '0');
      return {
        label,
        date: `${dt.getDate()}/${dt.getMonth() + 1}`,
        time: `${h}:${m}`,
      };
    };

    const STATUS_STEP_MAP = {
      screening: 0,
      assigned: 1,
      in_progress: 2,
      waiting_confirm: 3,
      closed: 4,
    };

    return requests.map((r) => {
      const rLogs = logMap.get(r.id) ?? [];
      const allSteps = [
        fmt(
          rLogs.find((l) => l.status === 'screening')?.created_at,
          'ยื่นเรื่อง',
        ),
        fmt(rLogs.find((l) => l.status === 'assigned')?.created_at, 'ตรวจสอบ'),
        fmt(
          rLogs.find((l) => l.status === 'in_progress')?.created_at,
          'ดำเนินการแก้ไข',
        ),
        fmt(
          rLogs.find((l) => l.status === 'waiting_confirm')?.created_at,
          'รอประเมิน',
        ),
        fmt(rLogs.find((l) => l.status === 'closed')?.created_at, 'เสร็จสิ้น'),
      ];

      const currentStepIndex =
        STATUS_STEP_MAP[r.status as keyof typeof STATUS_STEP_MAP] ?? 0;
      const steps = allSteps.slice(0, currentStepIndex);

      return {
        id: r.id,
        title: r.title,
        status: r.status,
        customerName: r.customerName,
        systemName: r.systemName,
        problemName: r.problemName,
        dueAt: r.dueAt ? new Date(r.dueAt).toISOString() : null,
        allResolved: r.allResolved,
        wasRejected: r.wasRejected,
        steps,
      };
    });
  }
}
