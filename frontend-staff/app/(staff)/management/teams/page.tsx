import { TeamRegistrationForm } from "@/components/admin/team-registration-form";

export default function TeamsPage() {
  return (
    <div className="min-h-full w-full rounded-xl px-5 py-6 sm:px-6 sm:py-7 lg:px-7 lg:py-8">
      <div className="mx-auto max-w-[920px] space-y-4">
        <div>
          <h1 className="text-[28px] font-bold leading-none text-[#111827]">
            จัดการข้อมูลลงทะเบียนทีมแก้ไขประเด็น
          </h1>
          <p className="mt-2 text-[14px] text-[#8B95A7]">
            ลงทะเบียนเจ้าหน้าที่และเลือกผูกทีมจากข้อมูลจริงในระบบ
          </p>
        </div>

        <TeamRegistrationForm />
      </div>
    </div>
  );
}
