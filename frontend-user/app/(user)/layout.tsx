import Navbar from "@/components/navbar"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
