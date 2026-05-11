"use client";

import { useState } from "react";
import { Building2, FolderKanban, UserRound, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const chartData = [
  {
    label: "ผู้แก้ปัญหา",
    value: 20,
    color: "#174F9F",
    percent: "20%",
  },
  {
    label: "ลูกค้า",
    value: 30,
    color: "#5BA5DD",
    percent: "10%",
  },
  {
    label: "ผู้ใช้งานทั่วไป",
    value: 450,
    color: "#9BD8E5",
    percent: "70%",
  },
];

export default function AdminHomePage() {
  const [activeChart, setActiveChart] = useState<string | null>(null);

  return (
    <div className="min-h-full w-full">
      <div className="bg-[#E9EEF5] p-8">
        <section className="mt-8 grid grid-cols-4 gap-6">
          <SummaryCard
            icon={<UserRound size={22} />}
            iconBg="bg-[#EAF2FF]"
            iconText="text-[#2F66C5]"
            title="ผู้ใช้ทั้งหมด"
            value="500"
          />

          <SummaryCard
            icon={<Users size={22} />}
            iconBg="bg-[#E9F8EF]"
            iconText="text-[#2FBF71]"
            title="ทีมแก้ไขปัญหา"
            value="20"
          />

          <SummaryCard
            icon={<Users size={22} />}
            iconBg="bg-[#F2E9FF]"
            iconText="text-[#8B3DFF]"
            title="ลูกค้า"
            value="30"
          />

          <SummaryCard
            icon={<Users size={22} />}
            iconBg="bg-[#FFF0E7]"
            iconText="text-[#FF7A30]"
            title="ผู้ใช้งานทั่วไป"
            value="450"
          />
        </section>

        <section className="mt-8 grid grid-cols-2 gap-6">
          <Card className="rounded-xl border-0 bg-white shadow-none">
            <CardContent className="p-7">
              <h2 className="text-base font-bold text-black">
                สัดส่วนผู้ใช้งานระบบ
              </h2>

              <div className="mt-8 flex items-center justify-between">
                <div className="relative">
                  <div
                    className="relative flex h-[300px] w-[300px] items-center justify-center rounded-full transition-all duration-300 hover:scale-105"
                    style={{
                      background: `
                      conic-gradient(
                        #174F9F 0deg 252deg,
                        #5BA5DD 252deg 274deg,
                        #9BD8E5 274deg 360deg
                      )
                    `,
                      boxShadow:
                        activeChart !== null
                          ? "0 10px 30px rgba(47,102,197,0.15)"
                          : "",
                    }}
                  >
                    <div className="flex h-[180px] w-[180px] flex-col items-center justify-center rounded-full bg-white">
                      <p className="text-xs font-bold">ผู้ใช้ทั้งหมด</p>
                      <p className="mt-1 text-xl font-bold">500</p>
                    </div>
                  </div>

                  {activeChart && (
                    <div className="absolute -right-28 top-4 rounded-xl border border-[#DCE9FF] bg-white px-4 py-3 shadow-lg">
                      <p className="text-xs font-semibold text-[#2F66C5]">
                        {
                          chartData.find((item) => item.label === activeChart)
                            ?.label
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        จำนวน{" "}
                        {
                          chartData.find((item) => item.label === activeChart)
                            ?.value
                        }{" "}
                        คน
                      </p>
                    </div>
                  )}
                </div>

                <div className="w-[250px] space-y-2">
                  {chartData.map((item) => {
                    const isActive = activeChart === item.label;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onMouseEnter={() => setActiveChart(item.label)}
                        onMouseLeave={() => setActiveChart(null)}
                        onClick={() => console.log("clicked", item.label)}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 transition-all duration-200 ${
                          isActive
                            ? "border-[#2F66C5] bg-[#EEF4FF]"
                            : "border-transparent hover:bg-[#F5F7FB]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />

                          <span className="text-sm">{item.label}</span>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold">{item.value}</p>
                          <p className="text-xs text-gray-400">
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

          <div className="space-y-6">
            <Card className="rounded-xl border-0 bg-white shadow-none">
              <CardContent className="p-6">
                <h2 className="text-base font-bold text-black">
                  ข้อมูลองค์กรและระบบ
                </h2>

                <div className="mt-5 space-y-3">
                  <InfoRow
                    icon={<Building2 size={24} />}
                    iconBg="bg-[#DFF5F2]"
                    boxBg="bg-[#E3F4F1]"
                    iconText="text-[#18A7A0]"
                    titleText="text-[#18A7A0]"
                    valueText="text-[#18A7A0]"
                    title="องค์กรทั้งหมด"
                    value="24"
                  />
                  <InfoRow
                    icon={<FolderKanban size={24} />}
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

            <Card className="rounded-xl border-0 bg-white shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-black">
                    ผู้ใช้ล่าสุด
                  </h2>

                  <button className="text-xs font-medium text-[#2F66C5]">
                    ดูทั้งหมด
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <RecentUser
                    name="นายธนพัฒน์ ยอดแสงงาม"
                    role="Customer"
                    time="21 พ.ค. 2568 15:20:60"
                  />

                  <RecentUser
                    name="นายณภัทร ยอดแสงงาม"
                    role="Staff(ทีมแก้ไข)"
                    time="21 พ.ค. 2568 15:20:60"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="mt-8 rounded-xl border-0 bg-white shadow-none">
          <CardContent className="p-7">
            <h2 className="text-base font-bold text-black">ข้อมูลโครงสร้าง</h2>

            <div className="mt-5 grid grid-cols-4 gap-6">
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
    <Card className="h-[95px] rounded-xl border-0 bg-white shadow-none">
      <CardContent className="flex h-full items-center gap-4 p-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg} ${iconText}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold text-black">{title}</p>
          <p className="mt-1 text-lg font-bold text-black">{value}</p>
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
    <div className="flex items-center gap-3">
      {/* ICON */}
      <div
        className={`
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-md
          ${iconBg}
          ${iconText}
        `}
      >
        {icon}
      </div>

      {/* CONTENT */}
      <div
        className={`
          flex
          h-12
          flex-1
          flex-col
          justify-center
          rounded-md
          px-4
          ${boxBg}
        `}
      >
        <p
          className={`
            text-xs
            font-semibold
            ${titleText}
          `}
        >
          {title}
        </p>

        <p
          className={`
            text-sm
            font-bold
            ${valueText}
          `}
        >
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
    <div className="grid grid-cols-[1fr_auto] gap-3">
      <div>
        <p className="font-semibold text-black">{name}</p>
        <p className="text-gray-500">{role}</p>
      </div>

      <p className="whitespace-nowrap text-gray-500">{time}</p>
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
      className={`flex h-[90px] flex-col items-center justify-center rounded-xl ${bg}`}
    >
      <p className={`text-sm font-bold ${text}`}>{title}</p>

      <p className={`mt-2 text-2xl font-bold ${text}`}>
        {value} <span className="text-sm">{unit}</span>
      </p>
    </div>
  );
}
