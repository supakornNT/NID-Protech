import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(value: string | null | undefined): string {
  if (!value) {
    return "-"
  }

  const digits = value.replace(/\D/g, "")

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export function formatCitizenId(value: string | null | undefined): string {
  if (!value) {
    return "-"
  }

  const digits = value.replace(/\D/g, "")

  if (digits.length <= 1) {
    return digits
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 1)}-${digits.slice(1)}`
  }

  if (digits.length <= 10) {
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`
  }

  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12, 13)}`
}
