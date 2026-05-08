import {
  normalizeDate as normalizeDateUtil,
  toIsoDateTime as toIsoDateTimeUtil,
} from '../../common/utils/date-time.util';

export function mapRepairStatus(
  reportStatus: string,
  resolutionRequestStatus: string | null,
): string {
  if (
    reportStatus === 'waiting_confirm' &&
    resolutionRequestStatus === 'approved'
  ) {
    return 'หัวหน้าอนุมัติผลการแก้ไขแล้ว รอลูกค้ายืนยัน';
  }

  if (reportStatus === 'waiting_confirm') {
    return 'ส่งผลการแก้ไขแล้ว รอลูกค้ายืนยัน';
  }

  if (reportStatus === 'closed') {
    return 'ปิดงานแล้ว';
  }

  if (reportStatus === 'assigned' || reportStatus === 'in_progress') {
    return 'เจ้าหน้าที่กำลังดำเนินการแก้ไข';
  }

  if (reportStatus === 'screening') {
    return 'เจ้าหน้าที่กำลังคัดกรองปัญหา';
  }

  if (reportStatus === 'rejected') {
    return 'รายการถูกปฏิเสธ';
  }

  return 'รอคัดกรอง';
}

export function getCurrentStep(reportStatus: string): number {
  if (reportStatus === 'screening') {
    return 2;
  }

  if (reportStatus === 'assigned' || reportStatus === 'in_progress') {
    return 3;
  }

  return 4;
}

export function getTimelineStatus(
  stepNumber: number,
  currentStep: number,
  reportStatus: string,
): 'completed' | 'active' | 'pending' {
  if (reportStatus === 'closed') {
    return 'completed';
  }

  if (stepNumber < currentStep) {
    return 'completed';
  }

  if (stepNumber === currentStep) {
    return 'active';
  }

  return 'pending';
}

export function getCustomerConfirmDueAt(
  waitingConfirmAt?: Date | string,
): string | null {
  if (!waitingConfirmAt) {
    return null;
  }

  const dueDate = normalizeDateUtil(waitingConfirmAt);
  dueDate.setDate(dueDate.getDate() + 3);

  return toIsoDateTimeUtil(dueDate);
}
