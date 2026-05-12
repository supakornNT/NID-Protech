export class RegisterDto {
  name!: string;
  surname!: string;
  phone!: string;
  email!: string;
  password!: string;
  otp!: string;
  customer_type!: string;
  organization_id?: number | null;
}
