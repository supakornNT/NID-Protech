const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeTextInput(value: string) {
  return value.trim();
}

export function normalizeSearchKeyword(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function keepDigitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidOptionalEmail(value: string) {
  return value.length === 0 || EMAIL_PATTERN.test(value);
}

export function isValidOptionalPhone(value: string) {
  return value.length === 0 || /^\d{9,10}$/.test(value);
}

export function isValidDateRange(startDate: string, endDate: string) {
  return !startDate || !endDate || startDate <= endDate;
}
