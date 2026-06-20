'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, LogOut, User, FolderKanban } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Topbar() {
  const pathname = usePathname();

  // Generate dynamic breadcrumb segments based on pathname
  const getBreadcrumbs = () => {
    const defaultOrg = 'Louis India Pvt. Ltd.';
    const defaultProj = 'Q3 Supply Chain Audit 2024';

    if (pathname === '/organizations') {
      return [defaultOrg];
    }
    if (pathname === '/projects') {
      return [defaultOrg, 'Projects'];
    }
    if (pathname === '/workspaces') {
      return [defaultOrg, defaultProj, 'Workspaces'];
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
    return [defaultOrg, defaultProj, currentSegment];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="h-[48px] border-b border-[#E2E0D8] bg-[#FAFAF8] flex items-center justify-between px-4 fixed top-0 right-0 left-[220px] z-15">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] text-[#6B6963] select-none">
        {breadcrumbs.map((segment, index) => (
          <React.Fragment key={segment}>
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#9B9891] shrink-0" />}
            <span className={index === breadcrumbs.length - 1 ? 'text-[#1A1917] font-medium' : 'text-[#6B6963]'}>
              {segment}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right: Project Selector & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Project Selector */}
        <div className="w-[210px]">
          <Select defaultValue="proj-1">
            <SelectTrigger className="h-[28px] text-[12px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] font-sans px-2.5 rounded-md focus:ring-0 focus:ring-offset-0">
              <FolderKanban className="w-3.5 h-3.5 mr-1 text-[#6B6963]" />
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="bg-[#FAFAF8] border-[#E2E0D8] rounded-md shadow-sm">
              <SelectItem value="proj-1" className="text-[12px] font-sans text-[#1A1917]">
                Q3 Supply Chain Audit 2024
              </SelectItem>
              <SelectItem value="proj-2" className="text-[12px] font-sans text-[#1A1917]">
                Decarbonization Initiative 2024
              </SelectItem>
              <SelectItem value="proj-3" className="text-[12px] font-sans text-[#1A1917]">
                Warehouse Process Optimization
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User initials avatar */}
        <div className="w-[28px] h-[28px] rounded-md bg-[#2D6A4F] text-[#E8F0EB] text-[11px] font-mono font-bold flex items-center justify-center border border-[#E2E0D8] select-none">
          RS
        </div>
      </div>
    </div>
  );
}
