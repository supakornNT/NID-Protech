export class UpdateRequestDto {
  request_no?: string;

  customer_id?: number;

  organization?: string;

  system_id?: number;

  problem_type_id?: number;

  title?: string;

  detail?: string;

  status?: string;

  score?: number;

  resolve_due_at?: string;

  closed_at?: string;
}
