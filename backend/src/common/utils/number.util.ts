import { BadRequestException } from '@nestjs/common';

export function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
  fieldName: string,
): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new BadRequestException(`${fieldName} must be a positive integer`);
  }

  return parsedValue;
}
