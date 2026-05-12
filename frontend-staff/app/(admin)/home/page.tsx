"use client";

import { useMemo, useState } from "react";
import { Building2, FolderKanban, UserRound, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type ChartItem = {
  key: string;
  label: string;
  value: number;
  color: string;
  percent?: string;
};

type ChartSegment = ChartItem & {
  percent: string;
  start: number;
  end: number;
};
const chartData: ChartItem[] = [
  {
    key: "staff",
    label: "ผู้แก้ปัญหา",
    value: 20,
    color: "#9BD8E5",
    percent: "20%",
  },
  {
    key: "customer",
    label: "ลูกค้า",
    value: 30,
    color: "#5BA5DD",
    percent: "10%",
  },
  {
    key: "general",
    label: "ผู้ใช้งานทั่วไป",
    value: 450,
    color: "#174F9F",
    percent: "70%",
  },
];

const totalUsers = 500;

export default function AdminHomePage() {
  const [activeChart, setActiveChart] = useState<string | null>(null);

  const chartSegments = useMemo<ChartSegment[]>(
    () =>
      chartData.reduce<ChartSegment[]>((segments, item) => {
        const start =
          segments.length > 0 ? segments[segments.length - 1].end : 0;
        const degrees = (item.value / totalUsers) * 360;

        segments.push({
          ...item,
          percent: `${Math.round((item.value / totalUsers) * 100)}%`,
          start,
          end: start + degrees,
        });

        return segments;
      }, []),
    [],
  );
  const gradient = useMemo(
    () =>
      `conic-gradient(${chartSegments
        .map((segment) => `${segment.color} ${segment.start}deg ${segment.end}deg`)
        .join(", ")})`,
    [chartSegments],
  );

  const activeItem =
    chartSegments.find((item) => item.label === activeChart) ?? null;

  return (
    <div className="min-h-full w-full">
      <div className="bg-[#E9EEF5] p-4 sm:p-6 lg:p-8">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          <SummaryCard
            icon={<UserRound size={20} />}
            iconBg="bg-[#EAF2FF]"
            iconText="text-[#2F66C5]"
            title="ผู้ใช้ทั้งหมด"
            value="500"
          />

          <SummaryCard
            icon={<Users size={20} />}
            iconBg="bg-[#E9F8EF]"
            iconText="text-[#2FBF71]"
            title="ทีมแก้ไขปัญหา"
            value="20"
          />

          <SummaryCard
            icon={<Users size={20} />}
            iconBg="bg-[#F2E9FF]"
            iconText="text-[#8B3DFF]"
            title="ลูกค้า"
            value="30"
          />

          <SummaryCard
            icon={<Users size={20} />}
            iconBg="bg-[#FFF0E7]"
            iconText="text-[#FF7A30]"
            title="ผู้ใช้งานทั่วไป"
            value="450"
          />
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-[1fr_1fr] lg:gap-6">
          <Card className="rounded-xl border-0 bg-white shadow-none transition-all duration-200">
            <CardContent className="p-5 sm:p-6 lg:p-7">
              <h2 className="text-xl font-bold text-[#111827]">
                สัดส่วนผู้ใช้งานระบบ
              </h2>

              <div className="mt-5 flex flex-col items-center gap-5 lg:mt-7 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
                <div className="relative">
                  <div
                    className="relative flex h-[220px] w-[220px] items-center justify-center rounded-full transition-all duration-300 hover:scale-[1.03] sm:h-[250px] sm:w-[250px] xl:h-[280px] xl:w-[280px]"
                    style={{
                      background: gradient,
                      boxShadow:
                        activeItem !== null
                          ? "0 10px 30px rgba(47,102,197,0.15)"
                          : "0 8px 20px rgba(15,23,42,0.04)",
                    }}
                  >
                    <div className="flex h-[128px] w-[128px] flex-col items-center justify-center rounded-full bg-white transition-all duration-300 hover:scale-[1.02] sm:h-[148px] sm:w-[148px] xl:h-[160px] xl:w-[160px]">
                      <p className="text-base font-bold text-[#475569]">
                        ผู้ใช้ทั้งหมด
                      </p>
                      <p className="mt-1 text-xl font-bold text-[#111827]">
                        500
                      </p>
                    </div>
                  </div>

                  {activeItem && (
                    <div className="absolute -right-24 top-3 z-10 w-max rounded-xl border border-[#DCE9FF] bg-white px-4 py-3 shadow-lg transition-all duration-200">
                      <p className="text-base font-semibold text-[#2F66C5]">
                        {activeItem.label}
                      </p>

                      <p className="mt-1 text-base text-gray-500">
                        จำนวน {activeItem.value} คน
                      </p>
                    </div>
                  )}
                </div>

               <div className="w-full max-w-[420px] space-y-3 lg:w-[340px] lg:max-w-none">
                  {chartSegments.map((item) => {
                    const isActive = activeChart === item.label;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onMouseEnter={() => setActiveChart(item.label)}
                        onMouseLeave={() => setActiveChart(null)}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-all duration-200 sm:px-4 sm:py-3 ${
                          isActive
                            ? "border-[#2F66C5] bg-[#EEF4FF]"
                            : "border-transparent hover:bg-[#F5F7FB]"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />

                          <span className="truncate text-base text-[#334155]">
                            {item.label}
                          </span>
                        </div>

                        <div className="ml-3 flex shrink-0 items-center gap-3 text-right">
                          <p className="w-10 text-right text-xl font-semibold text-[#111827]">
                            {item.value}
                          </p>
                          <p className="w-12 text-right text-base text-gray-400">
                            {item.percent}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:space-y-6">
            <Card className="rounded-xl border-0 bg-white shadow-none transition-all duration-200 ">
              <CardContent className="p-5 sm:p-6">
                <h2 className="text-xl font-bold text-black">
                  ข้อมูลองค์กรและระบบ
                </h2>

                <div className="mt-5 space-y-3">
                  <InfoRow
                    icon={<Building2 size={22} />}
                    iconBg="bg-[#DFF5F2]"
                    boxBg="bg-[#E3F4F1]"
                    iconText="text-[#18A7A0]"
                    titleText="text-[#18A7A0]"
                    valueText="text-[#18A7A0]"
                    title="องค์กรทั้งหมด"
                    value="24"
                  />
                  <InfoRow
                    icon={<FolderKanban size={22} />}
                    iconBg="bg-[#DDEBFF]"
                    boxBg="bg-[#E7F0FF]"
                    iconText="text-[#2F66C5]"
                    titleText="text-[#2F66C5]"
                    valueText="text-[#2F66C5]"
                    title="โครงการ/ระบบงานทั้งหมด"
                    value="24"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 bg-white shadow-none transition-all duration-200 ">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-bold text-black">
                    ผู้ใช้ล่าสุด
                  </h2>

                  <button className="text-left text-base font-medium text-[#2F66C5] transition-colors duration-200 hover:text-[#174F9F] sm:text-right">
                    ดูทั้งหมด
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <RecentUser
                    name="นายธนพัฒน์ ยอดแสงงาม"
                    role="Customer"
                    time="21 พ.ค. 2568 15:20"
                  />

                  <RecentUser
                    name="นายณภัทร ยอดแสงงาม"
                    role="Staff (ทีมแก้ไข)"
                    time="21 พ.ค. 2568 15:20"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="mt-4 rounded-xl border-0 bg-white shadow-none transition-all duration-200 lg:mt-6">
          <CardContent className="p-5 sm:p-6 lg:p-7">
            <h2 className="text-xl font-bold text-black">
              ข้อมูลโครงสร้าง
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              <BottomBox
                title="ประเภทคำร้อง"
                value="24"
                unit="ประเภท"
                bg="bg-[#EEF5FF]"
                text="text-[#2F66C5]"
              />

              <BottomBox
                title="ประเภทประเด็น"
                value="24"
                unit="ประเภท"
                bg="bg-[#E8F6F3]"
                text="text-[#18A7A0]"
              />

              <BottomBox
                title="กลุ่มผู้ใช้งาน"
                value="24"
                unit="กลุ่ม"
                bg="bg-[#F3EAFE]"
                text="text-[#8B3DFF]"
              />

              <BottomBox
                title="จำนวนสิทธิ์"
                value="3"
                unit="สิทธิ์"
                bg="bg-[#FFF1E8]"
                text="text-[#FF7A30]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  iconBg,
  iconText,
  title,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconText: string;
  title: string;
  value: string;
}) {
  return (
    <Card className="h-[88px] rounded-xl border-0 bg-white shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FCFDFF] sm:h-[95px]">
      <CardContent className="flex h-full items-center gap-3 p-4 sm:gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 sm:h-11 sm:w-11 ${iconBg} ${iconText}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-base font-semibold text-black">
            {title}
          </p>
          <p className="mt-1 text-xl font-bold text-black">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon,
  iconBg,
  boxBg,
  title,
  value,
  iconText,
  titleText,
  valueText,
}: {
  icon: React.ReactNode;
  iconBg: string;
  boxBg: string;
  title: string;
  value: string;
  iconText: string;
  titleText: string;
  valueText: string;
}) {
  return (
    <div className="flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-[1.03] sm:h-14 sm:w-14 ${iconBg} ${iconText}`}
      >
        {icon}
      </div>

      <div
        className={`flex min-h-[48px] flex-1 flex-col justify-center rounded-xl px-4 py-2 transition-all duration-200 hover:brightness-[0.99] sm:min-h-[56px] sm:px-5 ${boxBg}`}
      >
        <p className={`text-base font-semibold ${titleText}`}>
          {title}
        </p>

        <p className={`mt-1 text-xl font-bold leading-none ${valueText}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function RecentUser({
  name,
  role,
  time,
}: {
  name: string;
  role: string;
  time: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-transparent px-2 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E2E8F0] hover:bg-[#FAFCFF] sm:grid-cols-[1fr_auto] sm:gap-3">
      <div>
        <p className="text-base font-semibold text-black">{name}</p>
        <p className="text-base text-gray-500">{role}</p>
      </div>

      <p className="text-base text-gray-500 sm:whitespace-nowrap">
        {time}
      </p>
    </div>
  );
}

function BottomBox({
  title,
  value,
  unit,
  bg,
  text,
}: {
  title: string;
  value: string;
  unit: string;
  bg: string;
  text: string;
}) {
  return (
    <div
      className={`flex h-[92px] flex-col items-center justify-center rounded-xl px-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:saturate-[1.03] sm:h-[100px] ${bg}`}
    >
      <p className={`text-base font-bold ${text}`}>{title}</p>

      <p className={`mt-2 text-[32px] font-bold leading-none ${text}`}>
        {value} <span className="text-base">{unit}</span>
      </p>
    </div>
  );
}
