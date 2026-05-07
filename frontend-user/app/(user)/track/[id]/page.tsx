"use client";

import * as React from "react";

import { ClipboardPlus, FileWarning, Info, Wrench } from "lucide-react";
import StepProgress from "@/components/trackstep/StepProgress";

import { Props, RepairDetail, TrackingDetail } from "@/types/tracking";

import { MOCK_DATA } from "@/app/mock";
import RatingModal from "@/components/trackstep/popup/RatingModal";
import RepairDetailModal from "@/components/trackstep/popup/RepairDetailModal";
import ConfirmCloseModal from "@/components/trackstep/popup/ConfirmCloseModal";
import { ProTechButton } from "@/components/tables/protech-button";

async function getTrackingDetail(id: string): Promise<TrackingDetail> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_DATA[id] ?? MOCK_DATA.TH003);
    }, 300);
  });
}

export default function Page({ params }: Props) {
  const { id } = React.use(params);

  const [countdown, setCountdown] = React.useState("");

  const [ticket, setTicket] = React.useState<TrackingDetail | null>(null);

  const [loading, setLoading] = React.useState(true);

  const [showRepairDetail, setShowRepairDetail] = React.useState(false);

  const [showRating, setShowRating] = React.useState(false);

  const [repairDetail, setRepairDetail] = React.useState<RepairDetail | null>(
    null,
  );

  const [submitting, setSubmitting] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  React.useEffect(() => {
    if (ticket?.status !== "รอตรวจสอบโดยลูกค้า") {
      return;
    }

    const deadline = new Date().getTime() + 3 * 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();

      const diff = deadline - now;

      if (diff <= 0) {
        setCountdown("หมดเวลา");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${days} วัน ${hours} ชม. ${minutes} นาที ${seconds} วิ`);
    }, 1000);

    return () => clearInterval(timer);
  }, [ticket?.status]);

  React.useEffect(() => {
    async function loadData() {
      const result = await getTrackingDetail(id);

      setTicket(result);
      setLoading(false);
    }

    loadData();
  }, [id]);

  if (loading || !ticket) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  const activeStep =
    ticket.status === "รอตรวจสอบ"
      ? 2
      : ticket.status === "รอดำเนินการ"
        ? 3
        : ticket.status === "รอตรวจสอบโดยลูกค้า"
          ? 4
          : 4;

  async function fetchRepairDetail() {
    setRepairDetail({
      description: "Restart Service และตรวจสอบระบบเรียบร้อย",
      repairedAt: "20 เมษายน 2567 เวลา 10:46 น.",
      files: [
        {
          id: 1,
          name: "การดำเนินการ",
          type: "pdf",
          size: "928 KB",
          uploadedAt: "20 เมษายน 2567",
          url: "#",
        },
        {
          id: 2,
          name: "รูปหลักฐาน",
          type: "image",
          size: "928 KB",
          uploadedAt: "20 เมษายน 2567",
          url: "#",
        },
      ],
    });

    setShowRepairDetail(true);
  }

  function handleConfirmDone() {
    if (!ticket) return;

    setTicket({
      ...ticket,
      status: "เสร็จสิ้น",
      ratingStatus: "ยังไม่ประเมิน",
      repairStatus: "ลูกค้ายืนยันปิดงานแล้ว",
    });
  }

  async function submitRating(payload: { rating: number; comment: string }) {
    try {
      setSubmitting(true);

      console.log(payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTicket((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          ratingStatus: "ประเมินแล้ว",
          repairStatus: "ลูกค้าประเมินเรียบร้อย",
        };
      });

      setShowRating(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-10">
        <StepProgress
          steps={ticket.timeline}
          activeStep={activeStep}
          isCompleted={ticket.status === "เสร็จสิ้น"}
        />

        <section className="mt-16 w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#2F66C5] bg-white shadow-sm">
          <div className="flex items-center justify-between bg-[#A9CCFF] px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center border border-[#2F66C5] bg-[#DCE9FF]">
                <ClipboardPlus className="text-[#2F66C5]" />
              </div>

              <div>
                <p className="font-semibold text-[#20498F]">{ticket.status}</p>

                <p className="text-xs text-[#315FAF]">ระบบติดตามการดำเนินงาน</p>
              </div>
            </div>

            {ticket.status === "รอตรวจสอบโดยลูกค้า" && (
              <p className="text-[15px] font-medium text-[#315FAF]">
                เหลือ {countdown}
              </p>
            )}
          </div>

          <div className="px-8 py-5">
            <div className="flex items-center justify-between border-b py-4">
              <div className="flex items-center gap-3">
                <FileWarning size={22} className="text-gray-500" />

                <p className="text-[15px]">ปัญหาที่พบ</p>
              </div>

              <p className="text-[15px] text-gray-700">{ticket.problem}</p>
            </div>

            <div className="flex items-center justify-between border-b py-4">
              <div className="flex items-center gap-3">
                <Info size={22} className="text-gray-500" />

                <p className="text-[15px]">สถานะการดำเนินงาน</p>
              </div>

              <p className="text-[15px] text-gray-700">{ticket.repairStatus}</p>
            </div>

            <div className="flex items-center justify-between border-b py-4">
              <div className="flex items-center gap-3">
                <Wrench size={22} className="text-gray-500" />

                <p className="text-[15px]">ดำเนินการโดย</p>
              </div>

              <p className="text-[15px] text-gray-700">{ticket.repairedBy}</p>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Info size={22} className="text-gray-500" />

                <p className="text-[15px]">วิธีการแก้ไข</p>
              </div>

              <div className="flex items-center gap-3">
                <ProTechButton
                  onClick={fetchRepairDetail}
                  variant="detail"
                >
                  รายละเอียด
                </ProTechButton>

                {ticket.status === "รอตรวจสอบโดยลูกค้า" && (
                  <ProTechButton
                    onClick={() => setShowConfirm(true)}
                    variant="primary"
                  >
                    ยืนยัน
                  </ProTechButton>
                )}

                {ticket.status === "เสร็จสิ้น" &&
                  ticket.ratingStatus !== "ประเมินแล้ว" && (
                    <ProTechButton
                      onClick={() => setShowRating(true)}

                    >
                      ประเมิน
                    </ProTechButton>
                  )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <ConfirmCloseModal
        open={showConfirm}
        title="ยืนยันปิดงาน"
        description="คุณต้องการยืนยันปิดงานใช่หรือไม่"
        subDescription="หลังจากยืนยันแล้ว ระบบจะถือว่างานเสร็จสมบูรณ์"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          handleConfirmDone();
          setShowConfirm(false);
        }}
      />
      <RepairDetailModal
        open={showRepairDetail}
        data={repairDetail}
        onClose={() => setShowRepairDetail(false)}
      />

      <RatingModal
        open={showRating}
        loading={submitting}
        onClose={() => setShowRating(false)}
        onSubmit={submitRating}
      />
    </>
  );
}
