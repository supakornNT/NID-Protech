import {
  formatDateTime as formatDateTimeUtil,
  toDateTimeParts as toDateTimePartsUtil,
} from '../../common/utils/date-time.util';
import { mapReportStatusLabel as mapReportStatusLabelUtil } from '../../common/utils/report-status.util';
import { getStaffFullName as getStaffFullNameUtil } from '../../common/utils/staff.util';
import {
  getCurrentStep as getCurrentStepHelper,
  getCustomerConfirmDueAt as getCustomerConfirmDueAtHelper,
  getTimelineStatus as getTimelineStatusHelper,
  mapRepairStatus as mapRepairStatusHelper,
} from '../helpers/report-track.helper';
import {
  PublicReportTrack,
  PublicReportTrackTimeline,
} from '../interfaces/public-report-track.interface';
import {
  ReportTrackRow,
  StatusLogRow,
} from '../interfaces/report-track-row.interface';

export function mapTrackResponse(
  report: ReportTrackRow,
  reportStatusLogs: StatusLogRow[],
): PublicReportTrack {
  const currentStep = getCurrentStepHelper(report.report_status);
  const firstInProgressLog = reportStatusLogs.find(
    (log) => log.new_status === 'assigned' || log.new_status === 'in_progress',
  );
  const waitingConfirmLog = reportStatusLogs.find(
    (log) => log.new_status === 'waiting_confirm',
  );
  const screeningLog = reportStatusLogs.find(
    (log) => log.new_status === 'screening',
  );

  const reportedAt = toDateTimePartsUtil(report.report_created_at);
  const screeningAt = toDateTimePartsUtil(screeningLog?.created_at);
  const inProgressAt = toDateTimePartsUtil(firstInProgressLog?.created_at);
  const waitingConfirmAt = toDateTimePartsUtil(waitingConfirmLog?.created_at);
  const customerConfirmDueAt = getCustomerConfirmDueAtHelper(
    waitingConfirmLog?.created_at,
  );

  const timeline: PublicReportTrackTimeline[] = [
    {
      label: 'แจ้งปัญหา',
      status: getTimelineStatusHelper(1, currentStep, report.report_status),
      date: reportedAt.date,
      time: reportedAt.time,
    },
    {
      label: 'คัดกรอง',
      status: getTimelineStatusHelper(2, currentStep, report.report_status),
      date: screeningAt.date,
      time: screeningAt.time,
    },
    {
      label: 'ดำเนินการ',
      status: getTimelineStatusHelper(3, currentStep, report.report_status),
      date: inProgressAt.date,
      time: inProgressAt.time,
    },
    {
      label: 'รอตรวจสอบโดยลูกค้า',
      status: getTimelineStatusHelper(4, currentStep, report.report_status),
      date: waitingConfirmAt.date,
      time: waitingConfirmAt.time,
    },
  ];

  return {
    id: report.id,
    trackingNo: report.report_no,
    problem: report.title,
    statusCode: report.report_status,
    status: mapReportStatusLabelUtil(report.report_status),
    repairStatus: mapRepairStatusHelper(
      report.report_status,
      report.resolution_request_status,
    ),
    repairedBy: getStaffFullNameUtil(
      report.repaired_by_name,
      report.repaired_by_surname,
    ),
    ratingStatus: report.score === null ? 'ยังไม่ประเมิน' : 'ประเมินแล้ว',
    timeline,
    solution: report.resolution_summary ?? report.detail,
    repairedAt: formatDateTimeUtil(report.reviewed_at),
    customerConfirmDueAt,
  };
}
