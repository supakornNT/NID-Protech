export class CreateServiceRequestDto {
  customer_id?: string;
  title!: string;
  problem_type_id!: string;
  detail!: string;
  resolve_due_at?: string;
}
