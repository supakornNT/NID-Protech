"use client";

import * as React from "react";

import { ClipboardPlus, FileWarning, Info, Wrench } from "lucide-react";

import ConfirmCloseModal from "@/components/trackstep/popup/ConfirmCloseModal";
import RatingModal from "@/components/trackstep/popup/RatingModal";
import RejectWorkModal from "@/components/trackstep/popup/RejectWorkModal";
import RepairDetailModal from "@/components/trackstep/popup/RepairDetailModal";
import StepProgress from "@/components/trackstep/StepProgress";
import { ProTechButton } from "@/components/tables/protech-button";
import { useTrackingDetail } from "@/hooks/use-tracking-detail";
import { Props, RepairDetail } from "@/types/tracking";

export default function Page({ params }: Props) {
  const { id } = React.use(params);

  const [showRepairDetail, setShowRepairDetail] = React.useState(false);
  const [showRating, setShowRating] = React.useState(false);
  const [showConfirmClose, setShowConfirmClose] = React.useState(false);
  const [showRejectWork, setShowRejectWork] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [repairDetail, setRepairDetail] = React.useState<RepairDetail | null>(
    null,
  );

  const {
    report,
    loading,
    error,
    ratingSubmitting,
    countdown,
    activeStep,
    buildRepairDetail,
    rejectReport,
    confirmReport,
    rateReport,
  } = useTrackingDetail(id);

  // Flow หน้านี้:
  // 1. ใช้ params.id เป็น reportNo แล้วเรียก GET /user/reports/track/:reportNo
  // 2. API คืน detail ของ report เช่น statusCode, problem, repairStatus,
  //    repairedBy, timeline, solution และ customerConfirmDueAt
  //    โดยข้อมูลหลักมาจาก:
  //    -report. id <- reports.id
  //    - trackingNo <- reports.report_no
  //    - problem <- reports.title
  //    - statusCode <- reports.status
  //    - status <- reports.status แล้ว backend map เป็น label ไทย
  //    - repairStatus <- tickets.status / ticket_resolution_requests.status
  //      แล้ว backend map เป็นข้อความแสดงผล
  //    - repairedBy <- staffs.name + staffs.surname
  //      (อ้างจาก ticket ผู้รับผิดชอบล่าสุด)
  //    - solution <- ticket_resolution_requests.summary
  //    - timeline <- report_status_logs ของ report นี้
  //    - customerConfirmDueAt <- derive จาก report_status_logs.created_at
  //      ตอน new_status = 'waiting_confirm' แล้วบวก 3 วัน
  // 3. statusCode เป็นตัวคุมการแสดงผล:
  //    - waiting_confirm: แสดง countdown และปุ่มอนุมัติ/ไม่อนุมัติ
  //    - closed: แสดงปุ่มประเมินเมื่อยังไม่เคยให้คะแนน
  //    - rejected: แสดงกากบาทที่ step คัดกรอง
  // 4. action ในหน้านี้:
  //    - confirmReport() -> POST /user/reports/:id/confirm
  //    - rejectReport(reason) -> POST /user/reports/:id/reject
  //    - rateReport(...) -> POST /user/reports/:id/rating

  if (loading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  if (error || !report) {
    return <div className="p-6 text-red-600">{error ?? "ไม่พบข้อมูล"}</div>;
  }

  async function handleOpenRepairDetail() {
    const currentReport = report;

    if (!currentReport) {
      return;
    }

    // modal นี้ใช้ข้อมูลที่ได้มาจาก detail API เดิม
    // ไม่ได้ยิง API เพิ่มตอนเปิดรายละเอียดการแก้ไข
    setRepairDetail(buildRepairDetail(currentReport));
    setShowRepairDetail(true);
  }

  async function handleConfirmDone() {
    // ยืนยันผลการแก้ไข -> backend ปิด report/ticket แล้วส่งสถานะล่าสุดกลับมา
    await confirmReport();
    setShowConfirmClose(false);
  }

  async function handleRejectWork() {
    // ไม่อนุมัติ -> ส่ง reason เพื่อ reopen งานกลับไป assigned
    await rejectReport(rejectReason);
    setShowRejectWork(false);
    setRejectReason("");
  }

  async function handleSubmitRating(payload: {
    rating: number;
    comment: string;
  }) {
    // ให้คะแนนหลังงาน closed แล้วเท่านั้น
    await rateReport(payload);
    setShowRating(false);
  }

  const canReview = report.statusCode === "waiting_confirm";
  const canRate =
    report.statusCode === "closed" && report.ratingStatus !== "ประเมินแล้ว";
  const canViewRepairDetail =
    report.statusCode === "waiting_confirm" || report.statusCode === "closed";

  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-6 sm:py-10">
        {error ? (
          <p className="mb-4 self-stretch text-sm text-red-600">{error}</p>
        ) : null}

        <StepProgress
          steps={report.timeline}
          activeStep={activeStep}
          isCompleted={report.statusCode === "closed"}
          rejectedStep={report.statusCode === "rejected" ? 2 : undefined}
        />

        <section className="mt-10 w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#2F66C5] bg-white shadow-sm sm:mt-16">
          <div className="flex flex-col gap-4 bg-[#A9CCFF] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#2F66C5] bg-[#DCE9FF]">
                <ClipboardPlus className="text-[#2F66C5]" />
              </div>

              <div>
                <p className="font-semibold text-[#20498F]">{report.status}</p>

                <p className="text-xs text-[#315FAF]">ระบบติดตามการดำเนินงาน</p>
              </div>
            </div>

            {canReview ? (
              <p className="text-[14px] font-medium text-[#315FAF] sm:text-[15px]">
                เหลือ {countdown}
              </p>
            ) : null}
          </div>

          <div className="px-4 py-5 sm:px-8">
            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FileWarning size={22} className="shrink-0 text-gray-500" />
                <p className="text-[14px] sm:text-[15px]">ปัญหาที่พบ</p>
              </div>

              <p className="text-[14px] text-gray-700 sm:text-[15px] sm:text-right">
                {report.problem}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Info size={22} className="shrink-0 text-gray-500" />
                <p className="text-[14px] sm:text-[15px]">สถานะการดำเนินงาน</p>
              </div>

              <p className="text-[14px] text-gray-700 sm:text-[15px] sm:text-right">
                {report.repairStatus}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Wrench size={22} className="shrink-0 text-gray-500" />
                <p className="text-[14px] sm:text-[15px]">ดำเนินการโดย</p>
              </div>

              <div className="sm:flex sm:min-w-[220px] sm:items-center sm:justify-end">
                <p className="text-[14px] text-gray-700 sm:text-[15px] sm:text-right">
                  {report.repairedBy ?? "-"}
                </p>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Info size={22} className="shrink-0 text-gray-500" />

                  <p className="text-[14px] sm:text-[15px]">วิธีการแก้ไข</p>
                </div>

                <ProTechButton
                  onClick={canViewRepairDetail ? handleOpenRepairDetail : undefined}
                  variant="detail"
                  disabled={!canViewRepairDetail}
                >
                  รายละเอียด
                </ProTechButton>
              </div>
            </div>

            {canReview ? (
              <div className="flex justify-end gap-3 py-4">
                <ProTechButton
                  onClick={() => setShowRejectWork(true)}
                  variant="outline"
                >
                  ไม่อนุมัติ
                </ProTechButton>

                <ProTechButton
                  onClick={() => setShowConfirmClose(true)}
                  variant="primary"
                >
                  อนุมัติ
                </ProTechButton>
              </div>
            ) : null}

            {canRate ? (
              <div className="flex justify-end py-4">
                <ProTechButton onClick={() => setShowRating(true)}>
                  ประเมิน
                </ProTechButton>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <ConfirmCloseModal
        open={showConfirmClose}
        title="ยืนยันปิดงาน"
        description="คุณต้องการยืนยันปิดงานใช่หรือไม่"
        subDescription="หลังจากยืนยันแล้ว ระบบจะถือว่างานเสร็จสมบูรณ์"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onClose={() => setShowConfirmClose(false)}
        onConfirm={() => {
          void handleConfirmDone();
        }}
      />

      <RejectWorkModal
        open={showRejectWork}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onClose={() => {
          setShowRejectWork(false);
          setRejectReason("");
        }}
        onConfirm={() => {
          void handleRejectWork();
        }}
      />

      <RepairDetailModal
        open={showRepairDetail}
        data={repairDetail}
        onClose={() => setShowRepairDetail(false)}
      />

      <RatingModal
        open={showRating}
        loading={ratingSubmitting}
        onClose={() => setShowRating(false)}
        onSubmit={handleSubmitRating}
      />
    </>
  );
}
