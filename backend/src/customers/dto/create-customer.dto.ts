export class CreateCustomerDto {
  name!: string;
  surname!: string;
  email!: string;
  phone!: string;
  customerType?: string;
  customer_type?: string;
  organizationId?: number;
  organization_id?: number;
  status?: string;
}
