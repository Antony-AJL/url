import { TopNav } from '@/components/dashboard/top-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="container mx-auto p-8">
        {children}
      </main>
    </div>
  )
}