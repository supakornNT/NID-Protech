"use client";



export default function HomePage() {
  return (
    <div className="flex-1 bg-[#E3EDFD] p-12 flex flex-col gap-6">
      <div className="relative flex flex-col  min-h-96 overflow-hidden rounded-2xl">
        <div
          className="z-10 flex flex-col items-center justify-center rounded-full bg-white  py-14 shadow-md"
          style={{ width: "300px", height: "300px" }}
        >
          <h1 className="text-5xl font-normal text-gray-900">ยินดีต้อนรับ</h1>
          <h2 className="mt-2 text-5xl font-normal text-[#366DBD]">
            สมชาย ใจดี
          </h2>
        </div>
        <div className="text-gray-500 size px-12 py-6">เข้าสู่ระบบ Protech Support</div>
        <div className="text-black size px-12 ">
          ระบบรับเเจ้งปัญหา ประเด็นการใช้งาน/ข้อร้องเรียน
        </div>
        <div className="text-black size px-12">
          การให้บริการ เพื่อการทำงานของคุณง่ายเเละรวกเร็ว
        </div>
      </div>
      <div className="bg-green-400 h-48"></div>
    </div>
  );
}
