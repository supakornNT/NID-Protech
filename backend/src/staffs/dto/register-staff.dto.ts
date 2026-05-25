export class RegisterStaffDto {
  prefixId?: number | null;

  name!: string;

  surname!: string;

  email!: string;

  phone?: string | null;

  citizenId?: string | null;

  password!: string;

  otp!: string;

  teamIds!: number[];

  status?: string;
}
