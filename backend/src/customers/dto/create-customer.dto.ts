export class CreateCustomerDto {
  name!: string;

  surname!: string;

  email!: string;

  phone!: string;

  customerType!: string;

  status?: string;
}
