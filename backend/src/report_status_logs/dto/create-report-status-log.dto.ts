export class CreateReportStatusLogDto {
  report_id: number;

  old_status: string;

  new_status: string;

  changed_by_type: string;

  changed_by_id: number;

  note?: string;
}
