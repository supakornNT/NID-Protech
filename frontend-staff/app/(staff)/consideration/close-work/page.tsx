"use client";

import { useState } from "react";
import { Info, ChevronDown, FileText, ImageIcon } from "lucide-react";
import { useCloseWork, type PendingCloseItem } from "@/hooks/use-close-work";
import { ProTechTable } from "@/components/tables/protech-table";
import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Column } from "@/types/table";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];

const TYPE_LABEL: Record<string, string> = {
  issue: "ปัญหา",
  complaint: "ร้องเรียน",
  service: "บริการ",
};

type Attachment = {
  id: number;
  originalName: string;
  savedName: string;
  fileExt: string;
};

function formatTime(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function CloseWorkPage() {
  const { pending, history, loading, error, approveTicket, rejectTicket } =
    useCloseWork();

  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<PendingCloseItem | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachLoading, setAttachLoading] = useState(false);
  const [note, setNote] = useState("");
  const [actioning, setActioning] = useState(false);

  const LIMIT = 10;

  const source = tab === "pending" ? pending : history;

  const filtered = source.filter((item) => {
    const typeLabel = TYPE_LABEL[item.requestType] ?? item.requestType;
    const matchSearch =
      search === "" ||
      item.title.includes(search) ||
      item.customerName.includes(search) ||
      item.assignedStaffName.includes(search) ||
      (item.systemName ?? "").includes(search);
    const matchType = typeFilter === "ทั้งหมด" || typeLabel === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));

  const typeOptions = [
    "ทั้งหมด",
    ...Array.from(
      new Set(source.map((i) => TYPE_LABEL[i.requestType] ?? i.requestType)),
    ),
  ];

  async function openDetail(item: PendingCloseItem) {
    setSelected(item);
    setNote("");
    setAttachments([]);
    setAttachLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/tickets/${item.id}/attachments`,
      );
      if (res.ok) {
        const data: Attachment[] = await res.json();
        setAttachments(Array.isArray(data) ? data : []);
      }
    } finally {
      setAttachLoading(false);
    }
  }

  async function handleApprove() {
    if (!selected) return;
    setActioning(true);
    try {
      await approveTicket(selected.id);
      setSelected(null);
    } finally {
      setActioning(false);
    }
  }

  async function handleReject() {
    if (!selected || !note.trim()) return;
    setActioning(true);
    try {
      await rejectTicket(selected.id, note);
      setSelected(null);
      setNote("");
    } finally {
      setActioning(false);
    }
  }

  const columns: Column<PendingCloseItem>[] = [
    {
      key: "systemName",
      title: "ระบบ",
      render: (_, row) => row.systemName ?? "—",
    },
    { key: "title", title: "หน้าที่" },
    {
      key: "requestType",
      title: "ประเภท",
      render: (_, row) => (
        <span className="inline-flex rounded-md border border-[#F4A0A0] bg-[#FFF0F0] px-2.5 py-0.5 text-[12px] text-[#D9534F]">
          {row.problemName}
        </span>
      ),
    },
    {
      key: "resolvedAt",
      title: "ส่งเวลา",
      render: (_, row) => formatTime(row.resolvedAt),
    },
    { key: "assignedStaffName", title: "รับผิดชอบโดย" },
    {
      key: "id",
      title: "รายละเอียด",
      render: (_, row) => (
        <button
          type="button"
          onClick={() => openDetail(row)}
          className="flex w-full items-center justify-center text-[#366DBD] hover:text-[#2d5da3]"
        >
          <Info size={20} />
        </button>
      ),
    },
  ];

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        กำลังโหลด...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-1 items-center justify-center text-red-400">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
      </div>
    );

  return (
    <>
      {/* Detail modal */}
      <AdminModalShell
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) { setSelected(null); setNote(""); }
        }}
        title="รายละเอียดการแก้ไขปัญหา"
        description="ขั้นตอนวิธีการแก้ไข"
        widthClassName="max-w-[520px]"
      >
        {selected && (
          <div className="flex flex-col gap-4">
            {/* Resolution — read only */}
            <textarea
              readOnly
              rows={5}
              value={selected.resolution ?? ""}
              placeholder="ไม่มีข้อมูลการแก้ไข"
              className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-[13px] text-gray-700 outline-none"
            />

            {/* คำอธิบาย */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-gray-500">คำอธิบาย</label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder=""
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-[13px] text-gray-700 outline-none focus:border-[#366DBD]"
              />
            </div>

            {/* Attachments */}
            {attachLoading ? (
              <p className="text-[12px] text-gray-400">กำลังโหลดไฟล์...</p>
            ) : attachments.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-gray-500">
                  ไฟล์แนบ ({attachments.length})
                </p>
                <div className="flex flex-col gap-2">
                  {attachments.map((file) => {
                    const isImage = IMAGE_EXTS.includes(
                      file.fileExt.toLowerCase(),
                    );
                    const url = `${API_BASE_URL}/uploads/requests/${file.savedName}`;
                    return (
                      <a
                        key={file.id}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
                      >
                        {isImage ? (
                          <ImageIcon size={20} className="shrink-0 text-blue-400" />
                        ) : (
                          <FileText size={20} className="shrink-0 text-red-400" />
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-medium text-gray-800">
                            {file.originalName}
                          </span>
                          <span className="text-[11px] uppercase text-gray-400">
                            {file.fileExt}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            {tab === "pending" && (
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={actioning || !note.trim()}
                  onClick={handleReject}
                  className="rounded-lg border border-[#D9534F] px-5 py-2 text-[13px] font-semibold text-[#D9534F] hover:bg-red-50 disabled:opacity-40"
                >
                  {actioning ? "กำลังบันทึก..." : "ไม่อนุมัติ"}
                </button>
                <button
                  type="button"
                  disabled={actioning}
                  onClick={handleApprove}
                  className="rounded-lg bg-[#366DBD] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#2d5da3] disabled:opacity-50"
                >
                  {actioning ? "กำลังบันทึก..." : "อนุมัติ"}
                </button>
              </div>
            )}
          </div>
        )}
      </AdminModalShell>

      <div className="flex flex-1 flex-col gap-6 bg-[#F0F4FA] p-8">
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">การจัดการงาน</h1>
          <p className="text-[14px] text-gray-500">ตรวจสอบและอนุมัติ</p>
        </div>

        {/* Tabs + Toolbar */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => { setTab("pending"); setPage(1); }}
              className={`pb-2 text-[14px] font-semibold transition-colors ${
                tab === "pending"
                  ? "border-b-2 border-[#366DBD] text-[#366DBD]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              รออนุมัติ
            </button>
            <button
              type="button"
              onClick={() => { setTab("history"); setPage(1); }}
              className={`pb-2 text-[14px] font-semibold transition-colors ${
                tab === "history"
                  ? "border-b-2 border-[#366DBD] text-[#366DBD]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              ประวัติการอนุมัติ
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="ค้นหา..."
              className="h-9 w-52 rounded-lg border border-gray-300 bg-white px-3 text-[14px] outline-none focus:border-[#366DBD]"
            />
            <button
              type="button"
              onClick={() => setPage(1)}
              className="h-9 rounded-lg bg-[#366DBD] px-5 text-[14px] font-semibold text-white hover:bg-[#2d5da3]"
            >
              ค้นหา
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="group flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[14px] text-gray-700 outline-none hover:bg-gray-50">
                {typeFilter === "ทั้งหมด" ? "ประเภททั้งหมด" : typeFilter}
                <ChevronDown size={14} className="text-gray-400 transition-transform duration-200 group-data-[popup-open]:rotate-180 group-data-[state=open]:rotate-180 group-data-[open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={typeFilter}
                  onValueChange={(v) => { setTypeFilter(v); setPage(1); }}
                >
                  {typeOptions.map((t) => (
                    <DropdownMenuRadioItem key={t} value={t}>
                      {t === "ทั้งหมด" ? "ประเภททั้งหมด" : t}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="group flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[14px] text-gray-700 outline-none hover:bg-gray-50">
                เวลา
                <ChevronDown size={14} className="text-gray-400 transition-transform duration-200 group-data-[popup-open]:rotate-180 group-data-[state=open]:rotate-180 group-data-[open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value="ล่าสุด" onValueChange={() => {}}>
                  <DropdownMenuRadioItem value="ล่าสุด">ล่าสุด</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="เก่าสุด">เก่าสุด</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <ProTechTable
          columns={columns}
          data={filtered}
          limit={LIMIT}
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}
