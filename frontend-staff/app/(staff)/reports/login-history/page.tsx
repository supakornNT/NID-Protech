"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Info, LogIn, ShieldCheck, Users, XCircle } from "lucide-react";

import { ToolbarSelect } from "@/components/ui/toolbar-select";

import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { StatusBadge } from "@/components/admin/admin-table-page";
import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import { Card, CardContent } from "@/components/ui/card";
import {
  useLoginLogChart,
  type LoginLogChartPeriod,
} from "@/hooks/login-log/use-login-log-chart";
import { useLoginLogList } from "@/hooks/login-log/use-login-log-list";
import type {
  LoginLogFilters,
  LoginLogItem,
} from "@/hooks/login-log/use-login-log-list";
import { useLoginLogMeta } from "@/hooks/login-log/use-login-log-meta";
import { useLoginLogSummary } from "@/hooks/login-log/use-login-log-summary";
import { isValidDateRange } from "@/lib/form-utils";
import type { Column } from "@/types/table";
import { formatThaiDateTime } from "../../management/organizations/page";

function createDefaultFilters(): LoginLogFilters {
  return {
    keyword: "",
    userType: "all",
    status: "all",
    startDate: "",
    endDate: "",
  };
}

const PAGE_LIMIT = 10;

const PERIOD_OPTIONS: Array<{ value: LoginLogChartPeriod; label: string }> = [
  { value: "day", label: "วัน" },
  { value: "month", label: "เดือน" },
  { value: "year", label: "ปี" },
];

const THAI_MONTH_NAMES = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

function getTodayString() {
  const value = new Date();
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapUserTypeLabel(value: string): string {
  if (value === "staff") {
    return "เจ้าหน้าที่";
  }

  if (value === "customer") {
    return "ลูกค้า";
  }

  return value || "-";
}

function mapStatusLabel(value: string): string {
  if (value === "success") {
    return "สำเร็จ";
  }

  if (value === "failed") {
    return "ไม่สำเร็จ";
  }

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

function formatChartLabel(period: LoginLogChartPeriod, value: string) {
  if (period === "month") {
    return value.padStart(2, "0");
  }

  if (period === "year") {
    const monthIndex = Number(value) - 1;
    const monthLabels = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];

    return monthLabels[monthIndex] ?? value;
  }

  return value;
}

function formatSelectedDateLabel(date: string) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "-";
  }
  const [year, month, day] = date.split("-").map(Number);
  const monthName = THAI_MONTH_NAMES[month - 1] ?? month;
  return `${day} ${monthName} ${year}`;
}


function formatSelectedMonthLabel(monthValue: string) {
  if (!monthValue || !/^\d{4}-\d{2}$/.test(monthValue)) {
    return "-";
  }

  const [year, month] = monthValue.split("-").map(Number);
  const monthName = THAI_MONTH_NAMES[month - 1] ?? month;
  return `${monthName} ${year}`;
}

function extractYearFromMonthValue(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const nextYear = Number(value.slice(0, 4));
  return Number.isInteger(nextYear) ? nextYear : null;
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
              multiline ? "break-words whitespace-pre-wrap" : ""
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
  const today = getTodayString();
  const currentMonth = today.slice(0, 7);
  const currentYear = Number(today.slice(0, 4));

  const [page, setPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState<LoginLogFilters>(
    createDefaultFilters,
  );
  const [appliedFilters, setAppliedFilters] = useState<LoginLogFilters>(
    createDefaultFilters,
  );
  const [selectedPeriod, setSelectedPeriod] =
    useState<LoginLogChartPeriod>("day");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedRow, setSelectedRow] = useState<LoginLogItem | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);

  const { data: meta, error: metaError } = useLoginLogMeta();
  const { data: summary, loading: summaryLoading, error: summaryError } =
    useLoginLogSummary({
      period: selectedPeriod,
      date: selectedDate,
      month: selectedMonth,
      year: selectedYear,
    });
  const { data: chartData, loading: chartLoading, error: chartError } =
    useLoginLogChart({
      period: selectedPeriod,
      date: selectedDate,
      month: selectedMonth,
      year: selectedYear,
    });
  const { data: listData, loading: listLoading, error: listError } =
    useLoginLogList({
      page,
      limit: PAGE_LIMIT,
      filters: appliedFilters,
    });

  console.log("ReportLoginHistoryPage render:", {
    selectedPeriod,
    selectedDate,
    selectedMonth,
    selectedYear,
    chartDataItemsLength: chartData?.items?.length,
    chartLoading,
  });

  const rows = listData?.items ?? [];
  const pagination = listData?.pagination ?? {
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  };

  const activeSummary = summary?.[selectedPeriod] ?? {
    success: 0,
    failed: 0,
    staff: 0,
    customer: 0,
  };

  const chartItems = useMemo(
    () =>
      (chartData?.items ?? []).map((item) => ({
        ...item,
        label: formatChartLabel(selectedPeriod, item.label),
      })),
    [chartData?.items, selectedPeriod],
  );

  const availableYears = useMemo(() => {
    const baseYears = meta?.availableYears ?? [];
    const merged = Array.from(
      new Set([selectedYear, currentYear, ...baseYears]),
    );
    return merged.sort((left, right) => right - left);
  }, [currentYear, meta?.availableYears, selectedYear]);

  const scopeTitle =
    selectedPeriod === "day"
      ? formatSelectedDateLabel(selectedDate)
      : selectedPeriod === "month"
        ? formatSelectedMonthLabel(selectedMonth)
        : `${selectedYear}`;

  const columns: Column<LoginLogItem>[] = [
    {
      key: "loginAt",
      title: "วันเวลาเข้าสู่ระบบ",
      className: "min-w-[180px]",
      render: (_, row) => formatThaiDateTime(row.loginAt),
    },
    {
      key: "userType",
      title: "ประเภทผู้ใช้",
      className: "min-w-[120px]",
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
      title: "อีเมล",
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
            ติดตามประวัติการเข้าสู่ระบบของเจ้าหน้าที่และลูกค้า
          </p>
        </div>

        <Card className="rounded-xl border-0 bg-[#E9EEF5] shadow-none">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {PERIOD_OPTIONS.map((option) => {
                  const active = option.value === selectedPeriod;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedPeriod(option.value);
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        active
                          ? "bg-[#174F9F] text-white ring-2 ring-[#A9C4EB] shadow-[0_8px_20px_rgba(23,79,159,0.18)]"
                          : "bg-white text-[#174F9F] ring-1 ring-[#D5E0F0] hover:bg-[#F8FBFF]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {selectedPeriod === "day" ? (
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-[#D5E0F0]">
                    <span className="text-sm font-medium text-[#64748B]">
                      เลือกวันที่
                    </span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => {
                        setSelectedDate(event.target.value);
                      }}
                      className="border-0 bg-transparent text-sm font-semibold text-[#174F9F] outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                    />
                  </div>
                ) : null}

                {selectedPeriod === "month" ? (
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-[#D5E0F0]">
                    <span className="text-sm font-medium text-[#64748B]">
                      เลือกเดือน
                    </span>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(event) => {
                        const nextMonth = event.target.value;

                        if (!nextMonth) {
                          setSelectedMonth("");
                          return;
                        }

                        const nextYear = extractYearFromMonthValue(nextMonth);

                        if (nextYear === null) {
                          return;
                        }

                        setSelectedMonth(nextMonth);
                        setSelectedYear(nextYear);
                      }}
                      className="border-0 bg-transparent text-sm font-semibold text-[#174F9F] outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                    />
                  </div>
                ) : null}

                {selectedPeriod === "year" ? (
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-[#D5E0F0]">
                    <span className="text-sm font-medium text-[#64748B]">
                      เลือกปี
                    </span>
                    <ToolbarSelect
                      value={String(selectedYear)}
                      options={availableYears.map((year) => ({ value: String(year), label: String(year) }))}
                      onChange={(value) => {
                        setSelectedYear(Number(value));
                      }}
                      className="h-auto border-0 bg-transparent text-sm font-semibold text-[#174F9F] shadow-none min-w-[80px] focus:ring-0 p-0"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="เข้าสู่ระบบสำเร็จ"
                value={activeSummary.success}
                icon={<LogIn size={20} />}
                iconBg="bg-[#EAF2FF]"
                iconText="text-[#2F66C5]"
              />
              <SummaryCard
                title="เข้าสู่ระบบไม่สำเร็จ"
                value={activeSummary.failed}
                icon={<XCircle size={20} />}
                iconBg="bg-[#FFF0F3]"
                iconText="text-[#D1435B]"
              />
              <SummaryCard
                title="เจ้าหน้าที่"
                value={activeSummary.staff}
                icon={<ShieldCheck size={20} />}
                iconBg="bg-[#E9F8EF]"
                iconText="text-[#2FBF71]"
              />
              <SummaryCard
                title="ลูกค้า"
                value={activeSummary.customer}
                icon={<Users size={20} />}
                iconBg="bg-[#FFF0E7]"
                iconText="text-[#FF7A30]"
              />
            </section>

            {summaryLoading ? null : summaryError ? (
              <div className="rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
                {summaryError}
              </div>
            ) : null}

            <div className="rounded-xl border-0 bg-white p-4 ring-1 ring-[#D5E0F0] sm:p-5">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">
                    กราฟการเข้าสู่ระบบราย
                    {
                      PERIOD_OPTIONS.find(
                        (item) => item.value === selectedPeriod,
                      )?.label
                    }
                  </h2>
                  <p className="text-sm text-[#8B95A7]">
                    ช่วงที่เลือก: {scopeTitle}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-[#475569]">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-[#5BA5DD]" />
                    สำเร็จ
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-[#174F9F]" />
                    ไม่สำเร็จ
                  </span>
                </div>
              </div>

              {metaError && selectedPeriod === "year" ? (
                <div className="mb-4 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
                  {metaError}
                </div>
              ) : null}

              {chartLoading ? (
                <div className="py-16 text-center text-sm text-[#8B95A7]">
                  กำลังโหลดข้อมูลกราฟ...
                </div>
              ) : chartError ? (
                <div className="rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
                  {chartError}
                </div>
              ) : chartItems.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#8B95A7]">
                  ไม่มีข้อมูลการเข้าสู่ระบบในช่วงเวลาที่เลือก
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartItems} barCategoryGap="24%">
                    <CartesianGrid stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: "#64748B" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748B" }}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(23, 79, 159, 0.06)" }}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: "#D5E0F0",
                      }}
                    />
                    <Bar
                      dataKey="success"
                      name="สำเร็จ"
                      fill="#5BA5DD"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="failed"
                      name="ไม่สำเร็จ"
                      fill="#174F9F"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 bg-white shadow-none ring-1 ring-[#E5E7EB]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <ProTechSearch
                  value={draftFilters.keyword}
                  inputProps={{
                    type: "search",
                    inputMode: "search",
                    autoComplete: "off",
                    maxLength: 120,
                    title: "ค้นหาด้วยชื่อผู้ใช้หรืออีเมล",
                  }}
                  onChange={(event) => {
                    setFilterError(null);
                    setDraftFilters((current: LoginLogFilters) => ({
                      ...current,
                      keyword: event.target.value,
                    }));
                  }}
                  placeholder="ค้นหาชื่อผู้ใช้ อีเมล"
                  className="w-56 flex-none"
                  inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
                />

                <ToolbarSelect
                  value={draftFilters.userType}
                  options={[
                    { value: "all", label: "ทุกประเภท" },
                    { value: "staff", label: "เจ้าหน้าที่" },
                    { value: "customer", label: "ลูกค้า" },
                  ]}
                  onChange={(value) => {
                    setDraftFilters((current: LoginLogFilters) => ({
                      ...current,
                      userType: value as LoginLogFilters["userType"],
                    }));
                  }}
                />

                <ToolbarSelect
                  value={draftFilters.status}
                  options={[
                    { value: "all", label: "ทุกสถานะ" },
                    { value: "success", label: "สำเร็จ" },
                    { value: "failed", label: "ไม่สำเร็จ" },
                  ]}
                  onChange={(value) => {
                    setDraftFilters((current: LoginLogFilters) => ({
                      ...current,
                      status: value as LoginLogFilters["status"],
                    }));
                  }}
                />

                <div className="flex items-center gap-2 rounded-md border border-[#A8B1C2] bg-white px-3">
                  <span className="text-[13px] text-[#6B7280]">
                    วันที่เริ่มต้น
                  </span>
                  <input
                    type="date"
                    value={draftFilters.startDate}
                    onChange={(event) => {
                      setFilterError(null);
                      setDraftFilters((current: LoginLogFilters) => ({
                        ...current,
                        startDate: event.target.value,
                      }));
                    }}
                    className="h-7.75 border-0 bg-transparent text-[14px] text-[#6B7280] outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-md border border-[#A8B1C2] bg-white px-3">
                  <span className="text-[13px] text-[#6B7280]">
                    วันที่สิ้นสุด
                  </span>
                  <input
                    type="date"
                    value={draftFilters.endDate}
                    onChange={(event) => {
                      setFilterError(null);
                      setDraftFilters((current: LoginLogFilters) => ({
                        ...current,
                        endDate: event.target.value,
                      }));
                    }}
                    className="h-7.75 border-0 bg-transparent text-[14px] text-[#6B7280] outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                  />
                </div>

                <ProTechButton
                  variant="primary"
                  className="h-7.75 min-w-18.5 px-4 text-[14px]"
                  onClick={() => {
                    if (
                      !isValidDateRange(
                        draftFilters.startDate,
                        draftFilters.endDate,
                      )
                    ) {
                      setFilterError(
                        "วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด",
                      );
                      return;
                    }

                    setFilterError(null);
                    setPage(1);
                    setAppliedFilters({ ...draftFilters });
                  }}
                >
                  ค้นหา
                </ProTechButton>
              </div>
            </div>

            {filterError ? (
              <p className="mt-4 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
                {filterError}
              </p>
            ) : null}
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
            <h2 className="text-xl font-bold text-[#111827]">
              ประวัติการเข้าสู่ระบบ
            </h2>
            <p className="mt-1 text-sm text-[#8B95A7]">
              เรียงจากรายการล่าสุดก่อน
            </p>
          </div>

          <ProTechTable
            columns={columns}
            data={rows}
            limit={pagination.limit}
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={setPage}
            loading={listLoading}
          />
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
              <DetailRow
                label="วันเวลา"
                value={formatThaiDateTime(selectedRow.loginAt)}
              />
              <DetailRow
                label="ประเภทผู้ใช้"
                value={mapUserTypeLabel(selectedRow.userType)}
              />
              <DetailRow label="ชื่อ" value={selectedRow.userName || "-"} />
              <DetailRow label="อีเมล" value={selectedRow.userEmail || "-"} />
              <DetailRow
                label="IP Address"
                value={selectedRow.ipAddress || "-"}
              />
              <DetailRow
                label="User Agent"
                value={selectedRow.userAgent || "-"}
                multiline
              />
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
