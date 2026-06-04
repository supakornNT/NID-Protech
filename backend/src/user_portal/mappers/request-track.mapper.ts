import {
  formatDateOnly as formatDateOnlyUtil,
  formatDateTime as formatDateTimeUtil,
  toDateTimeParts as toDateTimePartsUtil,
} from "../../common/utils/date-time.util";
import { mapRequestStatusLabel as mapRequestStatusLabelUtil } from "../../common/utils/request-status.util";
import { getStaffFullName as getStaffFullNameUtil } from "../../common/utils/staff.util";
import {
  getCurrentStep as getCurrentStepHelper,
  getCustomerConfirmDueAt as getCustomerConfirmDueAtHelper,
  getTimelineStatus as getTimelineStatusHelper,
  mapRepairStatus as mapRepairStatusHelper,
} from "../helpers/request-track.helper";
import {
  PublicRequestTrack,
  PublicRequestTrackTimeline,
} from "../interfaces/public-request-track.interface";
import {
  RequestTrackRow,
  StatusLogRow,
} from "../interfaces/request-track-row.interface";

export function mapTrackResponse(
  request: RequestTrackRow,
  requestStatusLogs: StatusLogRow[],
): PublicRequestTrack {
  const currentStep = getCurrentStepHelper(request.requestStatus);
  const firstInProgressLog = requestStatusLogs.find(
    (log) => log.status === "assigned" || log.status === "in_progress",
  );
  const waitingConfirmLog = requestStatusLogs.find(
    (log) => log.status === "waiting_confirm",
  );
  const screeningLog = requestStatusLogs.find(
    (log) => log.status === "screening",
  );
  const rejectedLog = requestStatusLogs.find(
    (log) => log.status === "rejected",
  );

  const requestedAt = toDateTimePartsUtil(request.requestCreatedAt);
  const screeningAt = toDateTimePartsUtil(screeningLog?.created_at);
  const inProgressAt = toDateTimePartsUtil(firstInProgressLog?.created_at);
  const waitingConfirmAt = toDateTimePartsUtil(waitingConfirmLog?.created_at);
  const customerConfirmDueAt = getCustomerConfirmDueAtHelper(
    waitingConfirmLog?.created_at,
  );

  const step1Status = getTimelineStatusHelper(1, currentStep, request.requestStatus);
  const step2Status = getTimelineStatusHelper(2, currentStep, request.requestStatus);
  const step3Status = getTimelineStatusHelper(3, currentStep, request.requestStatus);
  const step4Status = getTimelineStatusHelper(4, currentStep, request.requestStatus);

  const timeline: PublicRequestTrackTimeline[] = [
    {
      label: "แจ้งปัญหา",
      status: step1Status,
      date: requestedAt.date,
      time: requestedAt.time,
    },
    {
      label: "คัดกรอง",
      status: step2Status,
      date: step2Status === "pending" ? undefined : screeningAt.date,
      time: step2Status === "pending" ? undefined : screeningAt.time,
    },
    {
      label: "ดำเนินการ",
      status: step3Status,
      date: step3Status === "pending" ? undefined : inProgressAt.date,
      time: step3Status === "pending" ? undefined : inProgressAt.time,
    },
    {
      label: "รอตรวจสอบโดยลูกค้า",
      status: step4Status,
      date: step4Status === "pending" ? undefined : waitingConfirmAt.date,
      time: step4Status === "pending" ? undefined : waitingConfirmAt.time,
    },
  ];

  return {
    id: request.id,
    trackingNo: request.requestNo,
    problem: request.title,
    problemDetail: request.detail,
    statusCode: request.requestStatus,
    status: mapRequestStatusLabelUtil(request.requestStatus),
    repairStatus: mapRepairStatusHelper(
      request.requestStatus,
      request.resolutionRequestStatus,
    ),
    repairedBy: getStaffFullNameUtil(
      request.repairedByName,
      request.repairedBySurname,
    ),
    ratingStatus: request.score === null ? "ยังไม่ประเมิน" : "ประเมินแล้ว",
    timeline,
    solution: request.requestStatus === "rejected"
      ? (rejectedLog?.note ?? "")
      : (request.resolutionSummary ?? ""),
    repairedAt: request.requestStatus === "rejected"
      ? formatDateTimeUtil(rejectedLog?.created_at ?? null)
      : formatDateTimeUtil(request.reviewedAt),
    customerConfirmDueAt,
    dueAt: formatDateOnlyUtil(request.dueAt),
  };
}
