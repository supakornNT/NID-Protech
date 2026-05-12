export function getStaffFullName(
  name: string | null,
  surname: string | null,
): string {
  const fullName = [name, surname]
    .filter((value): value is string => Boolean(value))
    .join(' ');

  return fullName || '-';
}
