export class CreateInternalRequestDto {
  customer_id!: string;
  organization!: string;
  title!: string;
  problem_type_id!: string;
  system_id!: string;
  detail!: string;
  resolve_due_at?: string;
}
