export class RegisterDto {
  name!: string;
  surname!: string;
  phone!: string;
  email!: string;
  password!: string;
  otp!: string;
  customer_type!: string;
  prefix_id?: number | null;
  prefixId?: number | null;
  citizen_id?: string | null;
  citizenId?: string | null;
  organization_id?: number | null;
}
