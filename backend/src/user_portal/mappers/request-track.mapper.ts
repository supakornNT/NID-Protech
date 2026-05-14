import {
  formatDateTime as formatDateTimeUtil,
  toDateTimeParts as toDateTimePartsUtil,
} from '../../common/utils/date-time.util';
import { mapRequestStatusLabel as mapRequestStatusLabelUtil } from '../../common/utils/request-status.util';
import { getStaffFullName as getStaffFullNameUtil } from '../../common/utils/staff.util';
import {
  getCurrentStep as getCurrentStepHelper,
  getCustomerConfirmDueAt as getCustomerConfirmDueAtHelper,
  getTimelineStatus as getTimelineStatusHelper,
  mapRepairStatus as mapRepairStatusHelper,
} from '../helpers/request-track.helper';
import {
  PublicRequestTrack,
  PublicRequestTrackTimeline,
} from '../interfaces/public-request-track.interface';
import {
  RequestTrackRow,
  StatusLogRow,
} from '../interfaces/request-track-row.interface';

export function mapTrackResponse(
  request: RequestTrackRow,
  requestStatusLogs: StatusLogRow[],
): PublicRequestTrack {
  const currentStep = getCurrentStepHelper(request.requestStatus);
  const firstInProgressLog = requestStatusLogs.find(
    (log) => log.new_status === 'assigned' || log.new_status === 'in_progress',
  );
  const waitingConfirmLog = requestStatusLogs.find(
    (log) => log.new_status === 'waiting_confirm',
  );
  const screeningLog = requestStatusLogs.find(
    (log) => log.new_status === 'screening',
  );

  const requestedAt = toDateTimePartsUtil(request.requestCreatedAt);
  const screeningAt = toDateTimePartsUtil(screeningLog?.created_at);
  const inProgressAt = toDateTimePartsUtil(firstInProgressLog?.created_at);
  const waitingConfirmAt = toDateTimePartsUtil(waitingConfirmLog?.created_at);
  const customerConfirmDueAt = getCustomerConfirmDueAtHelper(
    waitingConfirmLog?.created_at,
  );

  const timeline: PublicRequestTrackTimeline[] = [
    {
      label: 'แจ้งปัญหา',
      status: getTimelineStatusHelper(1, currentStep, request.requestStatus),
      date: requestedAt.date,
      time: requestedAt.time,
    },
    {
      label: 'คัดกรอง',
      status: getTimelineStatusHelper(2, currentStep, request.requestStatus),
      date: screeningAt.date,
      time: screeningAt.time,
    },
    {
      label: 'ดำเนินการ',
      status: getTimelineStatusHelper(3, currentStep, request.requestStatus),
      date: inProgressAt.date,
      time: inProgressAt.time,
    },
    {
      label: 'รอตรวจสอบโดยลูกค้า',
      status: getTimelineStatusHelper(4, currentStep, request.requestStatus),
      date: waitingConfirmAt.date,
      time: waitingConfirmAt.time,
    },
  ];

  return {
    id: request.id,
    trackingNo: request.requestNo,
    problem: request.title,
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
    ratingStatus: request.score === null ? 'ยังไม่ประเมิน' : 'ประเมินแล้ว',
    timeline,
    solution: request.resolutionSummary ?? request.detail,
    repairedAt: formatDateTimeUtil(request.reviewedAt),
    customerConfirmDueAt,
  };
}
