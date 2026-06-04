"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, TriangleAlert, CheckCircle2 } from "lucide-react";
import { useStaffList } from "@/hooks/use-staff-list";
import { useTicketsByStaff } from "@/hooks/use-tickets-by-staff";
import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import { useCreateTicket } from "@/hooks/assign/use-create-ticket";
import { useComplaintDetail } from "@/hooks/use-complaint-detail";

const STAFF_LIMIT = 5;
const TICKET_LIMIT = 5;

type SelectedStaff = {
  id: number;
  fullName: string;
  activeTaskCount: number;
};

export default function AssignWorkPage() {
  const router = useRouter();
  const params = useParams();
  const { data: requestData, resolvedRequestId } = useComplaintDetail(params.id);
  const requestId = Number(
    resolvedRequestId ?? (Array.isArray(params.id) ? params.id[0] : params.id),
  );
  const requestDueAt = requestData?.dueAt
    ? requestData.dueAt.slice(0, 10)
    : undefined;
  const localToday = new Date().toLocaleDateString("en-CA");

  const { staffs, loading, refetch: refetchStaffs } = useStaffList();
  const [search, setSearch] = useState("");
  const [staffPage, setStaffPage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<SelectedStaff | null>(null);
  const [modalStaff, setModalStaff] = useState<SelectedStaff | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showCreateSuccess, setShowCreateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { tickets, refetch } = useTicketsByStaff(selectedStaff?.id ?? null);
  const { createTicket, loading: submitting } = useCreateTicket(() => {
    setModalStaff(null);
    setTitle("");
    setDetail("");
    setDueDate("");
    setError(null);
    setShowCreateSuccess(true);
    refetch();
    refetchStaffs();
  });

  const filtered = staffs.filter(
    (staff) => search === "" || staff.fullName.includes(search),
  );

  const totalStaffPages = Math.max(1, Math.ceil(filtered.length / STAFF_LIMIT));
  const pagedStaffs = filtered.slice(
    (staffPage - 1) * STAFF_LIMIT,
    staffPage * STAFF_LIMIT,
  );

  const totalTicketPages = Math.max(1, Math.ceil(tickets.length / TICKET_LIMIT));
  const pagedTickets = tickets.slice(
    (ticketPage - 1) * TICKET_LIMIT,
    ticketPage * TICKET_LIMIT,
  );

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 bg-[#F0F4FA] p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">การจัดการงาน</h1>
          <p className="text-[14px] text-gray-500">งานที่ต้องมอบหมาย</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full bg-[#366DBD] px-6 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
        >
          ย้อนกลับ
        </button>
      </div>

      <div className="flex min-h-[700px] gap-6">
        <div className="flex flex-1 shrink-0 flex-col gap-4 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
          {loading ? (
            <div className="w-full animate-pulse space-y-3">
              <div className="flex gap-2">
                <div className="h-9 flex-1 rounded bg-gray-200" />
                <div className="h-9 w-20 rounded bg-gray-200" />
              </div>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#000000] p-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                  </div>
                  <div className="h-8 w-24 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setStaffPage(1);
                  }}
                  placeholder="ค้นหาเจ้าหน้าที่..."
                  className="h-9 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-[14px] outline-none focus:border-[#366DBD]"
                />
                <button
                  type="button"
                  className="h-9 rounded-lg bg-[#366DBD] px-4 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
                >
                  ค้นหา
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {pagedStaffs.map((staff) => (
                  <div
                    key={staff.id}
                    onClick={() => {
                      setSelectedStaff({
                        id: staff.id,
                        fullName: staff.fullName,
                        activeTaskCount: staff.activeTaskCount,
                      });
                      setTicketPage(1);
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                      selectedStaff?.id === staff.id
                        ? "border-[#366DBD] bg-[#EEF4FF]"
                        : "border-[#000000] bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[16px] font-semibold text-gray-900">
                        {staff.fullName}
                      </p>
                      <p className="text-[14px] text-gray-500">
                        รับผิดชอบอยู่ {staff.activeTaskCount} งาน
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalStaff({
                          id: staff.id,
                          fullName: staff.fullName,
                          activeTaskCount: staff.activeTaskCount,
                        });
                      }}
                      className="rounded-lg bg-[#366DBD] px-4 py-1.5 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
                    >
                      มอบหมายงาน
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-end gap-1 text-sm text-gray-600">
                <button
                  onClick={() => setStaffPage((page) => Math.max(1, page - 1))}
                  disabled={staffPage === 1}
                  className="flex h-8 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                {Array.from({ length: totalStaffPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setStaffPage(page)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm ${
                        staffPage === page
                          ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]"
                          : "border-transparent text-gray-600 hover:border-[#7FA7E8]"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                {totalStaffPages > 3 && (
                  <span className="px-1 text-gray-400">...</span>
                )}
                <button
                  onClick={() =>
                    setStaffPage((page) => Math.min(totalStaffPages, page + 1))
                  }
                  disabled={staffPage === totalStaffPages}
                  className="flex h-8 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
          {!selectedStaff ? (
            <div className="flex flex-1 items-center justify-center text-[14px] text-gray-400">
              เลือกเจ้าหน้าที่เพื่อดูงานที่กำลังดำเนินการ
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <p className="text-[16px] font-bold text-gray-900">
                  งานที่กำลังดำเนินการ
                </p>
                <div className="text-right">
                  <p className="text-[16px] font-semibold text-gray-800">
                    {selectedStaff.fullName}
                  </p>
                  <p className="text-[14px] text-gray-500">
                    รับผิดชอบอยู่ {selectedStaff.activeTaskCount} งาน
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {pagedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-start justify-between rounded-xl border border-[#000000] p-4"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-[16px] font-semibold text-gray-900">
                        {ticket.title}
                      </p>
                      <p className="line-clamp-2 text-[14px] text-gray-500">
                        {ticket.detail}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-[14px] text-[#D9534F]">
                        {ticket.requestType === "issue"
                          ? "ประเด็นปัญหา"
                          : ticket.requestType === "complaint"
                            ? "ข้อร้องเรียน"
                            : ticket.requestType}
                      </span>
                      {ticket.dueAt && (
                        <p className="mt-1 text-[12px] text-gray-400">
                          กำหนดส่ง {formatDate(ticket.dueAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-end gap-1 text-sm text-gray-600">
                <button
                  onClick={() => setTicketPage((page) => Math.max(1, page - 1))}
                  disabled={ticketPage === 1}
                  className="flex h-8 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                {Array.from(
                  { length: totalTicketPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setTicketPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm ${
                      ticketPage === page
                        ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]"
                        : "border-transparent text-gray-600 hover:border-[#7FA7E8]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {totalTicketPages > 3 && (
                  <span className="px-1 text-gray-400">...</span>
                )}
                <button
                  onClick={() =>
                    setTicketPage((page) => Math.min(totalTicketPages, page + 1))
                  }
                  disabled={ticketPage === totalTicketPages}
                  className="flex h-8 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <AdminModalShell
        open={modalStaff !== null}
        onOpenChange={(open) => {
          if (!open) {
            setModalStaff(null);
            setTitle("");
            setDetail("");
            setDueDate("");
            setError(null);
          }
        }}
        title={`มอบหมายงาน - ${modalStaff?.fullName ?? ""}`}
        widthClassName="max-w-[480px]"
      >
        <div className="flex flex-col gap-4">
          {error && (
            <p className="rounded-lg border border-[#FFB4C0] bg-[#FFF5F7] px-3 py-2 text-xs text-[#D1435B]">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-gray-700">
              ชื่องาน
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่องาน..."
              className="h-9 rounded-lg border border-gray-300 px-3 text-[14px] outline-none focus:border-[#366DBD]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-gray-700">
              รายละเอียด
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="ระบุรายละเอียด..."
              rows={4}
              className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-[#366DBD]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-gray-700">
              กำหนดส่ง
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={localToday}
              max={requestDueAt}
              className="h-9 rounded-lg border border-gray-300 px-3 text-[14px] outline-none focus:border-[#366DBD]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setModalStaff(null);
                setError(null);
              }}
              className="rounded-lg border border-gray-300 px-5 py-2 text-[14px] text-gray-600 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={submitting || !title.trim() || !detail.trim()}
              onClick={() => {
                if (!modalStaff) return;
                if (!dueDate) {
                  setError("กรุณาเลือกกำหนดส่งงาน");
                  return;
                }
                if (requestDueAt && dueDate > requestDueAt) {
                  setError(`กำหนดส่งงานย่อยต้องไม่เกินกำหนดส่งเรื่องหลัก (${formatDate(requestDueAt)})`);
                  return;
                }
                setError(null);
                setShowCreateConfirm(true);
              }}
              className="rounded-lg bg-[#366DBD] px-5 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3] disabled:opacity-50"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </AdminModalShell>

      {/* Create confirmation dialog */}
      <AdminModalShell
        open={showCreateConfirm}
        onOpenChange={setShowCreateConfirm}
        title="ยืนยันการมอบหมายงาน"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4E5] text-[#F59E0B]">
              <TriangleAlert size={28} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            คุณต้องการมอบหมายงานย่อยนี้ให้ {modalStaff?.fullName} ใช่หรือไม่?
          </p>

          <div className="flex justify-center gap-3 pt-1">
            <ProTechButton
              variant="delete"
              className="h-10 min-w-[120px]"
              onClick={() => setShowCreateConfirm(false)}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-10 min-w-[120px]"
              onClick={() => {
                setShowCreateConfirm(false);
                if (modalStaff) {
                  createTicket({
                    requestId,
                    assignedStaffId: modalStaff.id,
                    assignedBy: null,
                    dueAt: dueDate,
                    title,
                    description: detail,
                    status: "assigned",
                  });
                }
              }}
            >
              ยืนยัน
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>

      {/* Create success dialog */}
      <AdminModalShell
        open={showCreateSuccess}
        onOpenChange={setShowCreateSuccess}
        title="มอบหมายงานสำเร็จ"
        widthClassName="max-w-[460px]"
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8EE] text-[#1F9D55]">
              <CheckCircle2 size={34} />
            </div>
          </div>

          <p className="text-[15px] text-[#6B7280]">
            มอบหมายงานย่อยสำเร็จเรียบร้อยแล้ว
          </p>

          <div className="flex justify-center pt-1">
            <ProTechButton
              variant="primary"
              className="h-10 min-w-[120px]"
              onClick={() => setShowCreateSuccess(false)}
            >
              ตกลง
            </ProTechButton>
          </div>
        </div>
      </AdminModalShell>
    </div>
  );
}
