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
    request,
    loading,
    error,
    ratingSubmitting,
    countdown,
    activeStep,
    buildRepairDetail,
    rejectRequest,
    confirmRequest,
    rateRequest,
  } = useTrackingDetail(id);

  if (loading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  if (error || !request) {
    return <div className="p-6 text-red-600">{error ?? "ไม่พบข้อมูล"}</div>;
  }

  async function handleOpenRepairDetail() {
    if (!request) {
      return;
    }

    setRepairDetail(buildRepairDetail(request));
    setShowRepairDetail(true);
  }

  async function handleConfirmDone() {
    await confirmRequest();
    setShowConfirmClose(false);
  }

  async function handleRejectWork() {
    await rejectRequest(rejectReason);
    setShowRejectWork(false);
    setRejectReason("");
  }

  async function handleSubmitRating(payload: {
    rating: number;
    comment: string;
  }) {
    await rateRequest(payload);
    setShowRating(false);
  }

  const canReview = request.statusCode === "waiting_confirm";
  const canRate =
    request.statusCode === "closed" && request.ratingStatus !== "ประเมินแล้ว";
  const canViewRepairDetail =
    request.statusCode === "waiting_confirm" ||
    request.statusCode === "closed";

  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-6 sm:py-10">
        {error ? (
          <p className="mb-4 self-stretch text-sm text-red-600">{error}</p>
        ) : null}

        <StepProgress
          steps={request.timeline}
          activeStep={activeStep}
          isCompleted={request.statusCode === "closed"}
          rejectedStep={request.statusCode === "rejected" ? 2 : undefined}
        />

        <section className="mt-10 w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#2F66C5] bg-white shadow-sm sm:mt-16">
          <div className="flex flex-col gap-4 bg-[#A9CCFF] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#2F66C5] bg-[#DCE9FF]">
                <ClipboardPlus className="text-[#2F66C5]" />
              </div>

              <div>
                <p className="font-semibold text-[#20498F]">{request.status}</p>
                <p className="text-xs text-[#315FAF]">
                  ระบบติดตามการดำเนินงาน
                </p>
              </div>
            </div>

            {canReview ? (
              <p className="text-[14px] font-medium text-[#315FAF] sm:text-[15px]">
                เหลือเวลา {countdown}
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
                {request.problem}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Info size={22} className="shrink-0 text-gray-500" />
                <p className="text-[14px] sm:text-[15px]">
                  สถานะการดำเนินงาน
                </p>
              </div>

              <p className="text-[14px] text-gray-700 sm:text-[15px] sm:text-right">
                {request.repairStatus}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Wrench size={22} className="shrink-0 text-gray-500" />
                <p className="text-[14px] sm:text-[15px]">ดำเนินการโดย</p>
              </div>

              <div className="sm:flex sm:min-w-[220px] sm:items-center sm:justify-end">
                <p className="text-[14px] text-gray-700 sm:text-[15px] sm:text-right">
                  {request.repairedBy ?? "-"}
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
                  onClick={
                    canViewRepairDetail ? handleOpenRepairDetail : undefined
                  }
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
