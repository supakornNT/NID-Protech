const REPORT_STATUS_LABELS: Record<string, string> = {
  screening: 'รอคัดกรอง',
  assigned: 'รอดำเนินการ',
  in_progress: 'รอดำเนินการ',
  waiting_confirm: 'รอตรวจสอบโดยลูกค้า',
  closed: 'เสร็จสิ้น',
  rejected: 'ถูกปฏิเสธ',
};

export function mapReportStatusLabel(status: string): string {
  return REPORT_STATUS_LABELS[status] ?? status;
}
