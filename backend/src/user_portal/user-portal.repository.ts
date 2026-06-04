import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";

import { getCountTotal } from "@/common/validation/input-rules";
import type {
  RequestTrackRow,
  StatusLogRow,
} from "./interfaces/request-track-row.interface";

interface DashboardSummaryRow extends RowDataPacket {
  total: number;
  screening: number;
  inProgress: number;
  completed: number;
}

interface PublicRequestRow extends RowDataPacket {
  requestNo: string;
  systemName: string | null;
  problemName: string | null;
  status: string;
}

export interface AttachmentRow extends RowDataPacket {
  id: number;
  originalName: string;
  savedName: string;
  fileExt: string | null;
  uploadedAt: Date | string | null;
}

export interface RequestIdentityRow extends RowDataPacket {
  id: number;
  requestNo: string;
  customerId: number;
  status: string;
}

export interface PublicRequestPdfRow extends RowDataPacket {
  requestNo: string;
  requestStatus: string;
  title: string;
  detail: string;
  requestCreatedAt: Date | string;
  customerName: string;
  customerSurname: string | null;
  customerEmail: string;
  customerPhone: string | null;
  systemName: string | null;
  problemTypeName: string | null;
  documentFileName: string | null;
  documentGeneratedAt: Date | string | null;
}

@Injectable()
export class UserPortalRepository {
  constructor(@Inject("DB") private readonly db: Pool) {}

  async getDashboardSummaryRow(
    customerId?: number,
  ): Promise<DashboardSummaryRow | null> {
    const whereClause =
      typeof customerId === "number" ? "WHERE r.customer_id = ?" : "";
    const params = typeof customerId === "number" ? [customerId] : [];
    const [rows] = await this.db.query<DashboardSummaryRow[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN r.status = 'screening' THEN 1 ELSE 0 END) AS screening,
        SUM(CASE WHEN r.status IN ('assigned', 'in_progress') THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN r.status = 'closed' THEN 1 ELSE 0 END) AS completed
      FROM requests r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
      ${whereClause}`,
      params,
    );

    return rows[0] ?? null;
  }

  async countRequests(whereSql: string, params: Array<string | number>) {
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

    return getCountTotal(countRows, 0);
  }

  async findRequests(
    whereSql: string,
    params: Array<string | number>,
    limit: number,
    offset: number,
  ): Promise<PublicRequestRow[]> {
    const [rows] = await this.db.query<PublicRequestRow[]>(
      `SELECT
        r.request_no AS requestNo,
        s.name AS systemName,
        pt.name AS problemName,
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

    return rows;
  }

  async findRequestStatusLogs(requestId: number): Promise<StatusLogRow[]> {
    const [rows] = await this.db.query<StatusLogRow[]>(
      `SELECT status, created_at
      FROM request_status_logs
      WHERE request_id = ?
      ORDER BY created_at ASC, id ASC`,
      [requestId],
    );

    return rows;
  }

  async findLatestRepairAttachments(requestId: number): Promise<AttachmentRow[]> {
    const [rows] = await this.db.query<AttachmentRow[]>(
      `SELECT
        a.id,
        a.original_name AS originalName,
        a.saved_name AS savedName,
        a.file_ext AS fileExt,
        a.uploaded_at AS uploadedAt
      FROM attachments a
      WHERE a.request_id = ?
        AND a.attachment_type = 'resolution_evidence'
        AND a.status = 'show'
        AND (
          a.uploaded_at > COALESCE(
            (SELECT MAX(rc.confirmed_at) FROM request_confirmations rc WHERE rc.request_id = ? AND rc.result = 'reopened'),
            '1970-01-01 00:00:00'
          )
        )
      ORDER BY a.uploaded_at DESC, a.id DESC`,
      [requestId, requestId],
    );

    return rows;
  }

  async findRequestPdfRow(requestNo: string): Promise<PublicRequestPdfRow> {
    const [rows] = await this.db.query<PublicRequestPdfRow[]>(
      `SELECT
        r.request_no AS requestNo,
        r.status AS requestStatus,
        r.title,
        r.detail,
        r.created_at AS requestCreatedAt,
        c.name AS customerName,
        c.surname AS customerSurname,
        c.email AS customerEmail,
        c.phone AS customerPhone,
        s.name AS systemName,
        pt.name AS problemTypeName,
        a.original_name AS documentFileName,
        a.uploaded_at AS documentGeneratedAt
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

    return row;
  }

  async findRequestTrackRowByRequestNo(
    requestNo: string,
  ): Promise<RequestTrackRow | null> {
    const [rows] = await this.db.query<RequestTrackRow[]>(
      `SELECT
        r.id,
        r.request_no AS requestNo,
        r.title,
        r.detail,
        r.score,
        r.customer_id AS customerId,
        r.status AS requestStatus,
        r.created_at AS requestCreatedAt,
        trr.status AS resolutionRequestStatus,
        trr.summary AS resolutionSummary,
        trr.reviewed_at AS reviewedAt,
        staff.name AS repairedByName,
        staff.surname AS repairedBySurname
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
        ON staff.id = t.assigned_by
      WHERE r.request_no = ?
      LIMIT 1`,
      [requestNo],
    );

    return rows[0] ?? null;
  }

  async findRequestTrackRowById(id: number): Promise<RequestTrackRow | null> {
    const [rows] = await this.db.query<RequestTrackRow[]>(
      `SELECT
        r.id,
        r.request_no AS requestNo,
        r.title,
        r.detail,
        r.score,
        r.customer_id AS customerId,
        r.status AS requestStatus,
        r.created_at AS requestCreatedAt,
        trr.status AS resolutionRequestStatus,
        trr.summary AS resolutionSummary,
        trr.reviewed_at AS reviewedAt,
        staff.name AS repairedByName,
        staff.surname AS repairedBySurname
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
        ON staff.id = t.assigned_by
      WHERE r.id = ?
      LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }

  async findRequestIdentityById(
    connection: PoolConnection,
    id: number,
  ): Promise<RequestIdentityRow | null> {
    const [rows] = await connection.query<RequestIdentityRow[]>(
      `SELECT
        requests.id,
        requests.request_no AS requestNo,
        requests.customer_id AS customerId,
        requests.status
      FROM requests
      INNER JOIN problem_types pt
        ON pt.id = requests.problem_type_id
      WHERE requests.id = ?
      LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }

  async findReopenConfirmations(requestId: number): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT id, comment, confirmed_at AS reopenedAt
      FROM request_confirmations
      WHERE request_id = ? AND result = 'reopened'
      ORDER BY id DESC`,
      [requestId],
    );
    return rows;
  }

  async findReopenAttachments(requestId: number): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT id, request_confirmation_id AS requestConfirmationId, original_name AS originalName, saved_name AS savedName, file_ext AS fileExt
      FROM attachments
      WHERE request_id = ? AND attachment_type = 'reopen_evidence' AND status = 'show'
      ORDER BY id DESC`,
      [requestId],
    );
    return rows;
  }

  async findTicketResolutionRequests(requestId: number): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT trr.id, trr.summary, trr.reviewed_at AS reviewedAt
       FROM ticket_resolution_requests trr
       INNER JOIN tickets t ON t.id = trr.ticket_id
       WHERE t.request_id = ? AND trr.status = 'approved'
       ORDER BY trr.id ASC`,
      [requestId],
    );
    return rows;
  }

  async findResolutionAttachments(requestId: number): Promise<any[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT id, original_name AS originalName, saved_name AS savedName, file_ext AS fileExt, uploaded_at AS uploadedAt
       FROM attachments
       WHERE request_id = ? AND attachment_type = 'resolution_evidence' AND status = 'show'
       ORDER BY id ASC`,
      [requestId],
    );
    return rows;
  }
}
