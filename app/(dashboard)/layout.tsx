import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import PageWrapper from '@/components/layout/PageWrapper';
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
        <div className="min-h-screen bg-background text-foreground bg-[#0A0A0A]">
          <Sidebar />
          <div className="pl-[220px]">
            <Topbar />
            <main className="pt-[48px] p-6 w-full min-h-[calc(100vh-48px)] flex flex-col">
              <PageWrapper>{children}</PageWrapper>
            </main>
          </div>
        </div>
      </WorkspaceProvider>
    </AnalysisProvider>
  );
}
