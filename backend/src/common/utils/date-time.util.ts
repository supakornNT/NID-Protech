export function normalizeDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function toIsoDate(value: Date | string): string {
  const date = normalizeDate(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function toIsoDateTime(value: Date | string): string {
  const date = normalizeDate(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const seconds = `${date.getSeconds()}`.padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function formatDateOnly(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  return toIsoDate(value);
}

export function formatDateTime(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  return toIsoDateTime(value);
}

export function toDateTimeParts(value?: Date | string | null): {
  date?: string;
  time?: string;
} {
  if (!value) {
    return {};
  }

  const date = normalizeDate(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}
