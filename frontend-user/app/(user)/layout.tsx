import Navbar from "@/components/navbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-hidden bg-white">
      <Navbar />

      <main className="w-full flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
