'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, FolderKanban } from 'lucide-react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';

export default function Topbar() {
  const pathname = usePathname();
  const {
    organizations,
    projects,
    workspaces,
    activeOrgId,
    activeProjectId,
    activeWorkspaceId,
    setActiveWorkspaceId,
  } = useWorkspace();

  const activeOrg = organizations.find((o) => o.id === activeOrgId);
  const activeProj = projects.find((p) => p.id === activeProjectId);

  // Generate dynamic breadcrumb segments based on pathname and workspace context
  const getBreadcrumbs = () => {
    const orgName = activeOrg ? activeOrg.name : 'Louis India Pvt. Ltd.';
    const projName = activeProj ? activeProj.name : 'Q3 Supply Chain Audit 2024';

    if (pathname === '/organizations') {
      return [orgName];
    }
    if (pathname === '/projects') {
      return [orgName, 'Projects'];
    }
    if (pathname === '/workspaces') {
      return [orgName, projName, 'Workspaces'];
    }

    // Map other routes
    const pathMapping: Record<string, string> = {
      '/ocel': 'OCEL 2.0',
      '/conformance': 'Conformance',
      '/process-optimization': 'Process Optimization',
      '/carbon-budget': 'Carbon Budget',
      '/carbon-fitness': 'Carbon Fitness',
      '/supplier-fitness': 'Supplier Fitness',
      '/esg-report': 'ESG Report',
      '/brsr-report': 'BRSR Report',
      '/green-routes': 'Green Routes',
      '/copilot': 'Copilot AI',
      '/simulation': 'Simulation Model',
      '/sustainability-conformance': 'Sustainability Conformance',
      '/audit-logs': 'Audit Logs',
      '/settings': 'Settings'
    };

    const currentSegment = pathMapping[pathname] || pathname.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ');
    return [orgName, projName, currentSegment];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="h-[48px] border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-4 fixed top-0 right-0 left-[220px] z-15 no-print">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] text-[var(--muted-foreground)] select-none">
        {breadcrumbs.map((segment, index) => (
          <React.Fragment key={segment}>
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--trace-subtle)] shrink-0" />}
            <span className={index === breadcrumbs.length - 1 ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted-foreground)]'}>
              {segment}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right: Workspace Selector & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Workspace Selector */}
        <div className="w-[210px]">
          <Select 
            value={activeWorkspaceId !== null ? activeWorkspaceId.toString() : ''}
            onValueChange={(val) => setActiveWorkspaceId(val ? parseInt(val) : null)}
          >
            <SelectTrigger className="h-[28px] text-[12px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] font-sans px-2.5 rounded-md focus:ring-0 focus:ring-offset-0">
              <FolderKanban className="w-3.5 h-3.5 mr-1 text-[var(--muted-foreground)]" />
              <SelectValue placeholder="Select Workspace">
                {workspaces.find((w) => w.id === activeWorkspaceId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[var(--background)] border-[var(--border)] rounded-md shadow-sm">
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id.toString()} className="text-[12px] font-sans text-[var(--foreground)]">
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* User initials avatar */}
        <div className="w-[28px] h-[28px] rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] text-[11px] font-mono font-bold flex items-center justify-center border border-[var(--border)] select-none">
          RS
        </div>
      </div>
    </div>
  );
}
