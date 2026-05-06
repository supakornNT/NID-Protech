export class CreateReportConfirmationDto {
  report_id?: number;

  customer_id?: number;

  result!: string;

  comment?: string;

  score?: number;
}
