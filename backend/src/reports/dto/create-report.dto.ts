export class CreateReportDto {
  report_no: string;

  customer_id: number;

  system_id: number;

  problem_type_id: number;

  title: string;

  detail: string;

  status: string;

  score?: number;

  reject_reason?: string;

  resolve_due_at?: string;

  closed_at?: string;
}
