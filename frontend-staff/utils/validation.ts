// utils/validation.ts

export function required(value: string, label: string) {
  if (!value.trim()) {
    return `กรุณากรอก${label}`;
  }

  return null;
}

export function exactLength(
  value: string,
  length: number,
  label: string,
) {
  if (value.length !== length) {
    return `${label} ต้องมี ${length} หลัก`;
  }

  return null;
}

export function minLength(
  value: string,
  length: number,
  label: string,
) {
  if (value.trim().length < length) {
    return `${label} ต้องอย่างน้อย ${length} ตัวอักษร`;
  }

  return null;
}