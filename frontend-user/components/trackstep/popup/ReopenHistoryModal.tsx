"use client";

import { FileText, History, Wrench, X } from "lucide-react";
import { ReopenRound, RepairDetail, RepairFile } from "@/types/tracking";
import { ProTechButton } from "@/components/tables/protech-button";
import RepairDetailModal from "@/components/trackstep/popup/RepairDetailModal";
import * as React from "react";

type ReopenHistoryModalProps = {
  open: boolean;
  rounds: ReopenRound[];
  onClose: () => void;
};

export default function ReopenHistoryModal({
  open,
  rounds,
  onClose,
}: ReopenHistoryModalProps) {
  const [repairDetail, setRepairDetail] = React.useState<RepairDetail | null>(null);
  const [repairDetailProps, setRepairDetailProps] = React.useState<{
    title?: string;
    subtitle?: string;
    descriptionLabel?: string;
    dateLabel?: string;
    filesLabel?: string;
  }>({});
  const [showRepairDetail, setShowRepairDetail] = React.useState(false);

  if (!open) return null;

  function handleOpenStaff(round: ReopenRound) {
    setRepairDetail({
      description: round.staffSummary || "-",
      repairedAt: round.reopenedAt || "-",
      files: round.staffFiles,
    });
    setRepairDetailProps({
      title: `หลักฐานการแก้ไขของเจ้าหน้าที่ (รอบที่ ${round.roundNumber})`,
      subtitle: "ขั้นตอนและหลักฐานการแก้ไขในรอบนี้",
      descriptionLabel: "รายละเอียดการแก้ไข",
      dateLabel: "วันที่ดำเนินการ",
      filesLabel: "ไฟล์หลักฐานการแก้ไข",
    });
    setShowRepairDetail(true);
  }

  function handleOpenCustomer(round: ReopenRound) {
    setRepairDetail({
      description: round.comment || "-",
      repairedAt: round.reopenedAt || "-",
      files: round.files,
    });
    setRepairDetailProps({
      title: `รายละเอียดการตีกลับของลูกค้า (รอบที่ ${round.roundNumber})`,
      subtitle: "รายละเอียดและหลักฐานการส่งแก้ไขโดยลูกค้า",
      descriptionLabel: "เหตุผลที่ส่งแก้ไข",
      dateLabel: "วันที่ส่งแก้ไข",
      filesLabel: "ไฟล์แนบหลักฐานตีกลับ",
    });
    setShowRepairDetail(true);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 shadow-2xl">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <History size={18} className="text-[#2F66C5]" />
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  ประวัติการส่งแก้ไข
                </h2>
                <p className="text-xs text-gray-500">รอบตีกลับทั้งหมด {rounds.length} รอบ</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#B45A5A] text-white transition hover:bg-[#9B4545]"
            >
              <X size={14} />
            </button>
          </div>

          {/* Round list */}
          <div className="space-y-3">
            {rounds.map((round) => (
              <div
                key={round.requestConfirmationId}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm"
              >
                {/* Round header */}
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

                {/* Staff resolution */}
                <div className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-white p-3 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Wrench size={15} className="text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      หลักฐานการแก้ไขของเจ้าหน้าที่
                    </span>
                  </div>
                  <ProTechButton
                    onClick={() => handleOpenStaff(round)}
                    variant="detail"
                  >
                    ดูรายละเอียด
                  </ProTechButton>
                </div>

                {/* Customer reopen */}
                <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      รายละเอียดการตีกลับของลูกค้า
                    </span>
                  </div>
                  <ProTechButton
                    onClick={() => handleOpenCustomer(round)}
                    variant="detail"
                  >
                    ดูรายละเอียด
                  </ProTechButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nested repair detail modal */}
      <RepairDetailModal
        open={showRepairDetail}
        data={repairDetail}
        onClose={() => setShowRepairDetail(false)}
        {...repairDetailProps}
      />
    </>
  );
}
