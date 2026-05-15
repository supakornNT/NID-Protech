import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface ExpiredWaitingConfirmRow extends RowDataPacket {
  requestId: number;
  customerId: number;
  requestStatus: string;
  ticketId: number;
  ticketStatus: string;
  waitingConfirmAt: Date | string;
}

const AUTO_CLOSE_NOTE =
  'System auto-closed after customer confirmation deadline expired';
const SYNC_INTERVAL_MS = 60_000;
const MAX_SYNC_STALENESS_MS = 30_000;

@Injectable()
export class UserPortalMaintenanceService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(UserPortalMaintenanceService.name);
  private backgroundTimer: NodeJS.Timeout | null = null;
  private inFlightSync: Promise<void> | null = null;
  private lastSyncAt = 0;

  constructor(@Inject('DB') private readonly db: Pool) {}

  onModuleInit() {
    void this.runSync({ force: true, suppressErrors: true });

    this.backgroundTimer = setInterval(() => {
      void this.runSync({ force: true, suppressErrors: true });
    }, SYNC_INTERVAL_MS);

    this.backgroundTimer.unref?.();
  }

  onModuleDestroy() {
    if (this.backgroundTimer) {
      clearInterval(this.backgroundTimer);
      this.backgroundTimer = null;
    }
  }

  async ensureRecentSync(): Promise<void> {
    await this.runSync({ force: false, suppressErrors: false });
  }

  async syncExpiredWaitingConfirmRequests(): Promise<void> {
    await this.runSync({ force: true, suppressErrors: false });
  }

  private async runSync({
    force,
    suppressErrors,
  }: {
    force: boolean;
    suppressErrors: boolean;
  }): Promise<void> {
    const now = Date.now();

    if (!force && now - this.lastSyncAt < MAX_SYNC_STALENESS_MS) {
      return;
    }

    if (this.inFlightSync) {
      return this.inFlightSync;
    }

    const syncPromise = this.executeSync()
      .then(() => {
        this.lastSyncAt = Date.now();
      })
      .catch((error: unknown) => {
        if (suppressErrors) {
          const message =
            error instanceof Error
              ? (error.stack ?? error.message)
              : String(error);
          this.logger.error(`Background sync failed: ${message}`);
          return;
        }

        throw error;
      })
      .finally(() => {
        this.inFlightSync = null;
      });

    this.inFlightSync = syncPromise;
    return syncPromise;
  }

  private async executeSync(): Promise<void> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [expiredRows] = await connection.query<ExpiredWaitingConfirmRow[]>(
        `SELECT
          r.id AS requestId,
          r.customer_id AS customerId,
          r.status AS requestStatus,
          t.id AS ticketId,
          t.status AS ticketStatus,
          (
            SELECT rsl.created_at
            FROM request_status_logs rsl
            WHERE rsl.request_id = r.id
              AND rsl.new_status = 'waiting_confirm'
            ORDER BY rsl.id DESC
            LIMIT 1
          ) AS waitingConfirmAt
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
          [row.requestId],
        );

        await connection.query<ResultSetHeader>(
          `UPDATE tickets
          SET status = 'closed',
              closed_at = NOW()
          WHERE id = ?`,
          [row.ticketId],
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
          [row.requestId, row.requestStatus, AUTO_CLOSE_NOTE],
        );

        await connection.query<ResultSetHeader>(
          `INSERT INTO ticket_status_logs (
            ticket_id,
            old_status,
            new_status,
            changed_by,
            note
          ) VALUES (?, ?, 'closed', NULL, ?)`,
          [row.ticketId, row.ticketStatus, AUTO_CLOSE_NOTE],
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
}
