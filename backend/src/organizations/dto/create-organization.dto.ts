export class CreateOrganizationDto {
  name?: string;

  type?: string;

  email?: string | null;

  phone?: string | null;

  status?: string;
}
