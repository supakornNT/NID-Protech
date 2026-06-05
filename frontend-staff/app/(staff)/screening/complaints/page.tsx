"use client";

import { useState } from "react";
import { useStaffSession } from "@/contexts/staff-session-context";
import { useRequests } from "@/hooks/use-requests";
import { useRejectComplaint } from "@/hooks/use-reject-complaint";
import { useAcceptComplaint } from "@/hooks/use-accept-complaint";
import Link from "next/link";
import { Info, Search } from "lucide-react";
import type { Column } from "@/types/table";
import { ProTechTable } from "@/components/tables/protech-table";
import { ComplaintRow } from "@/types/screening-type/complaint";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH");
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

function CategoryBadge({ value }: { value: string }) {
  if (!value) return <span className="text-gray-300">—</span>;
  return (
    <span className="inline-flex items-center rounded-full border border-[#E8D48A] bg-[#FFFBE6] px-3 py-0.5 text-[12px] font-medium text-[#c7920b]">
      ข้อร้องเรียน
    </span>
  );
}

function StatusCell({
  onAccept,
  onReject,
}: {
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={onReject}
        className="rounded-lg border border-[#FF6B81] px-3 py-1 text-[12px] font-medium text-[#FF5D76] transition hover:bg-red-50"
      >
        ปฏิเสธ
      </button>
      <button
        type="button"
        onClick={onAccept}
        className="rounded-lg border border-[#5AC56F] px-3 py-1 text-[12px] font-medium text-[#49A55B] transition hover:bg-green-50"
      >
        ยอมรับ
      </button>
    </div>
  );
}

export default function ComplaintsPage() {
  const { staff } = useStaffSession();
  const staffId = typeof staff?.id === "number" ? staff.id : Number(staff?.id);
  const { rows, setRows, loading } = useRequests("complaint");
  const { rejectId, rejectReason, submitting: rejectSubmitting, setRejectReason, openReject, handleReject, closeReject } =
    useRejectComplaint((id) =>
      setRows((prev) => prev.filter((r) => r.id !== id)),
    );
  const { acceptId, acceptReason, setAcceptReason, openAccept, handleAccept, closeAccept } =
    useAcceptComplaint((id) => setRows((prev) => prev.filter((r) => r.id !== id)), staffId);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = rows.filter(
    (r) =>
      search === "" ||
      r.systemName.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: Column<ComplaintRow>[] = [
    { key: "requestNo", title: "รหัส", className: "w-24" },
    { key: "systemName", title: "ระบบ" },
    {
      key: "createdAt",
      title: "วันที่",
      className: "w-28",
      render: (value) => formatDate(String(value)),
    },
    {
      key: "createdAt_time",
      title: "เวลา",
      className: "w-20",
      render: (value) => formatTime(String(value)),
    },
    {
      key: "requestTypeName",
      title: "ประเภท",
      className: "w-32",
      render: (value) => <CategoryBadge value={String(value ?? "")} />,
    },
    {
      key: "id",
      title: "รายละเอียด",
      className: "w-24",
      render: (value) => (
        <Link href={`/screening/complaints/${value}`}>
          <button
            type="button"
            className="rounded-full p-1.5 text-[#366DBD] transition hover:bg-blue-50"
          >
            <Info size={18} />
          </button>
        </Link>
      ),
    },
    {
      key: "status",
      title: "สถานะ",
      className: "w-44",
      render: (_, _row) => (
        <StatusCell
          onAccept={() => openAccept(_row.id)}
          onReject={() => openReject(_row.id)}
        />
      ),
    },
  ];

  return (
    <>
      <Dialog
        open={rejectId !== null}
        onOpenChange={(open) => {
          if (!open) closeReject();
        }}
      >
        <DialogContent className="border border-red-300 rounded-2xl">
          <DialogHeader>
            <DialogTitle>ยืนยันการปฏิเสธ</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <p className="text-[14px] text-gray-600">
              คุณต้องการปฏิเสธคำร้องนี้ใช่หรือไม่?
            </p>
            {/* <label className="text-[13px] font-medium text-gray-700">เหตุผล</label> */}
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="ระบุเหตุผลการปฏิเสธ..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-[14px] text-gray-700 outline-none focus:ring-red-100"
            />
          </div>
          <DialogFooter>
            <button
              onClick={closeReject}
              className="flex-1 min-w-0 sm:flex-none rounded-lg border border-gray-200 px-4 py-2 text-[14px] hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleReject}
              disabled={rejectSubmitting || !rejectReason.trim()}
              className="flex-1 min-w-0 sm:flex-none rounded-lg bg-red-500 px-4 py-2 text-[14px] font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rejectSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={acceptId !== null}
        onOpenChange={(open) => { if (!open) closeAccept(); }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>ยืนยันการยอมรับ</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <p className="text-[14px] text-gray-600">
              คุณต้องการยอมรับคำร้องนี้ใช่หรือไม่?
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={closeAccept}
              className="flex-1 min-w-0 sm:flex-none rounded-lg border border-gray-200 px-4 py-2 text-[14px] hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 min-w-0 sm:flex-none rounded-lg bg-green-500 px-4 py-2 text-[14px] font-semibold text-white hover:bg-green-600"
            >
              ยืนยัน
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 flex-col gap-5 bg-white px-4 sm:px-6 lg:px-10 py-8">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">
            รับเรื่องและคัดกรอง
          </h1>
          <p className="mt-1 text-[14px] text-gray-400">ข้อร้องเรียน</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหาระบบ..."
                className="h-9 w-full sm:w-56 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[14px] outline-none focus:border-[#366DBD] focus:ring-2 focus:ring-[#366DBD]/10"
              />
            </div>
            <button
              type="button"
              onClick={() => setPage(1)}
              className="h-9 shrink-0 rounded-lg bg-[#366DBD] px-5 text-[14px] font-semibold text-white transition hover:bg-[#2d5da3]"
            >
              ค้นหา
            </button>
          </div>
        </div>

        <ProTechTable
          columns={columns}
          data={filtered}
          limit={10}
          page={page}
          totalPages={Math.max(1, Math.ceil(filtered.length / 10))}
          totalItems={filtered.length}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
    </>
  );
}
