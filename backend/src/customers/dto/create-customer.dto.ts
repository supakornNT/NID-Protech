export class CreateCustomerDto {
  prefixId?: number | null;
  prefix_id?: number | null;
  name!: string;
  surname!: string;
  email!: string;
  phone?: string | null;
  citizenId?: string | null;
  citizen_id?: string | null;
  passwordHash?: string;
  password_hash?: string;
  customerType?: string;
  customer_type?: string;
  organizationId?: number;
  organization_id?: number;
  status?: string;
}
