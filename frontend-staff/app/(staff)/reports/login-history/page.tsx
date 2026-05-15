"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Info, LogIn, ShieldCheck, Users, XCircle } from "lucide-react";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { StatusBadge } from "@/components/admin/admin-table-page";
import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import { Card, CardContent } from "@/components/ui/card";
import { useLoginLogList } from "@/hooks/login-log/use-login-log-list";
import type {
  LoginLogFilters,
  LoginLogItem,
} from "@/hooks/login-log/use-login-log-list";
import { useLoginLogSummary } from "@/hooks/login-log/use-login-log-summary";
import type { Column } from "@/types/table";

const DEFAULT_FILTERS: LoginLogFilters = {
  keyword: "",
  userType: "all",
  status: "all",
  startDate: "",
  endDate: "",
};
const PAGE_LIMIT = 5;

function formatThaiDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function mapUserTypeLabel(value: string): string {
  return value || "-";
}

function mapStatusLabel(value: string): string {
  return value || "-";
}

function normalizeFailReason(value: string | null): string {
  if (!value) {
    return "-";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function SummaryCard({
  title,
  value,
  icon,
  iconBg,
  iconText,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  iconBg: string;
  iconText: string;
}) {
  return (
    <Card className="rounded-xl border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg} ${iconText}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-[#64748B]">{title}</p>
          <p className="mt-1 text-[28px] font-bold leading-none text-[#111827]">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  tone,
  multiline = false,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-2 rounded-xl bg-[#F8FAFC] px-4 py-3 sm:grid-cols-[140px_1fr] sm:items-start">
      <p className="text-sm font-semibold text-[#475569]">{label}</p>
      <div className="min-w-0">
        {tone ? (
          <StatusBadge label={value} tone={tone} />
        ) : (
          <p
            className={`text-sm text-[#111827] ${
              multiline ? "wrap-break-word whitespace-pre-wrap" : ""
            }`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ReportLoginHistoryPage() {
  const [page, setPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState<LoginLogFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<LoginLogFilters>(DEFAULT_FILTERS);
  const [selectedRow, setSelectedRow] = useState<LoginLogItem | null>(null);

  const { data: summary, loading: summaryLoading, error: summaryError } =
    useLoginLogSummary();
  const { data: listData, loading: listLoading, error: listError } =
    useLoginLogList({
      page,
      limit: PAGE_LIMIT,
      filters: appliedFilters,
    });

  const rows = listData?.items ?? [];
  const pagination = listData?.pagination ?? {
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  };

  const columns: Column<LoginLogItem>[] = [
    {
      key: "loginAt",
      title: "วันที่เวลา login",
      className: "min-w-[160px]",
      render: (_, row) => formatThaiDateTime(row.loginAt),
    },
    {
      key: "userType",
      title: "ประเภทผู้ใช้",
      className: "min-w-[110px]",
      render: (_, row) => mapUserTypeLabel(row.userType),
    },
    {
      key: "userName",
      title: "ชื่อ",
      className: "min-w-[180px]",
      render: (_, row) => (
        <div className="flex justify-center text-left font-medium text-[#111827]">
          {row.userName || "-"}
        </div>
      ),
    },
    {
      key: "userEmail",
      title: "e-mail",
      className: "min-w-[220px]",
      render: (_, row) => (
        <div className="flex justify-center text-left text-[#111827]">
          {row.userEmail || "-"}
        </div>
      ),
    },
    {
      key: "status",
      title: "สถานะ",
      className: "min-w-[110px]",
      render: (_, row) => (
        <div className="flex justify-center">
          <StatusBadge
            label={mapStatusLabel(row.status)}
            tone={row.status === "success" ? "success" : "danger"}
          />
        </div>
      ),
    },
    {
      key: "action",
      title: "จัดการ",
      className: "min-w-[120px]",
      render: (_, row) => (
        <ProTechButton
          variant="outline"
          className="h-7.75 px-3 text-[13px]"
          icon={<Info size={15} />}
          onClick={() => {
            setSelectedRow(row);
          }}
        >
          ดูรายละเอียด
        </ProTechButton>
      ),
    },
  ];

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="space-y-6">
        <div>
          <h1 className="text-[32px] font-bold leading-none text-[#111827]">
            รายงานการเข้าสู่ระบบ
          </h1>
          <p className="mt-2 text-[16px] text-[#8B95A7]">
            ติดตามประวัติการเข้าสู่ระบบของ staff และ customer
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="login วันนี้"
            value={summary?.todaySuccess ?? 0}
            icon={<LogIn size={20} />}
            iconBg="bg-[#EAF2FF]"
            iconText="text-[#2F66C5]"
          />
          <SummaryCard
            title="login ไม่สำเร็จวันนี้"
            value={summary?.todayFailed ?? 0}
            icon={<XCircle size={20} />}
            iconBg="bg-[#FFF0F3]"
            iconText="text-[#D1435B]"
          />
          <SummaryCard
            title="staff login"
            value={summary?.staff ?? 0}
            icon={<ShieldCheck size={20} />}
            iconBg="bg-[#E9F8EF]"
            iconText="text-[#2FBF71]"
          />
          <SummaryCard
            title="customer login"
            value={summary?.customer ?? 0}
            icon={<Users size={20} />}
            iconBg="bg-[#FFF0E7]"
            iconText="text-[#FF7A30]"
          />
        </section>

        {summaryLoading ? null : summaryError ? (
          <Card className="rounded-xl border border-[#FFB4C0] bg-[#FFF5F7] shadow-none">
            <CardContent className="p-5 text-sm text-[#D1435B]">
              {summaryError}
            </CardContent>
          </Card>
        ) : null}

        <Card className="rounded-xl border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <ProTechSearch
                  value={draftFilters.keyword}
                  onChange={(event) => {
                    setDraftFilters((current: LoginLogFilters) => ({
                      ...current,
                      keyword: event.target.value,
                    }));
                  }}
                  placeholder="ค้นหาชื่อผู้ใช้หรือ e-mail"
                  className="w-50 flex-none"
                  inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
                />

                <div className="relative">
                  <select
                    value={draftFilters.userType}
                    onChange={(event) => {
                      setDraftFilters((current: LoginLogFilters) => ({
                        ...current,
                        userType: event.target.value as LoginLogFilters["userType"],
                      }));
                    }}
                    className="h-7.75 min-w-31 appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-[14px] text-[#6B7280] outline-none"
                  >
                    <option value="all">ทุกประเภท</option>
                    <option value="staff">staff</option>
                    <option value="customer">customer</option>
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={draftFilters.status}
                    onChange={(event) => {
                      setDraftFilters((current: LoginLogFilters) => ({
                        ...current,
                        status: event.target.value as LoginLogFilters["status"],
                      }));
                    }}
                    className="h-7.75 min-w-31 appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-[14px] text-[#6B7280] outline-none"
                  >
                    <option value="all">ทุกสถานะ</option>
                    <option value="success">success</option>
                    <option value="failed">failed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 rounded-md border border-[#A8B1C2] bg-white px-3">
                  <span className="text-[13px] text-[#6B7280]">วันที่เริ่มต้น</span>
                  <input
                    type="date"
                    value={draftFilters.startDate}
                    onChange={(event) => {
                      setDraftFilters((current: LoginLogFilters) => ({
                        ...current,
                        startDate: event.target.value,
                      }));
                    }}
                    className="h-7.75 border-0 bg-transparent text-[14px] text-[#6B7280] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-md border border-[#A8B1C2] bg-white px-3">
                  <span className="text-[13px] text-[#6B7280]">วันที่สิ้นสุด</span>
                  <input
                    type="date"
                    value={draftFilters.endDate}
                    onChange={(event) => {
                      setDraftFilters((current: LoginLogFilters) => ({
                        ...current,
                        endDate: event.target.value,
                      }));
                    }}
                    className="h-7.75 border-0 bg-transparent text-[14px] text-[#6B7280] outline-none"
                  />
                </div>

                <ProTechButton
                  variant="primary"
                  className="h-7.75 min-w-18.5 px-4 text-[14px]"
                  onClick={() => {
                    setPage(1);
                    setAppliedFilters(draftFilters);
                  }}
                >
                  ค้นหา
                </ProTechButton>

                <ProTechButton
                  variant="delete"
                  className="h-7.75 px-4 text-[14px]"
                  onClick={() => {
                    setDraftFilters(DEFAULT_FILTERS);
                    setAppliedFilters(DEFAULT_FILTERS);
                    setPage(1);
                  }}
                >
                  ล้างค่า
                </ProTechButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {listError ? (
          <Card className="rounded-xl border border-[#FFB4C0] bg-[#FFF5F7] shadow-none">
            <CardContent className="p-5 text-sm text-[#D1435B]">
              {listError}
            </CardContent>
          </Card>
        ) : null}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">ประวัติการเข้าสู่ระบบ</h2>
            <p className="mt-1 text-sm text-[#8B95A7]">
              เรียงจากรายการล่าสุดก่อน
            </p>
          </div>

          {listLoading ? (
            <Card className="rounded-xl border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
              <CardContent className="p-6 text-sm text-[#8B95A7]">
                กำลังโหลดข้อมูล...
              </CardContent>
            </Card>
          ) : (
            <ProTechTable
              columns={columns}
              data={rows}
              limit={pagination.limit}
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              onPageChange={setPage}
            />
          )}
        </section>

        <AdminModalShell
          open={selectedRow !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRow(null);
            }
          }}
          title="รายละเอียดการเข้าสู่ระบบ"
          widthClassName="max-w-[640px]"
        >
          {selectedRow ? (
            <div className="space-y-3">
              <DetailRow label="วันที่เวลา" value={formatThaiDateTime(selectedRow.loginAt)} />
              <DetailRow label="ประเภทผู้ใช้" value={mapUserTypeLabel(selectedRow.userType)} />
              <DetailRow label="ชื่อ" value={selectedRow.userName || "-"} />
              <DetailRow label="e-mail" value={selectedRow.userEmail || "-"} />
              <DetailRow label="IP Address" value={selectedRow.ipAddress || "-"} />
              <DetailRow label="User Agent" value={selectedRow.userAgent || "-"} multiline />
              <DetailRow
                label="สถานะ"
                value={mapStatusLabel(selectedRow.status)}
                tone={selectedRow.status === "success" ? "success" : "danger"}
              />
              <DetailRow
                label="Fail Reason"
                value={
                  selectedRow.status === "failed"
                    ? normalizeFailReason(selectedRow.failReason)
                    : "-"
                }
              />
            </div>
          ) : null}
        </AdminModalShell>
      </div>
    </div>
  );
}
