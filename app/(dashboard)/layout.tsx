import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { AnalysisProvider } from '@/lib/AnalysisContext';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnalysisProvider>
      <WorkspaceProvider>
        <div className="min-h-screen bg-[#FAFAF8] text-[#1A1917]">
          <Sidebar />
          <div className="pl-[220px]">
            <Topbar />
            <main className="pt-[48px] p-6 w-full min-h-[calc(100vh-48px)] flex flex-col">
              {children}
            </main>
          </div>
        </div>
      </WorkspaceProvider>
    </AnalysisProvider>
  );
}
