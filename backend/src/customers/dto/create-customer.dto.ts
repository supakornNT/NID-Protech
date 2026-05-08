export class CreateCustomerDto {
  name!: string;
  surname!: string;
  email!: string;
  phone!: string;
  customer_type!: string;
  organization_id?: number;
  status?: string;
}
