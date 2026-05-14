"use client";

import { ProTechButton } from "@/components/tables/protech-button";

export default function OrganizationsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold leading-none text-[#111827]">
          จัดการข้อมูลองค์กร
        </h1>
        <p className="mt-2 text-[16px] text-[#8B95A7]">เพิ่มข้อมูลองค์กรที่เกี่ยวข้อง</p>
      </div>

      <div className="mx-auto max-w-[640px] rounded-[28px] bg-[#EAF1FC] px-10 py-10">
        <div className="space-y-7">
          <div className="space-y-2">
            <label className="block text-[16px] text-[#111827]">ชื่อองค์กร</label>
            <input
              className="h-[33px] w-[224px] rounded-md border border-[#A8B1C2] bg-white px-3 outline-none"
              defaultValue="บริษัท โปรเทค ซัพพอร์ต จำกัด"
            />
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="block text-[16px] text-[#111827]">ประเภท</label>
              <select className="h-[33px] w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none">
                <option>บริษัท</option>
                <option>หน่วยงานรัฐ</option>
                <option>อื่น ๆ</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[16px] text-[#111827]">สถานะ</label>
              <select className="h-[33px] w-full rounded-md border border-[#A8B1C2] bg-white px-3 outline-none">
                <option>ใช้งาน</option>
                <option>ไม่ใช้งาน</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <ProTechButton variant="delete" className="h-[33px] min-w-[76px] text-[14px]">
              ยกเลิก
            </ProTechButton>
            <ProTechButton variant="primary" className="h-[33px] min-w-[86px] text-[14px]">
              แก้ไข
            </ProTechButton>
          </div>
        </div>
      </div>
    </div>
  );
}
