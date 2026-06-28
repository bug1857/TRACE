/* eslint-disable */
'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useDockMagnification } from '@/hooks/useDockMagnification';
import { DockSidebarItem } from '@/components/DockSidebarItem';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Briefcase,
  LayoutGrid,
  LayoutDashboard,
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
  Settings,
  TrendingUp
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
    label: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Executive', href: '/executive', icon: LayoutDashboard }
    ]
  },
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
      { name: 'Green Routes', href: '/green-routes', icon: Compass },
      { name: 'Forecasting', href: '/forecasting', icon: TrendingUp }
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

  const ALL_NAV_ITEMS = navGroups.flatMap(group => group.items);
  const itemRefs = useRef<Array<{ current: HTMLElement | null }>>(ALL_NAV_ITEMS.map(() => ({ current: null })));
  const { springScales, onMouseMove, onMouseLeave } =
    useDockMagnification(ALL_NAV_ITEMS.length);

  return (
    <div className="w-[220px] fixed top-0 bottom-0 left-0 bg-[var(--card)] border-r border-[var(--border)] flex flex-col z-20 no-print">
      {/* Header / Logo */}
      <div className="px-4 border-b border-[var(--border)] flex items-center h-[56px] shrink-0">
        <Link href="/organizations" className="hover:opacity-80 block -ml-2.5">
          <svg className="w-[110px] h-[36px] text-[var(--foreground)]" viewBox="0 0 85 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="10" y="18" fill="currentColor" className="font-mono font-bold tracking-tight" style={{ fontSize: '16px', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>TRACE</text>
            <circle cx="63" cy="16.5" r="1.5" fill="currentColor" />
            <path d="M 63 16.5 C 63 20, 68 24, 75 24" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Flipped horizontal pencil (eraser on left, tip on right pointing right) */}
            {/* Eraser */}
            <path d="M 8 22.25 H 5 C 3.5 22.25, 3 23, 3 24 C 3 25, 3.5 25.75, 5 25.75 H 8 Z" fill="#FCA5A5" />
            {/* Ferrule */}
            <path d="M 8 22.25 H 13 V 25.75 H 8 Z" fill='var(--trace-subtle)' />
            {/* Body */}
            <path d="M 13 22.25 H 65 V 25.75 H 13 Z" fill='var(--primary)' />
            {/* Wood */}
            <path d="M 71 22.6 L 71 25.4 L 65 25.75 L 65 22.25 Z" fill='var(--border)' />
            {/* Tip */}
            <path d="M 71 22.6 L 71 25.4 L 75 24 Z" fill='var(--foreground)' />
          </svg>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav
        className="flex-1 overflow-y-auto py-3 px-2 space-y-4"
        onMouseMove={(e) => onMouseMove(e as React.MouseEvent<HTMLElement>, itemRefs.current)}
        onMouseLeave={onMouseLeave}
      >
        {navGroups.map((group, groupIdx) => {
          const startIndex = navGroups.slice(0, groupIdx).reduce((acc, g) => acc + g.items.length, 0);
          return (
            <div key={group.label} className="space-y-1">
            <span className="px-2 text-[10px] font-sans font-medium text-[var(--trace-subtle)] tracking-widest block uppercase">
              {group.label}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item, itemIdx) => {
                const globalIdx = startIndex + itemIdx;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <DockSidebarItem
                    key={item.href}
                    ref={itemRefs.current[globalIdx] as React.RefObject<HTMLDivElement>}
                    scale={springScales[globalIdx]}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-sans transition-all duration-200 ease-in-out hover:scale-[1.02] rounded-[3px] select-none ${
                        isActive
                          ? 'bg-[var(--accent)] border-l-2 border-[var(--primary)] text-[var(--primary)] font-medium pl-[10px]'
                          : 'text-[var(--muted-foreground)] hover:bg-[#ECEAE4] pl-[12px]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  </DockSidebarItem>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>
      
      {/* Footer / Meta */}
      <div className="p-3 border-t border-[var(--border)] bg-[#ECEAE4] text-[11px] text-[var(--trace-subtle)] font-mono text-center">
        v1.0.0 • Local Engine
      </div>
    </div>
  );
}
