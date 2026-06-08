"use client";

import { useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { useStaffSession } from "@/contexts/staff-session-context";

import { AdminTablePage } from "@/components/admin/admin-table-page";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAcceptComplaint } from "@/hooks/use-accept-complaint";
import { useRejectComplaint } from "@/hooks/use-reject-complaint";
import { useRequests } from "@/hooks/use-requests";
import type { Column } from "@/types/table";

const LIMIT = 10;

type IssueRow = {
  id: number;
  requestNo: string;
  systemName: string;
  requestTypeName: string;
  createdAt: string;
  status: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH");
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CategoryBadge({ value }: { value: string }) {
  if (!value) return <span className="text-gray-300">-</span>;

  return (
    <span className="inline-flex items-center rounded-full border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-[12px] font-medium text-[#D9534F]">
      ปัญหา
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

export default function IssuesPage() {
  const { staff } = useStaffSession();
  const staffId = typeof staff?.id === "number" ? staff.id : Number(staff?.id);

  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  const { rows, setRows, loading, pagination } = useRequests({
    type: "issue",
    page,
    limit: LIMIT,
    search: appliedSearch,
  });

  const {
    rejectId,
    rejectReason,
    submitting: rejectSubmitting,
    setRejectReason,
    openReject,
    handleReject,
    closeReject,
  } = useRejectComplaint(
    (id) => setRows((prev) => prev.filter((row) => row.id !== id)),
    staffId,
  );

  const {
    acceptId,
    submitting: acceptSubmitting,
    openAccept,
    handleAccept,
    closeAccept,
  } = useAcceptComplaint(
    (id) => setRows((prev) => prev.filter((row) => row.id !== id)),
    staffId,
  );

  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const safePage = Math.min(page, totalPages);

  function resetToFirstPage() {
    setPage(1);
  }

  async function submitReject() {
    const trimmedReason = rejectReason.trim();

    if (!trimmedReason) {
      setRejectError("กรุณาระบุเหตุผลการปฏิเสธ");
      return;
    }

    setRejectError(null);
    await handleReject();
  }

  const columns: Column<IssueRow>[] = [
    { key: "requestNo", title: "รหัส", className: "w-24" },
    { key: "systemName", title: "ระบบ" },
    {
      key: "createdAt",
      title: "วันที่",
      className: "w-28",
      render: (value) => formatDate(String(value)),
    },
    {
      key: "createdAt",
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
        <Link href={`/screening/issues/${value}`}>
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
      render: (_, row) => (
        <StatusCell
          onAccept={() => openAccept(row.id)}
          onReject={() => {
            setRejectError(null);
            openReject(row.id);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <Dialog
        open={rejectId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectError(null);
            closeReject();
          }
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>ยืนยันการปฏิเสธ</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <p className="text-[14px] text-gray-600">
              กรุณาระบุเหตุผลการปฏิเสธก่อนบันทึก
            </p>

            <textarea
              value={rejectReason}
              onChange={(event) => {
                if (rejectError) setRejectError(null);
                setRejectReason(event.target.value);
              }}
              placeholder="ระบุเหตุผลการปฏิเสธ..."
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-[14px] text-gray-700 outline-none focus:border-[#2F66C5] focus:ring-2 focus:ring-[#DCE9FF]"
            />

            {rejectError ? (
              <p className="text-[13px] font-medium text-[#D1435B]">
                {rejectError}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2">
            <ProTechButton
              variant="delete"
              className="h-10 min-w-0 flex-1 text-[14px] sm:min-w-24 sm:flex-none"
              onClick={() => {
                setRejectError(null);
                closeReject();
              }}
            >
              ยกเลิก
            </ProTechButton>

            <ProTechButton
              variant="primary"
              className="h-10 min-w-0 flex-1 text-[14px] sm:min-w-24 sm:flex-none"
              onClick={() => {
                void submitReject();
              }}
              disabled={rejectSubmitting || !rejectReason.trim()}
            >
              {rejectSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
            </ProTechButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={acceptId !== null}
        onOpenChange={(open) => {
          if (!open) closeAccept();
        }}
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

          <DialogFooter className="gap-2">
            <ProTechButton
              variant="delete"
              className="h-10 min-w-0 flex-1 text-[14px] sm:min-w-24 sm:flex-none"
              onClick={closeAccept}
            >
              ยกเลิก
            </ProTechButton>

            <ProTechButton
              variant="primary"
              className="h-10 min-w-0 flex-1 text-[14px] sm:min-w-24 sm:flex-none"
              onClick={() => {
                void handleAccept();
              }}
              disabled={acceptSubmitting}
            >
              {acceptSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
            </ProTechButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
        <AdminTablePage
          title="รับเรื่องและคัดกรอง"
          subtitle="ประเด็นปัญหา"
          columns={columns}
          data={rows}
          searchValue={searchValue}
          searchInputProps={{
            type: "search",
            inputMode: "search",
            autoComplete: "off",
            maxLength: 120,
            title: "ค้นหาด้วยชื่อระบบ",
          }}
          searchPlaceholder="ค้นหาระบบ..."
          onSearchClick={(value) => {
            setSearchValue(value);
            setAppliedSearch(value);
            resetToFirstPage();
          }}
          page={safePage}
          totalPages={totalPages}
          totalItems={pagination?.total ?? rows.length}
          onPageChange={setPage}
          disableClientFiltering
          disableClientPagination
          showCreate={false}
          showDelete={false}
          loading={loading}
          renderToolbar={({ searchBar }) => (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  {searchBar}
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </>
  );
}