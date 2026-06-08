import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';

@Injectable()
export class CloseWorkService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findRequests(status: 'pending' | 'history') {
    const requestFilter =
      status === 'pending'
        ? "r.status = 'in_progress'"
        : "r.status IN ('waiting_confirm', 'closed')";

    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT DISTINCT
        r.id,
        r.request_no AS requestNo,
        r.title,
        r.detail,
        r.status,
        r.created_at AS createdAt,
        CONCAT(c.name, ' ', COALESCE(c.surname, '')) AS customerName,
        s.name AS systemName,
        pt.name AS problemName
      FROM requests r
      JOIN tickets t ON t.request_id = r.id
      JOIN ticket_resolution_requests trr ON trr.ticket_id = t.id
      LEFT JOIN customers c ON c.id = r.customer_id
      LEFT JOIN systems s ON s.id = r.system_id
      LEFT JOIN problem_types pt ON pt.id = r.problem_type_id
      WHERE ${requestFilter}
        AND trr.status IN ('pending', 'approved', 'rejected')
      ORDER BY r.created_at DESC`,
    );

    return rows;
  }

  async findRequestTickets(requestId: number, status: 'pending' | 'history') {
    const requestFilter =
      status === 'pending'
        ? "r.status = 'in_progress'"
        : "r.status IN ('waiting_confirm', 'closed')";

    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        t.id,
        t.ticket_no AS ticketNo,
        t.title,
        t.description,
        t.status,
        t.due_at AS dueAt,
        CONCAT(st.name, ' ', COALESCE(st.surname, '')) AS assignedStaffName,
        trr.id AS resolutionRequestId,
        trr.summary,
        trr.status AS resolutionStatus,
        trr.reject_reason AS rejectReason,
        trr.created_at AS requestedAt
      FROM tickets t
      JOIN requests r ON r.id = t.request_id
      LEFT JOIN (
        SELECT latest.*
        FROM ticket_resolution_requests latest
        INNER JOIN (
          SELECT ticket_id, MAX(id) AS latest_id
          FROM ticket_resolution_requests
          GROUP BY ticket_id
        ) picked
          ON picked.latest_id = latest.id
      ) trr ON trr.ticket_id = t.id
      LEFT JOIN staffs st ON st.id = t.assigned_staff_id
      WHERE t.request_id = ?
        AND ${requestFilter}
        AND t.status != 'cancelled'
      ORDER BY
        CASE
          WHEN trr.status = 'pending' THEN 0
          WHEN trr.status IS NOT NULL THEN 1
          ELSE 2
        END,
        COALESCE(trr.created_at, t.created_at) DESC,
        t.id DESC`,
      [requestId],
    );

    return rows;
  }

  async findRequestEvidence(requestId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        id,
        original_name AS originalName,
        saved_name AS savedName,
        file_ext AS fileExt
      FROM attachments
      WHERE request_id = ?
        AND attachment_type = 'request_evidence'
        AND status = 'show'
      ORDER BY uploaded_at DESC`,
      [requestId],
    );

    return rows;
  }

  async findTicketResolutionEvidence(ticketId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        id,
        original_name AS originalName,
        saved_name AS savedName,
        file_ext AS fileExt
      FROM attachments
      WHERE ticket_id = ?
        AND attachment_type = 'resolution_evidence'
        AND status = 'show'
      ORDER BY uploaded_at DESC`,
      [ticketId],
    );

    return rows;
  }

  async findLatestReopenComment(requestId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT comment
       FROM request_confirmations
       WHERE request_id = ?
         AND result = 'reopened'
       ORDER BY confirmed_at DESC, id DESC
       LIMIT 1`,
      [requestId],
    );

    return rows[0]?.comment ?? null;
  }

  async approveTicketResolution(
    ticketId: number,
    resolutionRequestId: number,
    reviewedBy: number,
    summary?: string,
  ) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE ticket_resolution_requests
         SET status = 'approved',
             reviewed_by = ?,
             reviewed_at = NOW(),
             reject_reason = NULL
         WHERE id = ?`,
        [reviewedBy, resolutionRequestId],
      );

      await connection.query(
        `UPDATE tickets
         SET status = 'closed',
             closed_at = NOW()
         WHERE id = ?`,
        [ticketId],
      );

      await connection.query(
        `INSERT INTO ticket_status_logs (
          ticket_id, old_status, new_status, changed_by, note
        ) VALUES (?, 'in_progress', 'closed', ?, 'อนุมัติผลการแก้ไข')`,
        [ticketId, reviewedBy],
      );

      const [ticketRows] = await connection.query<RowDataPacket[]>(
        'SELECT request_id FROM tickets WHERE id = ?',
        [ticketId],
      );

      const requestId = ticketRows[0]?.request_id;

      if (requestId) {
        const [countRows] = await connection.query<RowDataPacket[]>(
          `SELECT COUNT(*) AS total
           FROM tickets
           WHERE request_id = ?
             AND status NOT IN ('closed', 'cancelled')`,
          [requestId],
        );

        const total = Number(countRows[0]?.total ?? 0);
        if (total === 0) {
          const requestSummary =
            summary?.trim() ||
            'เธ—เธธเธเธเธฒเธเธขเนเธญเธขเธเนเธฒเธเธญเธเธธเธกเธฑเธ•เธดเนเธฅเธฐเธฃเธญเธฅเธนเธเธเนเธฒเธขเธทเธเธขเธฑเธ';
          await connection.query(
            `UPDATE requests
             SET status = 'waiting_confirm'
             WHERE id = ?`,
            [requestId],
          );

          await connection.query(
            `INSERT INTO request_status_logs (
              request_id, status, changed_by_type, changed_by_id, note
            ) VALUES (?, 'waiting_confirm', 'staff', ?, 'ทุกงานย่อยผ่านอนุมัติและรอลูกค้ายืนยัน')`,
            [requestId, reviewedBy],
          );

          await connection.query(
            `UPDATE request_status_logs
             SET note = ?
             WHERE id = LAST_INSERT_ID()`,
            [requestSummary],
          );
        }
      }

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async rejectTicketResolution(
    ticketId: number,
    resolutionRequestId: number,
    reviewedBy: number,
    rejectReason: string,
  ) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE ticket_resolution_requests
         SET status = 'rejected',
             reviewed_by = ?,
             reviewed_at = NOW(),
             reject_reason = ?
         WHERE id = ?`,
        [reviewedBy, rejectReason, resolutionRequestId],
      );

      await connection.query(
        `UPDATE tickets
         SET status = 'in_progress'
         WHERE id = ?`,
        [ticketId],
      );

      await connection.query(
        `INSERT INTO ticket_status_logs (
          ticket_id, old_status, new_status, changed_by, note
        ) VALUES (?, 'in_progress', 'in_progress', ?, ?)`,
        [ticketId, reviewedBy, `ไม่อนุมัติผลการแก้ไข: ${rejectReason}`],
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async changeRequestStatus(
    requestId: number,
    status: string,
    changedById: number,
    note?: string,
  ) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE requests
         SET status = ?
         WHERE id = ?`,
        [status, requestId],
      );

      await connection.query(
        `INSERT INTO request_status_logs (
          request_id, status, changed_by_type, changed_by_id, note
        ) VALUES (?, ?, 'staff', ?, ?)`,
        [requestId, status, changedById, note ?? null],
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findReopenAttachments(requestId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT id, original_name AS originalName, saved_name AS savedName, file_ext AS fileExt
       FROM attachments
       WHERE request_confirmation_id = (
         SELECT id
         FROM request_confirmations
         WHERE request_id = ? AND result = 'reopened'
         ORDER BY confirmed_at DESC, id DESC
         LIMIT 1
       ) AND attachment_type = 'reopen_evidence' AND status = 'show'
       ORDER BY uploaded_at DESC`,
      [requestId],
    );
    return rows;
  }
}
