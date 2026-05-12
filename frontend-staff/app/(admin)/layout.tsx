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
            
          </header>

          <main className="min-w-0 flex-1 bg-[#ffffff] px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
