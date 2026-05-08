export class CreateReportDto {
  reportNo!: string;

  customerId!: number;

  systemId!: number;

  problemTypeId!: number;

  title!: string;

  detail!: string;

  status!: string;

  score?: number;

  rejectReason?: string;

  resolveDueAt?: string;

  closedAt?: string;
}
