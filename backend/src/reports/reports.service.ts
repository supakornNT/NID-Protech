import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

@Injectable()
export class ReportsService implements OnModuleInit {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async onModuleInit() {
    try {
      const [cancelledTickets] = await this.db.query<RowDataPacket[]>(
        `SELECT t.id, t.created_at, t.assigned_by FROM tickets t
         WHERE t.status = 'cancelled'
           AND NOT EXISTS (
             SELECT 1 FROM ticket_status_logs tsl
             WHERE tsl.ticket_id = t.id AND tsl.new_status = 'cancelled'
           )`,
      );

      for (const ticket of cancelledTickets) {
        await this.db.query(
          `INSERT INTO ticket_status_logs (ticket_id, old_status, new_status, changed_by, note, created_at)
           VALUES (?, 'in_progress', 'cancelled', ?, 'ยกเลิกตั๋วงานย่อย (ระบบสร้างย้อนหลัง)', ?)`,
          [ticket.id, ticket.assigned_by || null, ticket.created_at],
        );
      }
    } catch (err) {
      console.error('[Migration] Failed to insert missing cancelled logs:', err);
    }
  }

  async getEditHistory() {
    const [statsRows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(t.status NOT IN ('closed','cancelled')) AS inProgress,
        SUM(t.status = 'closed') AS done,
        SUM(t.due_at < NOW() AND t.status NOT IN ('closed','cancelled')) AS overdue
       FROM tickets t`,
    );
    const s = statsRows[0];

    const STATUS_MAP: Record<string, string> = {
      assigned: 'รอดำเนินการ',
      in_progress: 'การดำเนินการ',
      waiting_confirm: 'รอประเมิน',
      closed: 'เสร็จสิ้น',
      cancelled: 'ยกเลิก',
    };

    const [logRows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        tsl.id,
        sys.name AS system,
        r.title,
        pt.name AS type,
        tsl.new_status AS status,
        tsl.created_at AS createdAt,
        CONCAT(st.name, ' ', st.surname) AS operator
       FROM ticket_status_logs tsl
       JOIN tickets t ON t.id = tsl.ticket_id
       JOIN requests r ON r.id = t.request_id
       LEFT JOIN systems sys ON sys.id = r.system_id
       LEFT JOIN problem_types pt ON pt.id = r.problem_type_id
       LEFT JOIN staffs st ON st.id = tsl.changed_by
       ORDER BY tsl.created_at DESC
       LIMIT 200`,
    );

    const rows = logRows.map((r) => {
      const dt = r.createdAt ? new Date(r.createdAt) : null;
      const time = dt
        ? `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
        : '—';
      const dateStr = dt
        ? `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`
        : '—';
      return {
        id: Number(r.id),
        system: String(r.system ?? '—'),
        title: String(r.title),
        type: String(r.type ?? '—'),
        status: STATUS_MAP[String(r.status)] ?? String(r.status),
        time: `${dateStr} ${time}`,
        operator: String(r.operator ?? '—'),
      };
    });

    return {
      stats: {
        total: Number(s.total ?? 0),
        inProgress: Number(s.inProgress ?? 0),
        done: Number(s.done ?? 0),
        overdue: Number(s.overdue ?? 0),
      },
      rows,
    };
  }

  async getOperationsSummary() {
    const [statsRows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        SUM(DATE(created_at) = CURDATE()) AS todayTotal,
        SUM(DATE(closed_at) = CURDATE() AND status = 'closed') AS todayClosed,
        SUM(status NOT IN ('closed', 'screening', 'rejected')) AS inProgress,
        SUM(due_at < NOW() AND status NOT IN ('closed','screening','rejected')) AS overdue,
        SUM(status = 'screening') AS screening
       FROM requests`,
    );
    const s = statsRows[0];

    const kanbanQuery = async (whereClause: string) => {
      const [rows] = await this.db.query<RowDataPacket[]>(
        `SELECT
          r.id,
          r.title,
          CONCAT(c.name, ' ', c.surname) AS customerName,
          r.due_at AS dueAt,
          pt.request_type AS requestType
         FROM requests r
         LEFT JOIN customers c ON c.id = r.customer_id
         LEFT JOIN problem_types pt ON pt.id = r.problem_type_id
         WHERE ${whereClause}
         ORDER BY r.created_at DESC
         LIMIT 5`,
      );
      return rows.map((r) => {
        const diff = r.dueAt ? new Date(r.dueAt).getTime() - Date.now() : null;
        const remaining =
          diff === null
            ? 'ไม่กำหนด'
            : diff <= 0
              ? 'เกินกำหนด'
              : `คงเหลือ ${Math.ceil(diff / 86400000)} วัน`;
        return {
          id: Number(r.id),
          title: String(r.title),
          customerName: String(r.customerName),
          remaining,
          requestType: String(r.requestType),
        };
      });
    };

    const [newCards, screeningCards, assignedCards] = await Promise.all([
      kanbanQuery(`r.status = 'screening' AND DATE(r.created_at) = CURDATE()`),
      kanbanQuery(`r.status = 'screening'`),
      kanbanQuery(`r.status = 'assigned'`),
    ]);

    const THAI_DAYS = [
      'อาทิตย์',
      'จันทร์',
      'อังคาร',
      'พุธ',
      'พฤหัสบดี',
      'ศุกร์',
      'เสาร์',
    ];
    const [dailyRows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        DAYOFWEEK(r.created_at) AS dayOfWeek,
        pt.request_type AS type,
        COUNT(*) AS count
       FROM requests r
       JOIN problem_types pt ON pt.id = r.problem_type_id
       WHERE r.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY dayOfWeek, type`,
    );

    const dayMap: Record<number, { issue: number; complaint: number }> = {};
    for (let i = 1; i <= 7; i++) dayMap[i] = { issue: 0, complaint: 0 };
    for (const row of dailyRows) {
      const d = Number(row.dayOfWeek);
      if (row.type === 'issue') dayMap[d].issue = Number(row.count);
      else if (row.type === 'complaint')
        dayMap[d].complaint = Number(row.count);
    }

    const today = new Date().getDay();
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const dayIndex = ((today - 6 + i + 7) % 7) + 1;
      return {
        day: THAI_DAYS[dayIndex - 1],
        ปัญหา: dayMap[dayIndex].issue,
        ร้องเรียน: dayMap[dayIndex].complaint,
      };
    });

    return {
      stats: {
        todayTotal: Number(s.todayTotal ?? 0),
        todayClosed: Number(s.todayClosed ?? 0),
        inProgress: Number(s.inProgress ?? 0),
        overdue: Number(s.overdue ?? 0),
        screening: Number(s.screening ?? 0),
      },
      columns: [
        { title: 'ตั๋วเข้าใหม่', cards: newCards },
        { title: 'กำลังคัดกรอง', cards: screeningCards },
        { title: 'รอมอบหมายงาน', cards: assignedCards },
      ],
      weeklyData,
    };
  }

  async getExecutiveSummary() {
    const [statsRows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'closed') AS closed,
        SUM(status NOT IN ('closed', 'screening', 'rejected')) AS inProgress,
        SUM(due_at < NOW() AND status NOT IN ('closed', 'screening', 'rejected')) AS overdue,
        ROUND(AVG(CASE WHEN status = 'closed' AND closed_at IS NOT NULL
          THEN TIMESTAMPDIFF(HOUR, created_at, closed_at) END)) AS avgCloseHours
      FROM requests
      WHERE status NOT IN ('screening', 'rejected')`,
    );

    const stats = statsRows[0];
    const avgH = Number(stats.avgCloseHours ?? 0);
    const avgDays = Math.floor(avgH / 24);
    const avgRemH = avgH % 24;
    const avgCloseTime = avgH > 0 ? `${avgDays} วัน (${avgRemH} ชม.)` : '—';

    const [weeklyRows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        LEAST(CEIL(DAY(r.created_at) / 7), 4) AS weekNum,
        pt.request_type AS type,
        COUNT(*) AS count
      FROM requests r
      JOIN problem_types pt ON pt.id = r.problem_type_id
      WHERE YEAR(r.created_at) = YEAR(CURDATE())
        AND MONTH(r.created_at) = MONTH(CURDATE())
      GROUP BY weekNum, type`,
    );

    const weeklyMap: Record<number, { issue: number; complaint: number }> = {
      1: { issue: 0, complaint: 0 },
      2: { issue: 0, complaint: 0 },
      3: { issue: 0, complaint: 0 },
      4: { issue: 0, complaint: 0 },
    };
    for (const row of weeklyRows) {
      const w = Number(row.weekNum);
      if (row.type === 'issue') weeklyMap[w].issue = Number(row.count);
      else if (row.type === 'complaint')
        weeklyMap[w].complaint = Number(row.count);
    }
    const weeklyData = [1, 2, 3, 4].map((w) => ({
      week: `สัปดาห์ที่ ${w}`,
      ปัญหา: weeklyMap[w].issue,
      ร้องเรียน: weeklyMap[w].complaint,
    }));

    const [monthlyRows] = await this.db.query<RowDataPacket[]>(
      `SELECT MONTH(created_at) AS month, COUNT(*) AS count
       FROM requests
       WHERE YEAR(created_at) = YEAR(CURDATE())
       GROUP BY month`,
    );
    const monthlyMap: Record<number, number> = {};
    for (const row of monthlyRows)
      monthlyMap[Number(row.month)] = Number(row.count);
    const monthlyData = THAI_MONTHS.map((name, i) => ({
      month: name,
      count: monthlyMap[i + 1] ?? 0,
    }));

    const [problemRows] = await this.db.query<RowDataPacket[]>(
      `SELECT pt.name AS label, COUNT(*) AS count
       FROM requests r
       JOIN problem_types pt ON pt.id = r.problem_type_id
       GROUP BY pt.id
       ORDER BY count DESC
       LIMIT 6`,
    );
    const commonProblems = problemRows.map((r) => ({
      label: String(r.label),
      count: Number(r.count),
    }));

    const [currRows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'closed') AS closed,
        SUM(due_at < NOW() AND status NOT IN ('closed','screening','rejected')) AS overdue,
        SUM(status = 'rejected') AS rejected
       FROM requests
       WHERE YEAR(created_at) = YEAR(CURDATE())
         AND MONTH(created_at) = MONTH(CURDATE())`,
    );
    const [prevRows] = await this.db.query<RowDataPacket[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'closed') AS closed,
        SUM(due_at < NOW() AND status NOT IN ('closed','screening','rejected')) AS overdue,
        SUM(status = 'rejected') AS rejected
       FROM requests
       WHERE YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
         AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`,
    );
    const curr = currRows[0];
    const prev = prevRows[0];
    const ticketStats = [
      {
        label: 'ตั๋วทั้งหมด',
        prev: Number(prev.total),
        curr: Number(curr.total),
      },
      {
        label: 'แก้ไขสำเร็จ',
        prev: Number(prev.closed),
        curr: Number(curr.closed),
      },
      {
        label: 'เกินกำหนด',
        prev: Number(prev.overdue),
        curr: Number(curr.overdue),
      },
      {
        label: 'ปฏิเสธ',
        prev: Number(prev.rejected),
        curr: Number(curr.rejected),
      },
    ].map((s) => ({ ...s, diff: s.curr - s.prev }));

    const [scoreRows] = await this.db.query<RowDataPacket[]>(
      `SELECT score, COUNT(*) AS count
       FROM requests
       WHERE score BETWEEN 1 AND 5
       GROUP BY score
       ORDER BY score DESC`,
    );
    const scoreMap: Record<number, number> = {};
    for (const row of scoreRows)
      scoreMap[Number(row.score)] = Number(row.count);
    const ratings = [5, 4, 3, 2, 1].map((s) => ({
      star: s,
      count: scoreMap[s] ?? 0,
    }));

    const donutData = [
      { name: 'ปิดแล้ว', value: Number(stats.closed), color: '#4CAF50' },
      {
        name: 'กำลังดำเนินการ',
        value: Number(stats.inProgress),
        color: '#FFC107',
      },
      { name: 'เกินกำหนด', value: Number(stats.overdue), color: '#F44336' },
    ];

    return {
      stats: {
        total: Number(stats.total),
        closed: Number(stats.closed),
        inProgress: Number(stats.inProgress),
        overdue: Number(stats.overdue),
        avgCloseTime,
      },
      weeklyData,
      monthlyData,
      donutData,
      commonProblems,
      ticketStats,
      ratings,
    };
  }
}
