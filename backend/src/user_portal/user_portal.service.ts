import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { formatDateTime as formatDateTimeUtil } from '../common/utils/date-time.util';
import { parsePositiveInteger as parsePositiveIntegerUtil } from '../common/utils/number.util';
import { mapRequestStatusLabel as mapRequestStatusLabelUtil } from '../common/utils/request-status.util';
import { ConfirmRequestDto } from './dto/confirm-request.dto';
import { RateRequestDto } from './dto/rate-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { DashboardSummary } from './interfaces/dashboard-summary.interface';
import {
  GetRequestsQuery,
  PublicRequestList,
} from './interfaces/public-request-list.interface';
import { PublicRequestPdfData } from './interfaces/public-request-pdf.interface';
import { PublicRequestTrack } from './interfaces/public-request-track.interface';
import { mapTrackResponse } from './mappers/request-track.mapper';
import {
  RequestTrackRow,
  StatusLogRow,
} from './interfaces/request-track-row.interface';
import {
  validateConfirmRequestDto,
  validateRateRequestDto,
  validateRejectRequestDto,
} from './validation/user-portal.validation';

interface DashboardSummaryRow extends RowDataPacket {
  total: number;
  screening: number;
  in_progress: number;
  completed: number;
}

interface PublicRequestRow extends RowDataPacket {
  request_no: string;
  system_name: string | null;
  problem_name: string | null;
  status: string;
}

interface RequestIdentityRow extends RowDataPacket {
  id: number;
  request_no: string;
  customer_id: number;
  status: string;
}

interface PublicRequestPdfRow extends RowDataPacket {
  request_no: string;
  request_status: string;
  title: string;
  detail: string;
  request_created_at: Date | string;
  customer_name: string;
  customer_surname: string | null;
  customer_email: string;
  customer_phone: string | null;
  system_name: string | null;
  problem_type_name: string | null;
  document_file_name: string | null;
  document_generated_at: Date | string | null;
}

interface ExpiredWaitingConfirmRow extends RowDataPacket {
  request_id: number;
  customer_id: number;
  request_status: string;
  ticket_id: number;
  ticket_status: string;
  waiting_confirm_at: Date | string;
}

const REQUEST_STATUS_VALUES = new Set([
  'screening',
  'assigned',
  'in_progress',
  'waiting_confirm',
  'closed',
  'rejected',
]);

const AUTO_CLOSE_NOTE =
  'System auto-closed after customer confirmation deadline expired';

@Injectable()
export class UserPortalService {
  constructor(
    @Inject('DB')
    private readonly db: Pool,
  ) {}

  async getDashboardSummary(): Promise<DashboardSummary> {
    await this.syncExpiredWaitingConfirmRequests();

    const [rows] = await this.db.query<DashboardSummaryRow[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN r.status = 'screening' THEN 1 ELSE 0 END) AS screening,
        SUM(CASE WHEN r.status IN ('assigned', 'in_progress') THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN r.status = 'closed' THEN 1 ELSE 0 END) AS completed
      FROM requests r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
     `,
    );

    const summary = rows[0];

    return {
      total: Number(summary?.total ?? 0),
      screening: Number(summary?.screening ?? 0),
      inProgress: Number(summary?.in_progress ?? 0),
      completed: Number(summary?.completed ?? 0),
    };
  }

  async getRequests(query: GetRequestsQuery): Promise<PublicRequestList> {
    await this.syncExpiredWaitingConfirmRequests();

    const page = parsePositiveIntegerUtil(query.page, 1, 'page');
    const limit = Math.min(
      parsePositiveIntegerUtil(query.limit, 10, 'limit'),
      100,
    );
    const search = query.search?.trim() ?? '';
    const status = query.status?.trim() ?? '';
    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    // TODO:
    // หลังจากทำ login แล้ว
    // ต้อง filter ด้วย customer_id จาก JWT token

    if (search.length > 0) {
      const likeSearch = `%${search}%`;
      whereClauses.push(`(
        r.request_no LIKE ?
        OR r.title LIKE ?
        OR COALESCE(s.name, '') LIKE ?
        OR COALESCE(pt.name, '') LIKE ?
      )`);
      params.push(likeSearch, likeSearch, likeSearch, likeSearch);
    }

    if (status.length > 0) {
      if (!REQUEST_STATUS_VALUES.has(status)) {
        throw new BadRequestException('status is invalid');
      }

      whereClauses.push('r.status = ?');
      params.push(status);
    }

    const whereSql =
      whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : ``;

    const [countRows] = await this.db.query<
      Array<RowDataPacket & { total: number }>
    >(
      `SELECT COUNT(*) AS total
      FROM requests r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
      LEFT JOIN systems s
        ON r.system_id = s.id
      ${whereSql}`,
      params,
    );

    const total = Number(countRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    const [rows] = await this.db.query<PublicRequestRow[]>(
      `SELECT
        r.request_no,
        s.name AS system_name,
        pt.name AS problem_name,
        r.status
      FROM requests r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
      LEFT JOIN systems s
        ON r.system_id = s.id
      ${whereSql}
      ORDER BY r.created_at DESC
      LIMIT ?
      OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      items: rows.map((row) => ({
        trackingNo: row.request_no,
        system: row.system_name ?? '-',
        problem: row.problem_name ?? '-',
        document: `tracking-${row.request_no}.pdf`,
        status: mapRequestStatusLabelUtil(row.status),
      })),
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getRequestTrack(requestNo: string): Promise<PublicRequestTrack> {
    await this.syncExpiredWaitingConfirmRequests();

    const request = await this.findRequestTrackRowByRequestNo(requestNo);

    if (!request) {
      throw new NotFoundException(`Request ${requestNo} not found`);
    }

    const [requestStatusLogs] = await this.db.query<StatusLogRow[]>(
      `SELECT new_status, created_at
      FROM request_status_logs
      WHERE request_id = ?
      ORDER BY created_at ASC, id ASC`,
      [request.id],
    );

    return mapTrackResponse(request, requestStatusLogs);
  }

  async getRequestPdfData(requestNo: string): Promise<PublicRequestPdfData> {
    await this.syncExpiredWaitingConfirmRequests();

    const [rows] = await this.db.query<PublicRequestPdfRow[]>(
      `SELECT
        r.request_no,
        r.status AS request_status,
        r.title,
        r.detail,
        r.created_at AS request_created_at,
        c.name AS customer_name,
        c.surname AS customer_surname,
        c.email AS customer_email,
        c.phone AS customer_phone,
        s.name AS system_name,
        pt.name AS problem_type_name,
        a.original_name AS document_file_name,
        a.uploaded_at AS document_generated_at
      FROM requests r
      INNER JOIN customers c
        ON c.id = r.customer_id
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
      LEFT JOIN systems s
        ON s.id = r.system_id
      LEFT JOIN tickets t
        ON t.id = (
          SELECT t2.id
          FROM tickets t2
          WHERE t2.request_id = r.id
          ORDER BY t2.id DESC
          LIMIT 1
        )
      LEFT JOIN attachments a
        ON a.id = (
          SELECT a2.id
          FROM attachments a2
          WHERE a2.ticket_id = t.id
            AND a2.attachment_type = 'customer_tracking_ticket'
          ORDER BY a2.id DESC
          LIMIT 1
        )
      WHERE r.request_no = ?
      LIMIT 1`,
      [requestNo],
    );

    const row = rows[0];

    if (!row) {
      throw new NotFoundException(`Request ${requestNo} not found`);
    }

    return {
      trackingNo: row.request_no,
      requesterName: [row.customer_name, row.customer_surname]
        .filter(Boolean)
        .join(' '),
      requesterEmail: row.customer_email,
      requesterPhone: row.customer_phone,
      systemName: row.system_name,
      problemTypeName: row.problem_type_name,
      problemTitle: row.title,
      problemDetail: row.detail,
      statusCode: row.request_status,
      issuedAt: formatDateTimeUtil(row.request_created_at) ?? '',
      documentFileName:
        row.document_file_name ?? `tracking-${row.request_no}.pdf`,
      documentGeneratedAt: formatDateTimeUtil(row.document_generated_at),
    };
  }

  async confirmRequest(
    id: number,
    dto: ConfirmRequestDto,
  ): Promise<PublicRequestTrack> {
    validateConfirmRequestDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.findRequestIdentityById(connection, id);

      if (!identity) {
        throw new NotFoundException(`Request ${id} not found`);
      }

      if (identity.status !== 'waiting_confirm') {
        throw new BadRequestException(
          'request is not waiting for customer confirmation',
        );
      }

      await connection.query<ResultSetHeader>(
        `INSERT INTO request_confirmations (
          request_id,
          customer_id,
          result,
          comment,
          score
        ) VALUES (?, ?, 'confirmed', ?, NULL)`,
        [identity.id, identity.customer_id, dto.comment ?? null],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE requests
        SET status = 'closed',
            closed_at = NOW()
        WHERE id = ?`,
        [identity.id],
      );

      const [ticketRows] = await connection.query<
        Array<RowDataPacket & { id: number; status: string }>
      >(
        `SELECT id, status
        FROM tickets
        WHERE request_id = ?`,
        [identity.id],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE tickets
        SET status = 'closed',
            closed_at = NOW()
        WHERE request_id = ?`,
        [identity.id],
      );

      await connection.query<ResultSetHeader>(
        `INSERT INTO request_status_logs (
          request_id,
          old_status,
          new_status,
          changed_by_type,
          changed_by_id,
          note
        ) VALUES (?, ?, 'closed', 'customer', ?, ?)`,
        [
          identity.id,
          identity.status,
          identity.customer_id,
          dto.comment ?? null,
        ],
      );

      for (const ticket of ticketRows) {
        await connection.query<ResultSetHeader>(
          `INSERT INTO ticket_status_logs (
            ticket_id,
            old_status,
            new_status,
            changed_by,
            note
          ) VALUES (?, ?, 'closed', NULL, ?)`,
          [
            ticket.id,
            ticket.status,
            dto.comment ?? 'Customer confirmed completion',
          ],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.getRequestTrackByIdAfterMutation(id);
  }

  async rateRequest(
    id: number,
    dto: RateRequestDto,
  ): Promise<PublicRequestTrack> {
    validateRateRequestDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.findRequestIdentityById(connection, id);

      if (!identity) {
        throw new NotFoundException(`Request ${id} not found`);
      }

      if (identity.status !== 'closed') {
        throw new BadRequestException('request is not closed');
      }

      const [confirmationRows] = await connection.query<
        Array<RowDataPacket & { id: number }>
      >(
        `SELECT id
        FROM request_confirmations
        WHERE request_id = ?
          AND result = 'confirmed'
        ORDER BY id DESC
        LIMIT 1`,
        [identity.id],
      );

      const confirmationId = Number(confirmationRows[0]?.id ?? 0);

      if (confirmationId <= 0) {
        throw new NotFoundException(`Confirmation for request ${id} not found`);
      }

      await connection.query<ResultSetHeader>(
        `UPDATE requests
        SET score = ?
        WHERE id = ?`,
        [dto.score, identity.id],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE request_confirmations
        SET score = ?,
            comment = ?
        WHERE id = ?`,
        [dto.score, dto.comment ?? null, confirmationId],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.getRequestTrackByIdAfterMutation(id);
  }

  async rejectRequest(
    id: number,
    dto: RejectRequestDto,
  ): Promise<PublicRequestTrack> {
    validateRejectRequestDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.findRequestIdentityById(connection, id);

      if (!identity) {
        throw new NotFoundException(`Request ${id} not found`);
      }

      if (identity.status !== 'waiting_confirm') {
        throw new BadRequestException(
          'request is not waiting for customer confirmation',
        );
      }

      await connection.query<ResultSetHeader>(
        `INSERT INTO request_confirmations (
          request_id,
          customer_id,
          result,
          comment,
          score
        ) VALUES (?, ?, 'reopened', ?, NULL)`,
        [identity.id, identity.customer_id, dto.reason],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE requests
        SET status = 'assigned',
            closed_at = NULL
        WHERE id = ?`,
        [identity.id],
      );

      const [ticketRows] = await connection.query<
        Array<RowDataPacket & { id: number; status: string }>
      >(
        `SELECT id, status
        FROM tickets
        WHERE request_id = ?
          AND status IN ('resolved', 'waiting_confirm')`,
        [identity.id],
      );

      if (ticketRows.length > 0) {
        await connection.query<ResultSetHeader>(
          `UPDATE tickets
          SET status = 'assigned',
              closed_at = NULL
          WHERE request_id = ?
            AND status IN ('resolved', 'waiting_confirm')`,
          [identity.id],
        );
      }

      await connection.query<ResultSetHeader>(
        `INSERT INTO request_status_logs (
          request_id,
          old_status,
          new_status,
          changed_by_type,
          changed_by_id,
          note
        ) VALUES (?, ?, 'assigned', 'customer', ?, ?)`,
        [identity.id, identity.status, identity.customer_id, dto.reason],
      );

      for (const ticket of ticketRows) {
        await connection.query<ResultSetHeader>(
          `INSERT INTO ticket_status_logs (
            ticket_id,
            old_status,
            new_status,
            changed_by,
            note
          ) VALUES (?, ?, 'assigned', NULL, ?)`,
          [ticket.id, ticket.status, dto.reason],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.getRequestTrackByIdAfterMutation(id);
  }

  private async getRequestTrackByIdAfterMutation(
    id: number,
  ): Promise<PublicRequestTrack> {
    const updated = await this.findRequestTrackRowById(id);

    if (!updated) {
      throw new NotFoundException(`Request ${id} not found after update`);
    }

    const [requestStatusLogs] = await this.db.query<StatusLogRow[]>(
      `SELECT new_status, created_at
      FROM request_status_logs
      WHERE request_id = ?
      ORDER BY created_at ASC, id ASC`,
      [updated.id],
    );

    return mapTrackResponse(updated, requestStatusLogs);
  }

  private async syncExpiredWaitingConfirmRequests(): Promise<void> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [expiredRows] = await connection.query<ExpiredWaitingConfirmRow[]>(
        `SELECT
          r.id AS request_id,
          r.customer_id,
          r.status AS request_status,
          t.id AS ticket_id,
          t.status AS ticket_status,
          (
            SELECT rsl.created_at
            FROM request_status_logs rsl
            WHERE rsl.request_id = r.id
              AND rsl.new_status = 'waiting_confirm'
            ORDER BY rsl.id DESC
            LIMIT 1
          ) AS waiting_confirm_at
        FROM requests r
        INNER JOIN tickets t
          ON t.id = (
            SELECT t2.id
            FROM tickets t2
            WHERE t2.request_id = r.id
            ORDER BY t2.id DESC
            LIMIT 1
          )
        WHERE r.status = 'waiting_confirm'
          AND t.status = 'waiting_confirm'
          AND (
            SELECT rsl.created_at
            FROM request_status_logs rsl
            WHERE rsl.request_id = r.id
              AND rsl.new_status = 'waiting_confirm'
            ORDER BY rsl.id DESC
            LIMIT 1
          ) IS NOT NULL
          AND DATE_ADD(
            (
              SELECT rsl.created_at
              FROM request_status_logs rsl
              WHERE rsl.request_id = r.id
                AND rsl.new_status = 'waiting_confirm'
              ORDER BY rsl.id DESC
              LIMIT 1
            ),
            INTERVAL 3 DAY
          ) < NOW()`,
      );

      for (const row of expiredRows) {
        await connection.query<ResultSetHeader>(
          `UPDATE requests
          SET status = 'closed',
              closed_at = NOW()
          WHERE id = ?`,
          [row.request_id],
        );

        await connection.query<ResultSetHeader>(
          `UPDATE tickets
          SET status = 'closed',
              closed_at = NOW()
          WHERE id = ?`,
          [row.ticket_id],
        );

        await connection.query<ResultSetHeader>(
          `INSERT INTO request_status_logs (
            request_id,
            old_status,
            new_status,
            changed_by_type,
            changed_by_id,
            note
          ) VALUES (?, ?, 'closed', 'system', NULL, ?)`,
          [row.request_id, row.request_status, AUTO_CLOSE_NOTE],
        );

        await connection.query<ResultSetHeader>(
          `INSERT INTO ticket_status_logs (
            ticket_id,
            old_status,
            new_status,
            changed_by,
            note
          ) VALUES (?, ?, 'closed', NULL, ?)`,
          [row.ticket_id, row.ticket_status, AUTO_CLOSE_NOTE],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async findRequestTrackRowByRequestNo(
    requestNo: string,
  ): Promise<RequestTrackRow | null> {
    const [rows] = await this.db.query<RequestTrackRow[]>(
      `SELECT
        r.id,
        r.request_no,
        r.title,
        r.detail,
        r.score,
        r.customer_id,
        r.status AS request_status,
        r.created_at AS request_created_at,
        trr.status AS resolution_request_status,
        trr.summary AS resolution_summary,
        trr.reviewed_at,
        staff.name AS repaired_by_name,
        staff.surname AS repaired_by_surname
      FROM requests r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
      LEFT JOIN tickets t
        ON t.id = (
          SELECT t2.id
          FROM tickets t2
          WHERE t2.request_id = r.id
          ORDER BY t2.id DESC
          LIMIT 1
        )
      LEFT JOIN ticket_resolution_requests trr
        ON trr.id = (
          SELECT trr2.id
          FROM ticket_resolution_requests trr2
          WHERE trr2.ticket_id = t.id
          ORDER BY trr2.id DESC
          LIMIT 1
        )
      LEFT JOIN staffs staff
        ON staff.id = COALESCE(t.assigned_staff_id, trr.requested_by)
      WHERE r.request_no = ?
      LIMIT 1`,
      [requestNo],
    );

    return rows[0] ?? null;
  }

  private async findRequestTrackRowById(
    id: number,
  ): Promise<RequestTrackRow | null> {
    const [rows] = await this.db.query<RequestTrackRow[]>(
      `SELECT
        r.id,
        r.request_no,
        r.title,
        r.detail,
        r.score,
        r.customer_id,
        r.status AS request_status,
        r.created_at AS request_created_at,
        trr.status AS resolution_request_status,
        trr.summary AS resolution_summary,
        trr.reviewed_at,
        staff.name AS repaired_by_name,
        staff.surname AS repaired_by_surname
      FROM requests r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
      LEFT JOIN tickets t
        ON t.id = (
          SELECT t2.id
          FROM tickets t2
          WHERE t2.request_id = r.id
          ORDER BY t2.id DESC
          LIMIT 1
        )
      LEFT JOIN ticket_resolution_requests trr
        ON trr.id = (
          SELECT trr2.id
          FROM ticket_resolution_requests trr2
          WHERE trr2.ticket_id = t.id
          ORDER BY trr2.id DESC
          LIMIT 1
        )
      LEFT JOIN staffs staff
        ON staff.id = COALESCE(t.assigned_staff_id, trr.requested_by)
      WHERE r.id = ?
      LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }

  private async findRequestIdentityById(
    connection: PoolConnection,
    id: number,
  ): Promise<RequestIdentityRow | null> {
    const [rows] = await connection.query<RequestIdentityRow[]>(
      `SELECT requests.id, requests.request_no, requests.customer_id, requests.status
      FROM requests
      INNER JOIN problem_types pt
        ON pt.id = requests.problem_type_id
      WHERE requests.id = ?
      LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }
}
