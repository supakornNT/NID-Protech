const BANGKOK_TIME_ZONE = "Asia/Bangkok";
const DAY_MS = 86400000;
const HOUR_MS = 3600000;

function getBangkokDateKey(value: string): string | null {
  const dateOnlyMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnlyMatch) {
    return dateOnlyMatch[1];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getBangkokDueDeadlineMs(dueAt: string | null): number | null {
  if (!dueAt) {
    return null;
  }

  const dateKey = getBangkokDateKey(dueAt);
  if (!dateKey) {
    return null;
  }

  return new Date(`${dateKey}T23:59:59.999+07:00`).getTime();
}

export function formatBangkokTimeLeft(
  dueAt: string | null,
  status: string,
  options: {
    closedLabel?: string;
    emptyLabel?: string;
    overdueLabel?: string;
  } = {},
): string {
  if (status === "closed" || status === "cancelled") {
    return options.closedLabel ?? "เสร็จสิ้นแล้ว";
  }

  const dateKey = getBangkokDateKey(dueAt ?? "");
  if (!dateKey) {
    return options.emptyLabel ?? "ยังไม่กำหนด";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${dateKey}T00:00:00+07:00`);
  dueDate.setHours(0, 0, 0, 0);

  const days = Math.ceil(
    (dueDate.getTime() - today.getTime()) / DAY_MS,
  );

  if (days < 0) {
    return options.overdueLabel ?? "เกินกำหนด";
  }

  if (days === 0) {
    return "วันนี้";
  }

  return `เหลือ ${days} วัน`;
}