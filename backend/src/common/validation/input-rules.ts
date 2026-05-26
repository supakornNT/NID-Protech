import { BadRequestException } from '@nestjs/common';

export const PROBLEM_TYPE_REQUEST_TYPES = ['issue', 'complaint'] as const;
export const ACTIVE_STATUS_VALUES = ['active', 'inactive'] as const;
export const ORGANIZATION_TYPES = ['company', 'government', 'other'] as const;
export const LOGIN_USER_TYPES = ['staff', 'customer'] as const;
export const LOGIN_STATUS_VALUES = ['success', 'failed'] as const;

export function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeOptionalString(value: unknown) {
  const trimmed = trimString(value);
  return trimmed.length > 0 ? trimmed : undefined;
}

export function requireText(
  value: unknown,
  fieldName: string,
  maxLength: number,
) {
  const normalized = trimString(value);

  if (!normalized) {
    throw new BadRequestException(`${fieldName} is required`);
  }

  if (normalized.length > maxLength) {
    throw new BadRequestException(
      `${fieldName} must be at most ${maxLength} characters`,
    );
  }

  return normalized;
}

export function optionalText(
  value: unknown,
  fieldName: string,
  maxLength: number,
) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return undefined;
  }

  if (normalized.length > maxLength) {
    throw new BadRequestException(
      `${fieldName} must be at most ${maxLength} characters`,
    );
  }

  return normalized;
}

export function requireEnumValue<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[],
) {
  const normalized = requireText(value, fieldName, 255);

  if (!allowedValues.includes(normalized as T)) {
    throw new BadRequestException(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    );
  }

  return normalized as T;
}

export function optionalEnumValue<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[],
) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return undefined;
  }

  if (!allowedValues.includes(normalized as T)) {
    throw new BadRequestException(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    );
  }

  return normalized as T;
}

export function optionalEmail(
  value: unknown,
  fieldName: string,
  maxLength = 255,
) {
  const normalized = optionalText(value, fieldName, maxLength);

  if (!normalized) {
    return undefined;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new BadRequestException(`${fieldName} must be a valid email`);
  }

  return normalized;
}

export function optionalPhone(
  value: unknown,
  fieldName: string,
  maxLength = 20,
) {
  const normalized = optionalText(value, fieldName, maxLength);

  if (!normalized) {
    return undefined;
  }

  if (!/^\d{9,20}$/.test(normalized)) {
    throw new BadRequestException(`${fieldName} must contain 9-20 digits`);
  }

  return normalized;
}

export function positiveIntFromQuery(
  value: unknown,
  fieldName: string,
  defaultValue: number,
  maxValue = Number.MAX_SAFE_INTEGER,
) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new BadRequestException(`${fieldName} must be a positive integer`);
  }

  return Math.min(parsed, maxValue);
}

export function optionalIsoDate(value: unknown, fieldName: string) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return undefined;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new BadRequestException(`${fieldName} must be in YYYY-MM-DD format`);
  }

  return normalized;
}

export function toSafeNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function getCountTotal(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return value;
  }

  if (Array.isArray(value)) {
    const firstRow = value[0];

    if (
      firstRow &&
      typeof firstRow === 'object' &&
      'total' in firstRow
    ) {
      return toSafeNumber(
        (firstRow as { total?: unknown }).total,
        fallback,
      );
    }

    return fallback;
  }

  if (value && typeof value === 'object' && 'total' in value) {
    return toSafeNumber(
      (value as { total?: unknown }).total,
      fallback,
    );
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? fallback : parsed;
}
