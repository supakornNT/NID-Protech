import {
  normalizeDate as normalizeDateUtil,
  toIsoDateTime as toIsoDateTimeUtil,
} from "../../common/utils/date-time.util";

export function mapRepairStatus(
  requestStatus: string,
  resolutionRequestStatus: string | null,
): string {
  if (
    requestStatus === "waiting_confirm" &&
    resolutionRequestStatus === "approved"
  ) {
    return "รออนุมัติ";
  }

  if (requestStatus === "waiting_confirm") {
    return "รออนุมัติ";
  }

  if (requestStatus === "closed") {
    return "ปิดงานแล้ว";
  }

  if (requestStatus === "assigned" || requestStatus === "in_progress") {
    return "กำลังดำเนินการแก้ไข";
  }

  if (requestStatus === "screening") {
    return "กำลังคัดกรองปัญหา";
  }

  if (requestStatus === "rejected") {
    return "รายการถูกปฏิเสธ";
  }

  return "รอคัดกรอง";
}

export function getCurrentStep(requestStatus: string): number {
  if (requestStatus === "screening") {
    return 2;
  }

  if (requestStatus === "assigned" || requestStatus === "in_progress") {
    return 3;
  }

  return 4;
}

export function getTimelineStatus(
  stepNumber: number,
  currentStep: number,
  requestStatus: string,
): "completed" | "active" | "pending" {
  if (requestStatus === "closed") {
    return "completed";
  }

  if (stepNumber < currentStep) {
    return "completed";
  }

  if (stepNumber === currentStep) {
    return "active";
  }

  return "pending";
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
