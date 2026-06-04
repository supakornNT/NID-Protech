"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardPlus,
  FileText,
  FileWarning,
  History,
  Info,
  Wrench,
} from "lucide-react";

import ConfirmCloseModal from "@/components/trackstep/popup/ConfirmCloseModal";
import RatingModal from "@/components/trackstep/popup/RatingModal";
import RejectWorkModal from "@/components/trackstep/popup/RejectWorkModal";
import RepairDetailModal from "@/components/trackstep/popup/RepairDetailModal";
import RequestAttachmentModal from "@/components/trackstep/popup/RequestAttachmentModal";
import StepProgress from "@/components/trackstep/StepProgress";
import { ProTechButton } from "@/components/tables/protech-button";
import { useTrackingDetail } from "@/hooks/use-tracking-detail";
import { Props, RepairDetail, ReopenRound } from "@/types/tracking";

const labelClass = "whitespace-nowrap text-[14px] sm:text-[15px]";
const valueClass = "whitespace-pre-wrap break-words text-[14px] text-gray-700 sm:text-[15px]";

export default function Page({ params }: Props) {
  const { id } = React.use(params);

  const [showRepairDetail, setShowRepairDetail] = React.useState(false);
  const [showRequestFiles, setShowRequestFiles] = React.useState(false);
  const [showHistoryList, setShowHistoryList] = React.useState(false);
  const [repairDetailModalProps, setRepairDetailModalProps] = React.useState<{
    title?: string;
    subtitle?: string;
    descriptionLabel?: string;
    dateLabel?: string;
    filesLabel?: string;
  }>({});
  const [showRating, setShowRating] = React.useState(false);
  const [showConfirmClose, setShowConfirmClose] = React.useState(false);
  const [showRejectWork, setShowRejectWork] = React.useState(false);
  const [showProblem, setShowProblem] = React.useState(false);
  const [showProblemDetail, setShowProblemDetail] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectFiles, setRejectFiles] = React.useState<File[]>([]);
  const [repairDetail, setRepairDetail] = React.useState<RepairDetail | null>(
    null,
  );

  const problemRef = React.useRef<HTMLParagraphElement>(null);
  const problemDetailRef = React.useRef<HTMLParagraphElement>(null);
  const [problemNeedsExpand, setProblemNeedsExpand] = React.useState(false);
  const [problemDetailNeedsExpand, setProblemDetailNeedsExpand] = React.useState(false);

  const {
    request,
    loading,
    error,
    ratingSubmitting,
    rejectSubmitting,
    countdown,
    activeStep,
    buildRepairDetail,
    rejectRequest,
    confirmRequest,
    rateRequest,
  } = useTrackingDetail(id);

  React.useLayoutEffect(() => {
    const el = problemRef.current;
    if (!el || showProblem) return;
    setProblemNeedsExpand(el.scrollHeight > el.clientHeight + 1);
  }, [showProblem, request?.problem]);

  React.useLayoutEffect(() => {
    const el = problemDetailRef.current;
    if (!el || showProblemDetail) return;
    setProblemDetailNeedsExpand(el.scrollHeight > el.clientHeight + 1);
  }, [showProblemDetail, request?.problemDetail]);

  if (loading || !id || id === "undefined") {
    return (
      <div className="mx-auto flex w-full max-w-3xl animate-pulse flex-col items-center px-4 py-6 sm:py-10">
        <div className="flex w-full items-center justify-between px-4 sm:px-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-200" />
              </div>
              {i < 3 && <div className="mx-2 h-1 flex-1 bg-gray-200" />}
            </React.Fragment>
          ))}
        </div>

        <section className="mt-10 w-full max-w-3xl overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm sm:mt-16">
          <div className="flex flex-col gap-4 bg-gray-100 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 shrink-0 rounded bg-gray-200" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 border-b py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-48 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error || !request) {
    return <div className="p-6 text-red-600">{error ?? "ไม่พบข้อมูลคำขอ"}</div>;
  }

  async function handleOpenRepairDetail() {
    if (!request) {
      return;
    }

    setRepairDetail(buildRepairDetail(request));
    if (request.statusCode === "rejected") {
      setRepairDetailModalProps({
        title: "รายละเอียดการปฏิเสธคำขอ",
        subtitle: "เหตุผลที่ปฏิเสธการดำเนินการ",
        descriptionLabel: "เหตุผลการปฏิเสธ",
        dateLabel: "วันที่ปฏิเสธ",
        filesLabel: "ไฟล์หลักฐานประกอบ",
      });
    } else {
      setRepairDetailModalProps({
        title: "รายละเอียดการแก้ไขปัญหา",
        subtitle: "ขั้นตอนและหลักฐานการแก้ไขล่าสุด",
        descriptionLabel: "รายละเอียดการแก้ไข",
        dateLabel: "วันที่ดำเนินการ",
        filesLabel: "ไฟล์หลักฐานการแก้ไข",
      });
    }
    setShowRepairDetail(true);
  }


  function handleOpenRoundStaffDetail(round: ReopenRound) {
    setRepairDetail({
      description: "",
      repairedAt: "",
      files: round.staffFiles,
    });
    setRepairDetailModalProps({
      title: `ไฟล์หลักฐานการแก้ไข (รอบที่ ${round.roundNumber})`,
      subtitle: "ไฟล์หลักฐานที่เจ้าหน้าที่อัพโหลดในรอบนี้",
      dateLabel: "วันที่ดำเนินการ",
      filesLabel: "ไฟล์หลักฐานการแก้ไข",
    });
    setShowRepairDetail(true);
  }

  function handleOpenRoundUserDetail(round: ReopenRound) {
    setRepairDetail({
      description: round.comment || "-",
      repairedAt: round.reopenedAt || "-",
      files: round.files,
    });
    setRepairDetailModalProps({
      title: `รายละเอียดการตีกลับงาน (รอบที่ ${round.roundNumber})`,
      subtitle: "รายละเอียดและหลักฐานการส่งแก้ไขโดยลูกค้า",
      descriptionLabel: "เหตุผลที่ส่งแก้ไข",
      dateLabel: "วันที่ส่งแก้ไข",
      filesLabel: "ไฟล์แนบหลักฐานตีกลับ",
    });
    setShowRepairDetail(true);
  }

  async function handleConfirmDone() {
    await confirmRequest();
    setShowConfirmClose(false);
  }

  async function handleRejectWork() {
    await rejectRequest({
      reason: rejectReason,
      files: rejectFiles,
    });
    setShowRejectWork(false);
    setRejectReason("");
    setRejectFiles([]);
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
    request.statusCode === "closed" ||
    request.statusCode === "rejected";
  const hasRequestFiles = (request.requestFiles?.length ?? 0) > 0;
  const problem = request.problem?.trim() || "-";
  const problemDetail = request.problemDetail?.trim() || "-";

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
                <p className="text-xs text-[#315FAF]">สถานะการดำเนินการของคำขอ</p>
              </div>
            </div>

            {canReview ? (
              <p className="text-[14px] font-medium text-[#315FAF] sm:text-[15px]">
                เหลือเวลายืนยันงาน {countdown}
              </p>
            ) : null}
          </div>

          <div className="px-4 py-5 sm:px-8">
            <div className="border-b py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileWarning size={22} className="shrink-0 text-gray-500" />
                  <p className={labelClass}>ปัญหาที่พบ</p>
                </div>
                {(problemNeedsExpand || showProblem) ? (
                  <button
                    type="button"
                    onClick={() => setShowProblem((c) => !c)}
                    className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-[#2F66C5] hover:text-[#20498F]"
                  >
                    {showProblem ? (
                      <>ย่อ<ChevronUp size={16} /></>
                    ) : (
                      <>ดูเพิ่มเติม<ChevronDown size={16} /></>
                    )}
                  </button>
                ) : null}
              </div>
              <p
                ref={problemRef}
                className={[
                  valueClass,
                  showProblem ? "" : "line-clamp-2 overflow-hidden",
                  "mt-2 pl-[34px]",
                ].join(" ")}
              >
                {problem}
              </p>
            </div>

            <div className="border-b py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Info size={22} className="shrink-0 text-gray-500" />
                  <p className={labelClass}>รายละเอียดปัญหา</p>
                </div>
                {(problemDetailNeedsExpand || showProblemDetail) ? (
                  <button
                    type="button"
                    onClick={() => setShowProblemDetail((c) => !c)}
                    className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-[#2F66C5] hover:text-[#20498F]"
                  >
                    {showProblemDetail ? (
                      <>ย่อ<ChevronUp size={16} /></>
                    ) : (
                      <>ดูเพิ่มเติม<ChevronDown size={16} /></>
                    )}
                  </button>
                ) : null}
              </div>
              <p
                ref={problemDetailRef}
                className={[
                  valueClass,
                  showProblemDetail ? "" : "line-clamp-4 overflow-hidden",
                  "mt-2 pl-[34px]",
                ].join(" ")}
              >
                {problemDetail}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex items-center gap-3">
                <Info size={22} className="shrink-0 text-gray-500" />
                <p className={labelClass}>สถานะการดำเนินงาน</p>
              </div>

              <p className={valueClass}>{request.repairStatus}</p>
            </div>

            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex items-center gap-3">
                <Wrench size={22} className="shrink-0 text-gray-500" />
                <p className={labelClass}>ดำเนินการโดย</p>
              </div>

              <div className="sm:flex sm:min-w-[220px] sm:items-center sm:justify-end">
                <p className={valueClass}>{request.repairedBy ?? "-"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-b py-4">
              <div className="flex items-center gap-3">
                <FileText size={22} className="shrink-0 text-gray-500" />
                <p className={labelClass}>ไฟล์แนบจากการแจ้งปัญหา</p>
              </div>

              <ProTechButton
                onClick={hasRequestFiles ? () => setShowRequestFiles(true) : undefined}
                variant="detail"
                disabled={!hasRequestFiles}
                className="min-w-[100px]"
              >
                ดูไฟล์แนบ
              </ProTechButton>
            </div>

            <div className="py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Info size={22} className="shrink-0 text-gray-500" />
                  <p className={labelClass}>รายละเอียดการแก้ไข</p>
                </div>

                <ProTechButton
                  onClick={canViewRepairDetail ? handleOpenRepairDetail : undefined}
                  variant="detail"
                  disabled={!canViewRepairDetail}
                >
                  ดูรายละเอียด
                </ProTechButton>
              </div>
            </div>

            {request.reopenRounds && request.reopenRounds.length > 0 ? (
              <div className="mt-4 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowHistoryList(!showHistoryList)}
                  className="mb-3 flex w-full items-center justify-between text-base font-semibold text-[#20498F] hover:opacity-80 transition"
                >
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-[#2F66C5]" />
                    <span>ประวัติการส่งแก้ไข (รอบตีกลับ)</span>
                    <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-normal">
                      {request.reopenRounds.length}
                    </span>
                  </div>
                  {showHistoryList ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {showHistoryList && (
                  <div className="space-y-3">
                    {request.reopenRounds.map((round) => (
                      <div
                        key={round.requestConfirmationId}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                          <span className="text-sm font-semibold text-gray-700">
                            รอบที่ {round.roundNumber}
                          </span>
                          {round.reopenedAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(round.reopenedAt).toLocaleString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <div className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-white p-3 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Wrench size={16} className="text-gray-500" />
                            <span className="text-xs font-semibold text-gray-700">หลักฐานการแก้ไขของเจ้าหน้าที่</span>
                          </div>
                          <ProTechButton
                            onClick={() => handleOpenRoundStaffDetail(round)}
                            variant="detail"
                          >
                            ดูรายละเอียด
                          </ProTechButton>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-500" />
                            <span className="text-xs font-semibold text-gray-700">รายละเอียดการตีกลับของลูกค้า</span>
                          </div>
                          <ProTechButton
                            onClick={() => handleOpenRoundUserDetail(round)}
                            variant="detail"
                          >
                            ดูรายละเอียด
                          </ProTechButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {canReview ? (
              <div className="flex justify-end gap-3 py-4">
                <ProTechButton
                  onClick={() => setShowRejectWork(true)}
                  variant="outline"
                >
                  ตีกลับงาน
                </ProTechButton>

                <ProTechButton
                  onClick={() => setShowConfirmClose(true)}
                  variant="primary"
                >
                  ยืนยันงาน
                </ProTechButton>
              </div>
            ) : null}

            {canRate ? (
              <div className="flex justify-end py-4">
                <ProTechButton onClick={() => setShowRating(true)}>
                  ให้คะแนน
                </ProTechButton>
              </div>
            ) : null}


          </div>
        </section>
      </div>

      <ConfirmCloseModal
        open={showConfirmClose}
        title="ยืนยันการปิดงาน"
        description="เมื่อตรวจสอบแล้วพบว่าการแก้ไขเสร็จสมบูรณ์ กรุณายืนยันการปิดงาน"
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
        files={rejectFiles}
        loading={rejectSubmitting}
        onReasonChange={setRejectReason}
        onFilesChange={setRejectFiles}
        onClose={() => {
          setShowRejectWork(false);
          setRejectReason("");
          setRejectFiles([]);
        }}
        onConfirm={() => {
          void handleRejectWork();
        }}
      />

      <RequestAttachmentModal
        open={showRequestFiles}
        files={request.requestFiles ?? []}
        onClose={() => setShowRequestFiles(false)}
      />

      <RepairDetailModal
        open={showRepairDetail}
        data={repairDetail}
        onClose={() => setShowRepairDetail(false)}
        {...repairDetailModalProps}
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
