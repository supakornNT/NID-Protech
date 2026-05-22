export class CreateStaffDto {
  prefixId?: number | null;

  name!: string;

  surname!: string;

  email!: string;

  phone?: string | null;

  citizenId?: string | null;

  passwordHash!: string;

  status?: string;
}
