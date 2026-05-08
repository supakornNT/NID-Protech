export class CreateStaffDto {
  name!: string;

  surname!: string;

  email!: string;

  phone!: string;

  passwordHash!: string;

  status?: string;
}
