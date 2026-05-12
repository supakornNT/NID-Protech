import AdminSidebar from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#F3F4F6]">
      <div className="flex min-h-screen w-full bg-white">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 items-center justify-between border-b border-[#E5E7EB] bg-[#E9EEF5] px-6 sm:px-8 lg:px-10">
            <div>
              <p className="text-xs text-gray-400">ระบบจัดการ</p>
              <h1 className="mt-1 text-sm font-semibold text-[#2F66C5]">
                ProTech Support
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-gray-700">
                  Admin User
                </p>
                <p className="text-xs text-gray-400">ผู้ดูแลระบบ</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-[#2F66C5] shadow-sm">
                A
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 bg-[#ffffff] px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
