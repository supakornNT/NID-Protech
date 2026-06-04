"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStaffList } from "@/hooks/use-staff-list";
import { useTicketsByStaff } from "@/hooks/use-tickets-by-staff";
import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { useCreateTicket } from "@/hooks/assign/use-create-ticket";
import { useComplaintDetail } from "@/hooks/use-complaint-detail";

const STAFF_LIMIT = 5;
const TICKET_LIMIT = 5;

export default function AssignWorkPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = Number(params.id);
  const { data: requestData } = useComplaintDetail(params.id);
  const requestDueAt = requestData?.dueAt ? requestData.dueAt.slice(0, 10) : undefined;
  const { staffs, loading, refetch: refetchStaffs } = useStaffList();
  const [search, setSearch] = useState("");
  const [staffPage, setStaffPage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<{
    id: number;
    fullName: string;
    teamId: number | null;
    activeTaskCount: number;
  } | null>(null);
  const { tickets, refetch } = useTicketsByStaff(selectedStaff?.id ?? null);
  const [modalStaff, setModalStaff] = useState<{
    id: number;
    fullName: string;
    teamId: number | null;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const { createTicket, loading: submitting } = useCreateTicket(() => {
    setModalStaff(null);
    setTitle("");
    setDetail("");
    setDueDate("");
    refetch();
    refetchStaffs();
  });

  const filtered = staffs.filter(
    (s) =>
      search === "" ||
      s.fullName.includes(search) ||
      (s.teamName ?? "").includes(search),
  );

  const totalStaffPages = Math.max(1, Math.ceil(filtered.length / STAFF_LIMIT));
  const pagedStaffs = filtered.slice(
    (staffPage - 1) * STAFF_LIMIT,
    staffPage * STAFF_LIMIT,
  );

  const totalTicketPages = Math.max(
    1,
    Math.ceil(tickets.length / TICKET_LIMIT),
  );
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
        {/* Left panel — staff list */}
        <div className="flex flex-1 shrink-0 flex-col gap-4 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse w-full">
              <div className="flex gap-2">
                <div className="h-9 flex-1 rounded bg-gray-200" />
                <div className="h-9 w-20 rounded bg-gray-200" />
              </div>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center rounded-xl border border-[#000000] p-4 gap-4">
                  <div className="space-y-2 flex-1">
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
              placeholder="ค้นหา..."
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
                  setSelectedStaff(staff);
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
                    กลุ่ม : {staff.teamName ?? "—"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-[14px] text-gray-500">
                    ดำเนินการ{" "}
                    <span className="font-bold text-gray-800">
                      {staff.activeTaskCount}
                    </span>{" "}
                    งาน
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalStaff(staff);
                    }}
                    className="rounded-lg bg-[#366DBD] px-4 py-1.5 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
                  >
                    มอบหมายงาน
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-1 text-sm text-gray-600 mt-auto">
            <button
              onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
              disabled={staffPage === 1}
              className="flex h-8 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            {Array.from({ length: totalStaffPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setStaffPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm ${staffPage === p ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]" : "border-transparent text-gray-600 hover:border-[#7FA7E8]"}`}
                >
                  {p}
                </button>
              ),
            )}
            {totalStaffPages > 3 && (
              <span className="px-1 text-gray-400">...</span>
            )}
            <button
              onClick={() =>
                setStaffPage((p) => Math.min(totalStaffPages, p + 1))
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

        {/* Right panel */}
        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-[#000000] bg-white p-6 shadow-sm">
          {!selectedStaff ? (
            <div className="flex flex-1 items-center justify-center text-[14px] text-gray-400">
              งานที่ดำเนินการอยู่
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <p className="text-[16px] font-bold text-gray-900">
                  งานที่ดำเนินการอยู่
                </p>
                <div className="text-right">
                  <p className="text-[16px] font-semibold text-gray-800">
                    {selectedStaff.fullName}
                  </p>
                  <p className="text-[14px] text-gray-500">
                    ดำเนินการ {selectedStaff.activeTaskCount} งาน
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {pagedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-start justify-between rounded-xl border border-[#000000] p-4"
                  >
                    <div className="flex flex-col gap-1 flex-1 min-w-0 pr-4">
                      <p className="text-[16px] font-semibold text-gray-900">
                        {ticket.title}
                      </p>
                      <p className="text-[14px] text-gray-500 line-clamp-2">
                        {ticket.detail}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="shrink-0 rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-3 py-0.5 text-[14px] text-[#D9534F]">
                        {ticket.requestType === "issue"
                          ? "ปัญหา"
                          : ticket.requestType === "complaint"
                            ? "ร้องเรียน"
                            : ticket.requestType}
                      </span>
                      {ticket.dueAt && (
                        <p className="text-[12px] text-gray-400">
                          กำหนดส่ง {formatDate(ticket.dueAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-1 text-sm text-gray-600 mt-auto">
                <button
                  onClick={() => setTicketPage((p) => Math.max(1, p - 1))}
                  disabled={ticketPage === 1}
                  className="flex h-8 items-center gap-1 rounded-md px-2 text-gray-500 hover:text-[#366DBD] disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                {Array.from({ length: totalTicketPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setTicketPage(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm ${ticketPage === p ? "border-[#7FA7E8] bg-[#EEF4FF] text-[#3A6FCF]" : "border-transparent text-gray-600 hover:border-[#7FA7E8]"}`}
                    >
                      {p}
                    </button>
                  ),
                )}
                {totalTicketPages > 3 && (
                  <span className="px-1 text-gray-400">...</span>
                )}
                <button
                  onClick={() =>
                    setTicketPage((p) => Math.min(totalTicketPages, p + 1))
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
          }
        }}
        title={`มอบหมายงาน — ${modalStaff?.fullName ?? ""}`}
        widthClassName="max-w-[480px]"
      >
        <div className="flex flex-col gap-4">
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
              min={new Date().toISOString().split("T")[0]}
              max={requestDueAt}
              className="h-9 rounded-lg border border-gray-300 px-3 text-[14px] outline-none focus:border-[#366DBD]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalStaff(null)}
              className="rounded-lg border border-gray-300 px-5 py-2 text-[14px] text-gray-600 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                if (!modalStaff) return;
                createTicket({
                  requestId,
                  assignedTeamId: modalStaff.teamId ?? 0,
                  assignedStaffId: modalStaff.id,
                  assignedBy: null,
                  dueAt: dueDate,
                  title,
                  description: detail,
                  status: "in_progress",
                });
              }}
              className="rounded-lg bg-[#366DBD] px-5 py-2 text-[14px] font-semibold text-white hover:bg-[#2d5da3] disabled:opacity-50"
            >
              {submitting ? "กำลังบันทึก..." : "ยืนยัน"}
            </button>
          </div>
        </div>
      </AdminModalShell>
    </div>
  );
}
