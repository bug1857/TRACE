import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="pl-[220px]">
        <Topbar />
        <main className="pt-[48px] p-6 w-full min-h-[calc(100vh-48px)] flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
