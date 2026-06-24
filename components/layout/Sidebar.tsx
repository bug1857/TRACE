'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
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
  ShieldAlert,
  History,
  Settings,
  LineChart,
  Pencil,
  LayoutDashboard
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
    ]
  },
  {
    label: 'EMISSIONS',
    items: [
      { name: 'Carbon Budget', href: '/carbon-budget', icon: Coins },
      { name: 'Carbon Fitness', href: '/carbon-fitness', icon: Leaf },
      { name: 'Forecasting', href: '/forecasting', icon: LineChart },
      { name: 'Supplier Fitness', href: '/supplier-fitness', icon: Truck },
    ]
  },
  {
    label: 'REPORTS',
    items: [
      { name: 'ESG Report', href: '/esg-report', icon: FileText },
      { name: 'BRSR Report', href: '/brsr-report', icon: FileSpreadsheet },
      { name: 'Green Routes', href: '/green-routes', icon: Compass },
      { name: 'Process Optimization', href: '/process-optimization', icon: Zap },
    ]
  },
  {
    label: 'COMPLIANCE',
    items: [
      { name: 'OCEL 2.0 Upload', href: '/ocel', icon: Database },
      { name: 'Conformance', href: '/conformance', icon: CheckCircle2 },
      { name: 'Sustainability Conf.', href: '/sustainability-conformance', icon: ShieldAlert },
      { name: 'Copilot', href: '/copilot', icon: Sparkles },
      { name: 'Audit Logs', href: '/audit-logs', icon: History },
    ]
  },
  {
    label: 'SETTINGS',
    items: [
      { name: 'Organizations', href: '/organizations', icon: Building2 },
      { name: 'Settings', href: '/settings', icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [sliderStyle, setSliderStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const [prefersReduced, setPrefersReduced] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrefersReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    // We use a small delay to ensure DOM is updated before measuring
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const activeEl = containerRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        setSliderStyle({
          top: activeEl.offsetTop,
          height: activeEl.offsetHeight,
          opacity: 1
        });
      } else {
        setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  const [ripple, setRipple] = useState<{ id: number; x: number; y: number; rectId: string } | null>(null);
  const rippleCount = React.useRef(0);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    rippleCount.current += 1;
    setRipple({ id: rippleCount.current, x, y, rectId: href });
    setTimeout(() => setRipple(null), 600);
  }

  return (
    <div className="w-[220px] fixed top-0 bottom-0 left-0 bg-trace-surface backdrop-blur-xl border-r border-trace-border flex flex-col z-20 no-print">
      {/* Header / Logo */}
      <div className="p-4 border-b border-trace-border flex flex-col justify-center h-[56px]">
        <Link href="/organizations" className="font-mono text-lg font-bold tracking-tight text-trace-text hover:opacity-80 flex items-center justify-between">
          <span>TRACE.</span>
        </Link>
        <div className="flex items-center gap-1 mt-0.5">
          <Pencil className="w-[10px] h-[10px] text-trace-muted" />
          <span className="text-[10px] text-trace-muted tracking-normal font-sans leading-none">
            Process & Carbon Intelligence
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 relative" ref={containerRef}>
        {/* Sliding Indicator */}
        <div 
          className="absolute left-2 bg-trace-accent-light border-l-2 border-trace-accent rounded-[3px] pointer-events-none z-0"
          style={{
            top: sliderStyle.top,
            height: sliderStyle.height,
            opacity: sliderStyle.opacity,
            transition: prefersReduced ? 'none' : 'top 300ms cubic-bezier(0.34, 1.56, 0.64, 1), height 300ms ease, opacity 200ms',
            width: 'calc(100% - 16px)'
          }}
        />

        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1 relative z-10">
            <span className="px-2 text-[10px] font-sans font-medium text-trace-subtle tracking-widest block uppercase">
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
                    data-active={isActive}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`relative flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-sans transition-colors rounded-[3px] select-none overflow-hidden ${
                      isActive
                        ? 'text-trace-accent font-medium pl-[10px] border-l-2 border-transparent bg-transparent'
                        : 'text-trace-muted hover:bg-white/5 pl-[12px]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive && !prefersReduced ? 'text-trace-accent scale-110' : 'text-trace-muted'}`} />
                    <span>{item.name}</span>
                    
                    {/* Ripple */}
                    {ripple?.rectId === item.href && (
                      <span
                        className="absolute bg-trace-accent/20 rounded-full pointer-events-none"
                        style={{
                          left: ripple.x,
                          top: ripple.y,
                          transform: 'translate(-50%, -50%)',
                          width: '150px',
                          height: '150px',
                          animation: 'rippleAnim 600ms linear forwards'
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer / Meta */}
      <div className="p-3 border-t border-trace-border bg-white/5 backdrop-blur-sm text-[11px] text-trace-muted font-mono text-center">
        v1.0.0 • Local Engine
      </div>
    </div>
  );
}
