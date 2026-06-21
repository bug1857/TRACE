'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Briefcase,
  LayoutGrid,
  Database,
  CheckCircle2,
  Zap,
  Coins,
  Leaf,
  Truck,
  FileText,
  FileSpreadsheet,
  Compass,
  Sparkles,
  Play,
  ShieldAlert,
  History,
  Settings
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'WORKSPACE',
    items: [
      { name: 'Organizations', href: '/organizations', icon: Building2 },
      { name: 'Projects', href: '/projects', icon: Briefcase },
      { name: 'Workspaces', href: '/workspaces', icon: LayoutGrid }
    ]
  },
  {
    label: 'PROCESS INTELLIGENCE',
    items: [
      { name: 'OCEL 2.0', href: '/ocel', icon: Database },
      { name: 'Conformance', href: '/conformance', icon: CheckCircle2 },
      { name: 'Process Optimization', href: '/process-optimization', icon: Zap }
    ]
  },
  {
    label: 'CARBON & ESG',
    items: [
      { name: 'Carbon Budget', href: '/carbon-budget', icon: Coins },
      { name: 'Carbon Fitness', href: '/carbon-fitness', icon: Leaf },
      { name: 'Supplier Fitness', href: '/supplier-fitness', icon: Truck },
      { name: 'ESG Report', href: '/esg-report', icon: FileText },
      { name: 'BRSR Report', href: '/brsr-report', icon: FileSpreadsheet },
      { name: 'Green Routes', href: '/green-routes', icon: Compass }
    ]
  },
  {
    label: 'AI INTELLIGENCE',
    items: [
      { name: 'Copilot', href: '/copilot', icon: Sparkles },
      { name: 'Simulation', href: '/simulation', icon: Play },
      { name: 'Sustainability Conf.', href: '/sustainability-conformance', icon: ShieldAlert }
    ]
  },
  {
    label: 'GOVERNANCE',
    items: [
      { name: 'Audit Logs', href: '/audit-logs', icon: History },
      { name: 'Settings', href: '/settings', icon: Settings }
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[220px] fixed top-0 bottom-0 left-0 bg-[#F3F2EE] border-r border-[#E2E0D8] flex flex-col z-20 no-print">
      {/* Header / Logo */}
      <div className="p-4 border-b border-[#E2E0D8] flex flex-col justify-center h-[56px]">
        <Link href="/organizations" className="font-mono text-lg font-bold tracking-tight text-[#1A1917] hover:opacity-80">
          TRACE.
        </Link>
        <span className="text-[10px] text-[#9B9891] tracking-normal font-sans -mt-0.5 leading-none">
          Process & Carbon Intelligence
        </span>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <span className="px-2 text-[10px] font-sans font-medium text-[#9B9891] tracking-widest block uppercase">
              {group.label}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-sans transition-colors rounded-[3px] select-none ${
                      isActive
                        ? 'bg-[#E8F0EB] border-l-2 border-[#2D6A4F] text-[#2D6A4F] font-medium pl-[10px]'
                        : 'text-[#6B6963] hover:bg-[#ECEAE4] pl-[12px]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2D6A4F]' : 'text-[#6B6963]'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer / Meta */}
      <div className="p-3 border-t border-[#E2E0D8] bg-[#ECEAE4] text-[11px] text-[#9B9891] font-mono text-center">
        v1.0.0 • Local Engine
      </div>
    </div>
  );
}
