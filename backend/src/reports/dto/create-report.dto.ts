export class CreateRequestDto {
  reportNo?: string;
  report_no?: string;
  customerId?: number;
  customer_id?: number;
  organization?: string;
  systemId?: number;
  system_id?: number;
  problemTypeId?: number;
  problem_type_id?: number;
  title!: string;
  detail!: string;
  status!: string;
  score?: number;
  resolveDueAt?: string;
  resolve_due_at?: string;
  closedAt?: string;
  closed_at?: string;
}
