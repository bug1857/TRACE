# TRACE Application - Page Summaries & Code

## app/layout.tsx

**Summary**: Root Layout. Defines the global HTML structure, imports global CSS and fonts (Inter, JetBrains Mono). It also wraps the application in the TRACE Providers (Contexts for Workspace, Analysis, etc.).

### Code

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "TRACE. — Enterprise Process Mining & ESG Intelligence",
  description: "Process & Carbon Intelligence Platform for real-time compliance, carbon tracking, and operational efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

```

---

## app/page.tsx

**Summary**: Landing Page. Displays the marketing homepage, hero section, and a navigation bar. It acts as the entry point to the application, providing a reference to TRACE platform.

### Code

```tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-[#2DD4BF]/20 relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.03)_0%,_transparent_60%)] pointer-events-none" />
      
      {/* 1. Top nav bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4 border-b border-white/[0.06] bg-[#0A0A0A]/80 backdrop-blur-xl">
        <span className="text-sm font-mono text-[#E6EDF3] tracking-widest">TRACE.</span>
        <div className="flex items-center gap-8">
          <button 
            onClick={() => document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs text-[#7D8590] hover:text-[#E6EDF3] transition-colors font-mono tracking-wider"
          >
            DOCS
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs font-mono tracking-wider px-4 py-2 rounded-lg border border-[#2DD4BF]/30 text-[#2DD4BF] hover:bg-[#2DD4BF]/10 transition-all"
          >
            OPEN PLATFORM →
          </button>
        </div>
      </nav>

      {/* 2. Hero section */}
      <section className="min-h-screen pt-32 pb-24 px-10 flex flex-col justify-center max-w-4xl mx-auto relative z-10">
        <p className="text-xs font-mono text-[#2DD4BF] tracking-[0.2em] mb-6">
          OCEL 2.0 · SCOPE 3 EMISSIONS · BRSR COMPLIANCE
        </p>
        <h1 className="text-7xl font-semibold tracking-tight text-[#E6EDF3] leading-[1.1] mb-8">
          Supply Chain Audits<br />
          <span className="text-[#2DD4BF]">That Actually Compute.</span>
        </h1>
        <p className="text-lg text-[#7D8590] max-w-xl leading-relaxed mb-10">
          Upload an OCEL 2.0 event log. Get violations, carbon budgets, BRSR reports, 
          and supplier fitness scores instantly.
        </p>
        <div className="flex items-center gap-4 mb-16">
          <button
            onClick={() => router.push('/ocel')}
            className="px-6 py-3 rounded-lg bg-[#2DD4BF] text-[#0A0A0A] text-sm font-semibold tracking-wide hover:bg-[#2DD4BF]/90 transition-all"
          >
            Start Audit →
          </button>
          <button
            onClick={() => document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 rounded-lg border border-white/[0.08] text-[#7D8590] text-sm font-mono tracking-wider hover:text-[#E6EDF3] hover:border-white/[0.15] transition-all"
          >
            Documentation
          </button>
        </div>
        
        {/* 3-item feature list */}
        <div className="flex flex-col gap-3 mt-2">
          {[
            ['Process Mining', 'DFG extraction, conformance checking, bottleneck detection'],
            ['Carbon Intelligence', 'Scope 3 attribution, CFS scoring, green route recommendations'],
            ['ESG Reporting', 'BRSR-ready reports, audit logs, supplier compliance ledger'],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#2DD4BF] flex-shrink-0" />
              <div>
                <span className="text-sm text-[#E6EDF3] font-medium">{title} — </span>
                <span className="text-sm text-[#7D8590]">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Docs section */}
      <section id="docs" className="relative z-10 border-t border-white/[0.06] py-24 px-10 max-w-7xl mx-auto">
        <p className="text-xs font-mono text-[#2DD4BF] tracking-[0.2em] mb-3">DOCUMENTATION</p>
        <h2 className="text-3xl font-semibold text-[#E6EDF3] mb-12">Platform Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ['Overview', 'OCEL 2.0 object-centric event log ingestion with automatic column mapping and DFG extraction.'],
            ['Quick Start', 'Upload a CSV with case ID, activity, and timestamp columns. Analysis completes instantly.'],
            ['Architecture', 'Next.js 16 frontend, FastAPI backend, SQLite storage. Single upload populates all modules.'],
            ['CSV Upload', 'Accepts OCEL 2.0 CSV and XML. Required columns: case ID, activity name, timestamp. All others optional.'],
            ['Modules', 'Process Mining, Carbon Budget, Carbon Fitness, Supplier Fitness, Conformance, Forecasting, ESG/BRSR Reports.'],
            ['API Reference', 'POST /api/ocel/upload — main ingestion. Returns metadata, nodes, edges, carbon data, violations, forecasting.'],
            ['Configuration', 'Conformance rules, emission factor overrides, and team access managed per-workspace in Settings.'],
            ['Demo Dataset', 'trace_demo_dataset.csv in repo root. 800 cases, 4,231 events, Jan–Dec 2025. 368 violations baseline.'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6">
              <p className="text-xs font-mono text-[#2DD4BF] tracking-wider mb-2">{title.toUpperCase()}</p>
              <p className="text-sm text-[#7D8590] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


```

---

## app/(auth)/login/page.tsx

**Summary**: Login Page. Provides a simulated authentication form with email and password. It allows users to log into the application.

### Code

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // Simulate authentication
    router.push('/organizations');
  };

  return (
    <div className="min-h-screen bg-white/5 backdrop-blur-md flex flex-col justify-center items-center px-4 select-none">
      <div className="w-full max-w-[360px] bg-white/5 backdrop-blur-md border border-trace-border p-6 rounded-md shadow-sm">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-trace-text">
            TRACE.
          </h1>
          <p className="text-[12px] text-trace-muted font-sans mt-1">
            Process & Carbon Intelligence Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-400/10 border border-[var(--destructive)]/20 text-rose-400 text-[12px] rounded-md font-sans">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-sans font-medium text-trace-muted uppercase tracking-wider block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[34px] text-[13px] bg-white/5 border-trace-border text-trace-text rounded-md focus:border-trace-accent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-sans font-medium text-trace-muted uppercase tracking-wider block">
                Password
              </label>
              <a href="#" className="text-[11px] text-trace-accent hover:underline font-sans">
                Forgot?
              </a>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[34px] text-[13px] bg-white/5 border-trace-border text-trace-text rounded-md focus:border-trace-accent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-[36px] bg-trace-accent hover:bg-trace-accent/80 text-white text-[13px] font-sans font-medium rounded-md transition-colors mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-trace-border text-center">
          <p className="text-[12px] text-trace-muted font-sans">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-trace-accent font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

```

---

## app/(auth)/register/page.tsx

**Summary**: Registration Page. Provides a simulated form for new users to create an account, entering organization name, email, and password.

### Code

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // Simulate user creation
    router.push('/organizations');
  };

  return (
    <div className="min-h-screen bg-white/5 backdrop-blur-md flex flex-col justify-center items-center px-4 select-none">
      <div className="w-full max-w-[360px] bg-white/5 backdrop-blur-md border border-trace-border p-6 rounded-md shadow-sm">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-trace-text">
            TRACE.
          </h1>
          <p className="text-[12px] text-trace-muted font-sans mt-1">
            Process & Carbon Intelligence Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-400/10 border border-[var(--destructive)]/20 text-rose-400 text-[12px] rounded-md font-sans">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-sans font-medium text-trace-muted uppercase tracking-wider block">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Rajesh Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-[34px] text-[13px] bg-white/5 border-trace-border text-trace-text rounded-md focus:border-trace-accent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-sans font-medium text-trace-muted uppercase tracking-wider block">
              Work Email
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[34px] text-[13px] bg-white/5 border-trace-border text-trace-text rounded-md focus:border-trace-accent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-sans font-medium text-trace-muted uppercase tracking-wider block">
              Password
            </label>
            <Input
              type="password"
              placeholder="Create strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[34px] text-[13px] bg-white/5 border-trace-border text-trace-text rounded-md focus:border-trace-accent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-[36px] bg-trace-accent hover:bg-trace-accent/80 text-white text-[13px] font-sans font-medium rounded-md transition-colors mt-2"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-trace-border text-center">
          <p className="text-[12px] text-trace-muted font-sans">
            Already have an account?{' '}
            <Link href="/login" className="text-trace-accent font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

```

---

## app/(dashboard)/layout.tsx

**Summary**: Dashboard Layout. Defines the shell for all authenticated routes. Includes a Sidebar for navigation and a Topbar for global actions. Wraps its children in a main content area.

### Code

```tsx
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { PageTransitionWrapper } from "@/components/PageTransitionWrapper";

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
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </main>
      </div>
    </div>
  );
}

```

---

## app/(dashboard)/dashboard/page.tsx

**Summary**: Main Dashboard. Displays key performance indicators (KPIs) and a high-level process flow chart. Shows an overview of the active project's event log data.

### Code

```tsx
'use client';

import React from 'react';
import { useAnalysis } from '@/lib/AnalysisContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { ArrowUp, ArrowDown, Database } from 'lucide-react';

const categoryLabel: Record<string, string> = {
  air_freight: 'Air Freight Hub',
  road_transport: 'Road Transport',
  warehouse: 'Warehouse Ops',
  customs: 'Customs Clearance',
  last_mile: 'Last Mile Delivery',
  uncategorized: 'General Operations'
};

export default function DashboardPage() {
  const { analysis } = useAnalysis();

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const hasAnalysis = !!analysis;
  
  // Calculations
  const totalCarbonKg = analysis?.totalCarbonKg || null;
  const totalCarbonFormatted = analysis?.totalCarbonKg?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '—';
  
  const intensity = totalCarbonKg !== null ? (totalCarbonKg / (analysis?.metadata?.rowCount || 1)).toFixed(1) : '—';
  
  const avgCfs = analysis?.cfsScores?.length
    ? analysis.cfsScores.reduce((sum: number, c: any) => sum + (c.cfsScore || 0), 0) / analysis.cfsScores.length
    : null;
  const netZeroFormatted = avgCfs !== null ? `${Math.min(Math.round(avgCfs * 100), 100)}%` : '—';

  const energyKwh = analysis?.brsrReport?.sectionC?.resourceDraw?.energyKwh;
  const energyFormatted = energyKwh ? (energyKwh / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—';

  // Chart data
  const areaData = analysis?.carbonBudget || [];
  
  const scopeData = hasAnalysis && totalCarbonKg !== null ? [
    { name: 'Scope 1', value: totalCarbonKg * 0.55, color: 'var(--primary)' },
    { name: 'Scope 2', value: totalCarbonKg * 0.35, color: '#475569' },
    { name: 'Scope 3', value: totalCarbonKg * 0.10, color: '#0F766E' },
  ] : [];

  const recentData = analysis?.activityCarbonBreakdown?.slice(0, 5) || [];

  if (!hasAnalysis) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.03)_0%,_transparent_60%)] pointer-events-none" />
        <div className="flex flex-col flex-1 items-center justify-center min-h-[400px] relative z-10">
          <Database className="w-12 h-12 text-trace-muted mb-4 opacity-50" />
          <p className="text-trace-muted text-[13px] font-sans">
            Upload a CSV on the OCEL page to populate this dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.03)_0%,_transparent_60%)] pointer-events-none" />
      <div className="flex flex-col flex-1 pt-2 pb-10 relative z-10">
        {/* 1. Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[13px] text-trace-muted font-mono tracking-tight uppercase">
            Enterprise Carbon Tracking Dashboard
          </h1>
          <span className="text-[12px] text-trace-muted font-sans">
            {currentDate}
          </span>
        </div>

        {/* 2. KPI Strip */}
        <div className="grid grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 flex flex-col justify-between h-[110px] border-l-2 border-l-trace-accent">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-trace-accent shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
            
            <span className="text-[11px] text-trace-muted uppercase tracking-wider font-sans relative z-10">
              Total Emissions
            </span>
            <div className="mt-2 flex items-baseline gap-1 relative z-10">
              <span className="text-[28px] font-mono font-bold text-trace-text leading-none">
                {totalCarbonFormatted}
              </span>
              {totalCarbonKg !== null && <span className="text-trace-muted text-[13px] font-sans">tCO₂e</span>}
            </div>
            <div className="mt-auto flex items-center gap-1 text-trace-success text-[11px] font-sans relative z-10">
              <ArrowUp className="w-3 h-3" />
              <span>18% YoY</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 flex flex-col justify-between h-[110px] border-l-2 border-l-trace-success">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-trace-success shadow-[0_0_8px_rgba(63,185,80,0.6)]" />

            <span className="text-[11px] text-trace-muted uppercase tracking-wider font-sans relative z-10">
              Carbon Intensity
            </span>
            <div className="mt-2 flex items-baseline gap-1 relative z-10">
              <span className="text-[28px] font-mono font-bold text-trace-text leading-none">
                {intensity}
              </span>
              {intensity !== '—' && <span className="text-trace-muted text-[13px] font-sans">tCO₂/M$</span>}
            </div>
            <div className="mt-auto flex items-center gap-1 text-trace-success text-[11px] font-sans relative z-10">
              <ArrowDown className="w-3 h-3" />
              <span>12% YoY</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 flex flex-col justify-between h-[110px] border-l-2 border-l-trace-warning">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-trace-warning shadow-[0_0_8px_rgba(210,153,34,0.6)]" />

            <span className="text-[11px] text-trace-muted uppercase tracking-wider font-sans relative z-10">
              Net Zero Progress
            </span>
            <div className="mt-2 relative z-10">
              <span className="text-[28px] font-mono font-bold text-trace-success leading-none">
                {netZeroFormatted}
              </span>
            </div>
            <div className="mt-auto flex items-center gap-1 text-trace-success text-[11px] font-sans relative z-10">
              <ArrowUp className="w-3 h-3" />
              <span>15%</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 flex flex-col justify-between h-[110px] border-l-2 border-l-trace-danger">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-trace-danger shadow-[0_0_8px_rgba(248,81,73,0.6)]" />

            <span className="text-[11px] text-trace-muted uppercase tracking-wider font-sans relative z-10">
              Energy Use
            </span>
            <div className="mt-2 flex items-baseline gap-1 relative z-10">
              <span className="text-[28px] font-mono font-bold text-trace-text leading-none">
                {energyFormatted}
              </span>
              {energyFormatted !== '—' && <span className="text-trace-muted text-[13px] font-sans">GWh</span>}
            </div>
            <div className="mt-auto flex items-center gap-1 text-trace-success text-[11px] font-sans relative z-10">
              <ArrowDown className="w-3 h-3" />
              <span>3%</span>
            </div>
          </div>
        </div>

        {/* 3. Two-column grid */}
        <div className="grid grid-cols-[1fr_300px] gap-4 mt-4">
          {/* LEFT */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 flex flex-col">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h2 className="text-[13px] font-sans font-medium text-trace-text">Emissions Trend Over Time</h2>
              <span className="text-[11px] font-mono bg-white/[0.05] text-trace-muted px-2 py-0.5 rounded">2025</span>
            </div>
            <div className="w-full mt-2 relative z-10">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor='var(--primary)' stopOpacity={0.3}/>
                      <stop offset="95%" stopColor='var(--primary)' stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#7D8590' }} stroke="#484F58" tickLine={false} axisLine={false} dy={10} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#7D8590' }} 
                    stroke="#484F58" 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 11 }}
                    itemStyle={{ fontSize: 11 }}
                    labelStyle={{ color: 'var(--trace-subtle)', marginBottom: 4 }}
                  />
                  <Area type="monotone" dataKey="actual" stroke='var(--primary)' fill="url(#actualGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-sans text-trace-muted relative z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-trace-accent"></div>
                <span>Scope 1</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 flex flex-col h-full">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <h2 className="text-[13px] font-sans font-medium text-trace-text mb-2 relative z-10">Emissions By Scope</h2>
              <div className="h-[160px] w-full relative flex items-center justify-center z-10">
                {hasAnalysis && totalCarbonKg !== null ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scopeData}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {scopeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 11 }}
                        itemStyle={{ fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-trace-muted font-sans text-[12px]">—</span>
                )}
              </div>
              {hasAnalysis && totalCarbonKg !== null && (
                <div className="mt-auto space-y-2 relative z-10">
                  {scopeData.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-sans">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className="text-trace-muted">{s.name}</span>
                      </div>
                      <span className="text-trace-text font-mono font-medium">{s.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <h2 className="text-[12px] font-sans font-medium text-trace-text mb-4 relative z-10">Reduction Targets</h2>
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="flex justify-between text-[11px] font-sans mb-1.5">
                    <span className="text-trace-muted">Progress</span>
                    <span className="text-trace-text font-mono font-medium">64%</span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden relative">
                    <div className="bg-trace-accent h-full rounded-full w-[64%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-sans mb-1.5">
                    <span className="text-trace-muted">Reduction</span>
                    <span className="text-trace-text font-mono font-medium">28%</span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden relative">
                    <div className="bg-trace-success h-full rounded-full w-[28%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Recent Emissions Data */}
        <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 mt-4">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <h2 className="text-[13px] font-sans font-medium text-trace-text">Recent Emissions Data</h2>
            <span className="text-[11px] text-trace-muted font-sans">(Oct 2023)</span>
          </div>
          
          {hasAnalysis && recentData.length > 0 ? (
            <div className="w-full relative z-10">
              <div className="grid grid-cols-7 text-[10px] text-trace-muted uppercase tracking-wider border-b border-white/[0.07] pb-2 font-sans">
                <div>Date</div>
                <div className="col-span-2">Site</div>
                <div>Activity</div>
                <div className="text-right">Scope</div>
                <div className="text-right">Quantity</div>
                <div className="text-right">Change</div>
              </div>
              <div className="flex flex-col">
                {recentData.map((row: any, i: number) => {
                  const categoryName = (row.category || '').split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  return (
                    <div key={i} className="grid grid-cols-7 py-2.5 text-[12px] font-sans text-trace-text border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors items-center">
                      <div className="text-trace-muted">10/25</div>
                      <div className="truncate pr-4 col-span-2">
                        {categoryLabel[row.category] ?? (row.activityName || row.activity)}
                      </div>
                      <div className="text-trace-subtle text-[11px]">
                        {categoryName}
                      </div>
                      <div className="text-right text-trace-muted">2</div>
                      <div className="text-right font-mono text-trace-accent">
                        {row.totalCarbon ? row.totalCarbon.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—'}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${i % 2 === 0 ? 'bg-trace-success/10 text-trace-success' : 'bg-trace-danger/10 text-trace-danger'}`}>
                          {i % 2 === 0 ? '↓ 2.1%' : '↑ 1.4%'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-trace-muted text-[12px] font-sans relative z-10">
              No recent data available.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

```

---

## app/(dashboard)/process-optimization/page.tsx

**Summary**: Process Optimization. Visualizes rework loops and bottlenecks in the process using charts (Recharts). It helps identify inefficiencies in the supply chain.

### Code

```tsx
'use client';

import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAnalysis } from '@/lib/AnalysisContext';
import { mockBottlenecks, mockReworks } from '@/lib/mockData';
import { BottleneckActivity, ReworkActivity } from '@/lib/types';
import SectionDivider from '@/components/shared/SectionDivider';

export default function ProcessOptimizationPage() {
  const { analysis } = useAnalysis();

  const isReal = !!(analysis && analysis.processOptimization);

  // Derive bottlenecks
  const bottlenecks: BottleneckActivity[] = isReal
    ? analysis.processOptimization.bottlenecks.map((b) => ({
        activity: b.activity,
        avgWaitTime: b.avgWaitHours,
        occurrences: b.occurrences,
        status:
          b.status === 'moderate'
            ? 'warning'
            : b.status === 'optimized'
            ? 'pass'
            : 'critical',
      }))
    : mockBottlenecks;

  // Derive reworks
  const reworks: ReworkActivity[] = isReal
    ? analysis.processOptimization.rework.map((r) => ({
        activity: r.activity,
        reworkCount: r.reworkCount,
        reworkPercent: r.reworkPercentage,
        carbonImpact: r.carbonImpactKg,
      }))
    : mockReworks;

  // Derive case duration distribution
  const durationBuckets = isReal
    ? analysis.processOptimization.caseDurationDistribution.map((d) => ({
        range: d.bucket === '24h+' ? '24+ hours' : d.bucket.replace('h', ' hours'),
        count: d.count,
        percentage: d.percentage,
      }))
    : [
        { range: '0-4 hours', count: 18, percentage: 20 },
        { range: '4-8 hours', count: 32, percentage: 36 },
        { range: '8-12 hours', count: 24, percentage: 27 },
        { range: '12-24 hours', count: 11, percentage: 12 },
        { range: '24+ hours', count: 4, percentage: 5 },
      ];

  const totalCases = isReal ? analysis.processOptimization.totalCasesAnalyzed : 89;

  // Custom cell coloring for average wait times
  const getWaitTimeStyle = (row: BottleneckActivity) => {
    if (row.status === 'critical') {
      return {
        bg: 'bg-[var(--trace-danger-light)]',
        text: 'text-[var(--destructive)]',
      };
    }
    if (row.status === 'warning') {
      return {
        bg: 'bg-[var(--trace-warning-light)]',
        text: 'text-[var(--trace-warning)]',
      };
    }
    return {
      bg: 'bg-[var(--trace-success-light)]',
      text: 'text-[var(--trace-success)]',
    };
  };

  const bottleneckColumns: Column<BottleneckActivity>[] = [
    {
      header: 'Activity',
      accessorKey: 'activity',
      sortable: true,
    },
    {
      header: 'Average Wait Time',
      accessorKey: 'avgWaitTime',
      isNumeric: true,
      sortable: true,
      cell: (row) => {
        const style = getWaitTimeStyle(row);
        return (
          <div
            className={`py-1.5 px-3 -mx-4 -my-2 font-mono font-medium rounded-sm text-center ${style.bg} ${style.text}`}
          >
            {row.avgWaitTime.toFixed(1)} h
          </div>
        );
      },
    },
    {
      header: 'Occurrences',
      accessorKey: 'occurrences',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.occurrences !== undefined ? row.occurrences : '—'}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        const statusMap: Record<string, string> = {
          critical: 'Critical Queue',
          warning: 'Moderate Delay',
          pass: 'Optimized Workflow',
        };
        return <StatusBadge status={row.status} label={statusMap[row.status]} />;
      },
    },
  ];

  const reworkColumns: Column<ReworkActivity>[] = [
    {
      header: 'Activity',
      accessorKey: 'activity',
      sortable: true,
    },
    {
      header: 'Rework Count',
      accessorKey: 'reworkCount',
      isNumeric: true,
      sortable: true,
    },
    {
      header: 'Rework Percentage',
      accessorKey: 'reworkPercent',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.reworkPercent.toFixed(1)}%</span>,
    },
    {
      header: 'Carbon Impact',
      accessorKey: 'carbonImpact',
      isNumeric: true,
      sortable: true,
      cell: (row) => (
        <span className="text-[var(--destructive)]">+{row.carbonImpact.toLocaleString()} kg CO₂e</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <DemoDataBanner show={!isReal} />
      <PageHeader
        title="Process Optimization"
        subtitle="Identify operational bottlenecks, rework loops, and analyze their direct carbon emissions overhead."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Bottleneck Heatmap */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
            Bottleneck Queue Heatmap
          </h3>
          <DataTable columns={bottleneckColumns} data={bottlenecks} />
        </div>

        {/* Right Column: Rework Rate */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
            Rework Rates & Carbon Overhead
          </h3>
          <DataTable columns={reworkColumns} data={reworks} />
        </div>
      </div>

      <SectionDivider />

      {/* Bottom Section: Duration Distribution Chart */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
            Case Duration Distribution
          </h3>
          <p className="text-[12px] text-[var(--muted-foreground)] font-sans">
            Distribution showing the elapsed duration range across all {totalCases} analyzed cases.
          </p>
        </div>

        <div className="border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm">
          {/* Observable Plot Mock Chart */}
          <div className="space-y-4 max-w-[700px] select-none">
            {durationBuckets.map((bucket) => (
              <div key={bucket.range} className="flex items-center gap-4 text-[13px]">
                {/* Bucket label */}
                <div className="w-[100px] text-right text-[var(--muted-foreground)] font-sans shrink-0 font-medium">
                  {bucket.range}
                </div>

                {/* Horizontal Bar */}
                <div className="flex-1 bg-[var(--card)] h-[22px] border border-[var(--border)] rounded-[3px] overflow-hidden flex items-center">
                  <div
                    style={{ width: `${bucket.percentage}%` }}
                    className="bg-[var(--primary)] h-full flex items-center justify-end px-2 text-[10px] font-mono font-medium text-white transition-all"
                  >
                    {bucket.percentage}%
                  </div>
                </div>

                {/* Numeric value */}
                <div className="w-[80px] font-mono text-[var(--foreground)] text-left shrink-0">
                  {bucket.count} cases
                </div>
              </div>
            ))}

            {/* X-Axis labels */}
            <div className="flex justify-between text-[10px] text-[var(--trace-subtle)] border-t border-[var(--border)] pt-1.5 pl-[116px] font-mono">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## app/(dashboard)/organizations/page.tsx

**Summary**: Organizations Management. Allows users to create, view, and delete organizations. Uses a mock backend API to manage state.

### Code

```tsx
'use client';

import React, { useState } from 'react';
import { Building2, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useWorkspace, BackendOrganization } from '@/lib/WorkspaceContext';
import { createOrganization, deleteOrganization } from '@/lib/api';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function OrganizationsPage() {
  const {
    organizations,
    activeOrgId,
    setActiveOrgId,
    refreshOrganizations
  } = useWorkspace();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setValidationError('Please enter organization name.');
      return;
    }

    try {
      const created = await createOrganization(newName.trim());
      await refreshOrganizations();
      if (created?.id) {
        setActiveOrgId(created.id);
      }
      setNewName('');
      setValidationError('');
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      setValidationError('Failed to create organization on backend.');
    }
  };

  const handleDeleteOrg = async (id: number) => {
    try {
      await deleteOrganization(id);
      const remaining = await refreshOrganizations();
      if (activeOrgId === id) {
        if (remaining.length > 0) {
          setActiveOrgId(remaining[0].id);
        } else {
          setActiveOrgId(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete organization on backend.');
    }
  };

  const columns: Column<BackendOrganization>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[var(--muted-foreground)]" />
          <span className="font-medium text-[var(--foreground)]">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      cell: (row) => (
        <span className="text-[var(--muted-foreground)] text-[13px]">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => {
        const isActive = activeOrgId === row.id;
        return (
          <div className="flex items-center gap-2">
            {!isActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveOrgId(row.id)}
                className="h-[28px] text-[11px] font-sans text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
              >
                <span>Activate</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            ) : (
              <span className="text-[11px] font-medium text-[var(--primary)] bg-[var(--accent)] px-2.5 py-1 rounded-md">
                Active
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("WARNING: Deleting this organization will trigger a CASCADE DELETE on the backend. This permanently removes all associated projects, workspaces, and audit analysis logs. Are you sure you want to proceed?")) {
                  handleDeleteOrg(row.id);
                }
              }}
              className="h-[28px] w-[28px] p-0 text-[var(--destructive)] hover:bg-[var(--trace-danger-light)] hover:text-[var(--destructive)] rounded-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Organizations"
        subtitle="Manage your enterprise divisions and operational entities."
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Organization</span>
            </Button>
          </div>
        }
      />

      {organizations.length > 0 ? (
        <DataTable columns={columns} data={organizations} />
      ) : (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Create your first organization to begin process mining and carbon audit analyses."
          actionText="Create Organization"
          onAction={() => setIsDialogOpen(true)}
        />
      )}

      {/* New Organization Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[400px] bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[var(--foreground)]">
              New Organization
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateOrg} className="space-y-4 py-2">
            {validationError && (
              <div className="p-2 bg-[var(--trace-danger-light)] text-[var(--destructive)] text-[11px] font-sans rounded-md border border-[var(--destructive)]/10">
                {validationError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                Organization Name
              </label>
              <Input
                placeholder="e.g. Louis India Pvt. Ltd."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                  setValidationError('');
                }}
                className="h-[32px] text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-[32px] text-[12px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white rounded-md"
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

---

## app/(dashboard)/audit-logs/page.tsx

**Summary**: Audit Logs. Displays a ledger of user and system actions. Includes functionality to export these logs to a CSV file.

### Code

```tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Download, Search, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { mockAuditLogs } from '@/lib/mockData';
import { AuditLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAuditLogs } from '@/lib/api';

interface BackendAuditLog {
  id: number;
  timestamp: string;
  action_type: string;
  target: string;
  details?: string;
  project_id?: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isRealData, setIsRealData] = useState(false);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchUser, setSearchUser] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    let active = true;
    getAuditLogs()
      .then((data) => {
        if (!active) return;
        if (data && data.length > 0) {
          const mappedLogs: AuditLog[] = data.map((item: BackendAuditLog) => ({
            id: String(item.id),
            timestamp: item.timestamp,
            user: '—',
            action: item.action_type,
            target: item.target,
            ip: '—',
            status: 'success',
            details: item.details
          }));
          setLogs(mappedLogs);
          setIsRealData(true);
        } else {
          setLogs(mockAuditLogs);
          setIsRealData(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch audit logs:', err);
        if (!active) return;
        setLogs(mockAuditLogs);
        setIsRealData(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const escapeCSV = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Timestamp', 'User', 'Action', 'Target/Entity', 'Details', 'IP Address', 'Status'];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.user,
      log.action,
      log.target,
      log.details || '',
      log.ip,
      log.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setFeedbackMsg('Audit logs exported to CSV successfully.');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchAction = filterAction === 'ALL' || log.action === filterAction;
      const matchUser = isRealData
        ? true
        : searchUser.trim() === '' || log.user.toLowerCase().includes(searchUser.toLowerCase());
      return matchAction && matchUser;
    });
  }, [logs, filterAction, searchUser, isRealData]);

  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      sortable: true,
      cell: (row) => <span className="font-mono text-[var(--foreground)]">{row.timestamp}</span>
    },
    {
      header: 'User',
      accessorKey: 'user',
      sortable: true,
      cell: (row) => <span className="font-sans font-medium">{row.user}</span>
    },
    {
      header: 'Action',
      accessorKey: 'action',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[11px] text-[var(--primary)] bg-[var(--accent)] px-2 py-0.5 border border-[var(--primary)]/10 rounded-sm">
          {row.action}
        </span>
      )
    },
    {
      header: 'Target / Entity',
      accessorKey: 'target',
      sortable: true
    },
    {
      header: 'Details',
      accessorKey: 'details',
      cell: (row) => <span className="font-sans text-[var(--muted-foreground)]">{row.details || '—'}</span>
    },
    {
      header: 'IP Address',
      accessorKey: 'ip',
      sortable: true,
      cell: (row) => <span className="font-mono text-[var(--muted-foreground)]">{row.ip}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        const isSuccess = row.status === 'success';
        return (
          <span className={`inline-flex items-center gap-1 font-sans font-medium text-[12px] ${
            isSuccess ? 'text-[var(--trace-success)]' : 'text-[var(--destructive)]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-[var(--trace-success)]' : 'bg-[var(--destructive)]'}`} />
            <span>{isSuccess ? 'Success' : 'Failed'}</span>
          </span>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Audit Logs Ledger"
        subtitle="System compliance and security action trails tracking user inputs, configuration updates, and report generations."
        action={
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        }
      />

      <DemoDataBanner show={!isRealData} />

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-[var(--trace-success-light)] border border-[var(--trace-success)]/10 text-[var(--trace-success)] text-[13px] rounded-md font-sans flex items-center gap-2 select-none">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Search Filter Panel */}
      <div className="border border-[var(--border)] bg-[var(--background)] p-4 rounded-md shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center select-none">
        
        {/* Filter 1: Search by User */}
        <div className="space-y-1">
          <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
            Filter by Auditor User
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--trace-subtle)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="e.g. rajesh.sharma@louisindia.com"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              disabled={isRealData}
              className="h-[32px] text-[12px] pl-8 bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)] disabled:opacity-50"
            />
          </div>
        </div>

        {/* Filter 2: Search by Action Type */}
        <div className="space-y-1">
          <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
            Filter by Action Type
          </label>
          <Select value={filterAction} onValueChange={(val) => setFilterAction(val || 'ALL')}>
            <SelectTrigger className="h-[32px] text-[12px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--background)] border-[var(--border)] rounded-md">
              <SelectItem value="ALL" className="text-[12px]">All Audit Actions</SelectItem>
              <SelectItem value="RUN_SIMULATION" className="text-[12px]">RUN_SIMULATION</SelectItem>
              <SelectItem value="UPLOAD_OCEL_LOG" className="text-[12px]">UPLOAD_OCEL_LOG</SelectItem>
              <SelectItem value="UPDATE_EMISSION_FACTOR" className="text-[12px]">UPDATE_EMISSION_FACTOR</SelectItem>
              <SelectItem value="REQUEST_CORRECTIVE_ACTION" className="text-[12px]">REQUEST_CORRECTIVE_ACTION</SelectItem>
              <SelectItem value="EXPORTS_PDF_REPORT" className="text-[12px]">EXPORTS_PDF_REPORT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter 3: Reset Button */}
        <div className="pt-5 flex justify-end">
          {(searchUser || filterAction !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchUser('');
                setFilterAction('ALL');
              }}
              className="h-[32px] text-[12px] text-[var(--destructive)] hover:bg-[var(--card)] rounded-md"
            >
              Reset Filters
            </Button>
          )}
        </div>

      </div>

      {/* Audit Logs Table */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
          Audited Actions History
        </h3>
        <DataTable columns={columns} data={filteredLogs} />
      </div>
    </div>
  );
}

```

---

## app/(dashboard)/settings/page.tsx

**Summary**: Settings Page. Contains application configurations, such as managing team members, setting emission factors, and configuring rule parameters for compliance checks.

### Code

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Save, Upload, Users } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockEmissionFactors } from '@/lib/mockData';
import { EmissionFactor, BackendTeamMember } from '@/lib/types';
import DataTable, { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import api from '@/lib/api';
import { useWorkspace } from '@/lib/WorkspaceContext';

const activityToCategory: Record<string, string> = {
  'Air Freight Dispatch': 'air_freight',
  'Road Transport Dispatch': 'road_transport',
  'Warehouse Pick & Pack': 'warehouse',
  'Customs Clearance Yard': 'customs',
  'Last Mile Delivery': 'last_mile'
};

export default function SettingsPage() {
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const { activeOrgId, organizations, refreshOrganizations } = useWorkspace();
  
  // General State
  const activeOrg = organizations.find(o => o.id === activeOrgId) ?? null;
  const orgName = activeOrg?.name ?? 'Louis India Pvt. Ltd.';
  const orgCountry = activeOrg?.country ?? 'India';
  const fiscalYear = activeOrg?.fiscal_year ?? '2024-2025';

  // Emission Factors State
  const [factors, setFactors] = useState<EmissionFactor[]>(mockEmissionFactors);

  // Model State
  const [modelFile] = useState('decarbonization_policy_rules_v2.pnml');
  const [ruleStatus, setRuleStatus] = useState<{ active: boolean; filename: string; rule_count: number } | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const { data } = await api.get('/api/conformance-rules');
        setRuleStatus({
          active: data.active,
          filename: data.filename,
          rule_count: data.rule_count
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchRules();
  }, []);

  // Team State
  const [team, setTeam] = useState<BackendTeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');

  // Load team members when activeOrgId changes
  useEffect(() => {
    const fetchTeam = async () => {
      if (activeOrgId === null) {
        setTeam([]);
        return;
      }
      try {
        const response = await api.get(`/api/organizations/${activeOrgId}/members`);
        setTeam(response.data);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setTeam([]);
      }
    };
    fetchTeam();
  }, [activeOrgId]);

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeOrgId === null) {
      triggerFeedback('No active organization selected.');
      return;
    }
    try {
      await api.patch(`/api/organizations/${activeOrgId}`, {
        name: orgName,
        country: orgCountry,
        fiscal_year: fiscalYear
      });
      await refreshOrganizations();
      triggerFeedback('General organizational settings updated successfully.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      triggerFeedback('Failed to save settings.');
    }
  };

  const handleFactorChange = (id: string, value: number) => {
    setFactors(factors.map(f => f.id === id ? { ...f, factor: value } : f));
  };

  // Load emission factors from backend on mount
  useEffect(() => {
    const fetchFactors = async () => {
      try {
        const response = await api.get('/api/emission-factors');
        const overrides = response.data;
        setFactors(prev => prev.map(f => {
          const cat = activityToCategory[f.activity];
          if (cat && overrides[cat] !== undefined) {
            return { ...f, factor: overrides[cat] };
          }
          return f;
        }));
      } catch (err) {
        console.error('Error fetching emission factors:', err);
      }
    };
    fetchFactors();
  }, []);

  const handleSaveFactors = async () => {
    try {
      const payload: Record<string, number> = {};
      factors.forEach(f => {
        const cat = activityToCategory[f.activity];
        if (cat) {
          payload[cat] = f.factor;
        }
      });
      const response = await api.post('/api/emission-factors', payload);
      if (response.status === 200) {
        triggerFeedback('Emission factors database saved and synced.');
      }
    } catch (err) {
      console.error('Error saving emission factors:', err);
      triggerFeedback('Failed to save emission factors.');
    }
  };

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/api/conformance-rules/upload', formData);
      setRuleStatus({
        active: true,
        filename: file.name,
        rule_count: response.data.rule_count
      });
      triggerFeedback(`Normative model updated: ${file.name} (${response.data.rule_count} rule group(s) loaded)`);
    } catch (err) {
      const apiErr = err as { response?: { status: number, data: { detail: string } } };
      if (apiErr.response && apiErr.response.status === 422) {
        triggerFeedback(`Invalid CSV: ${apiErr.response.data.detail}`);
      } else {
        triggerFeedback('Failed to upload model file.');
      }
    }
  };

  const handleResetRules = async () => {
    try {
      await api.delete('/api/conformance-rules');
      setRuleStatus(prev => prev ? { ...prev, active: false, filename: 'decarbonization_policy_rules_v2.pnml (default)' } : null);
      triggerFeedback('Reverted to default conformance rules.');
    } catch {
      triggerFeedback('Failed to reset rules.');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    if (activeOrgId === null) {
      triggerFeedback('No active organization selected.');
      return;
    }

    const email = newMemberEmail.trim();
    const name = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    try {
      const response = await api.post(`/api/organizations/${activeOrgId}/members`, {
        name,
        email,
        role: newMemberRole
      });
      setTeam([...team, response.data]);
      setNewMemberEmail('');
      triggerFeedback(`Added ${name} as ${newMemberRole}.`);
    } catch (err) {
      const apiErr = err as { response?: { status: number } };
      if (apiErr.response && apiErr.response.status === 400) {
        triggerFeedback('A member with this email already exists.');
      } else {
        triggerFeedback('Failed to add member.');
      }
    }
  };

  // Team Columns for DataTable
  const teamColumns: Column<BackendTeamMember>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => <span className="font-medium text-[var(--foreground)]">{row.name}</span>
    },
    {
      header: 'Email Address',
      accessorKey: 'email',
      sortable: true,
      cell: (row) => <span className="font-mono text-[var(--muted-foreground)]">{row.email}</span>
    },
    {
      header: 'Access Role',
      accessorKey: 'role',
      sortable: true,
      cell: (row) => {
        const roleMap: Record<string, 'critical' | 'warning' | 'pass' | 'info'> = {
          admin: 'critical',
          editor: 'warning',
          viewer: 'info'
        };
        return <StatusBadge status={roleMap[row.role]} label={row.role.toUpperCase()} />;
      }
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (activeOrgId === null) return;
            try {
              await api.delete(`/api/organizations/${activeOrgId}/members/${row.id}`);
              setTeam(team.filter(t => t.id !== row.id));
              triggerFeedback(`Removed ${row.name}.`);
            } catch {
              triggerFeedback('Failed to remove member.');
            }
          }}
          className="h-[28px] text-[var(--destructive)] hover:bg-[var(--trace-danger-light)] hover:text-[var(--destructive)] rounded-md"
        >
          Remove
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Settings & Configurations"
        subtitle="Manage organization boundaries, configure Scope 3 CO₂ emission factors, and set up compliance models."
      />

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-[var(--trace-success-light)] border border-[var(--trace-success)]/10 text-[var(--trace-success)] text-[13px] rounded-md font-sans flex items-center gap-2 select-none">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-[var(--card)] border border-[var(--border)] p-0.5 rounded-md h-[34px] mb-6">
          <TabsTrigger value="general" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[var(--background)] text-[var(--muted-foreground)] focus-visible:ring-0">General</TabsTrigger>
          <TabsTrigger value="factors" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[var(--background)] text-[var(--muted-foreground)] focus-visible:ring-0">Emission Factors</TabsTrigger>
          <TabsTrigger value="model" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[var(--background)] text-[var(--muted-foreground)] focus-visible:ring-0">Normative Model</TabsTrigger>
          <TabsTrigger value="team" className="text-[12px] font-sans px-4 h-[28px] rounded-sm data-[state=active]:bg-[var(--background)] text-[var(--muted-foreground)] focus-visible:ring-0">Team Access</TabsTrigger>
        </TabsList>

        {/* Tab 1: General Settings */}
        <TabsContent value="general" className="outline-none focus:outline-none">
          <div className="max-w-[460px] border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm space-y-6">
            <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
              Organizational Parameters
            </h3>

            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                  Organization Legal Name
                </label>
                <Input
                  value={orgName} 
                  readOnly
                  className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                  Country / Headquarters
                </label>
                <Input
                  value={orgCountry} 
                  readOnly
                  className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                  Reporting Fiscal Year
                </label>
                <Select value={fiscalYear}>
                  <SelectTrigger className="h-[32px] text-[12px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--background)] border-[var(--border)] rounded-md">
                    <SelectItem value="2024-2025" className="text-[12px]">FY 2024 - 2025</SelectItem>
                    <SelectItem value="2023-2024" className="text-[12px]">FY 2023 - 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="h-[34px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white text-[13px] rounded-md flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Tab 2: Emission Factors */}
        <TabsContent value="factors" className="outline-none focus:outline-none space-y-4">
          <div className="flex justify-between items-center select-none">
            <div>
              <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
                Activity Carbon Coefficients Database
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)] font-sans mt-0.5">
                Changes apply to all future uploads — already-analyzed data is not retroactively recalculated.
              </p>
            </div>
            <Button
              onClick={handleSaveFactors}
              className="h-[32px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white text-[12px] rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Factors Ledger</span>
            </Button>
          </div>

          <div className="border border-[var(--border)] rounded-md bg-[var(--background)]">
            <table className="border-collapse w-full text-[13px]">
              <thead className="bg-[var(--card)] border-b-2 border-[var(--border)]">
                <tr className="h-[38px] text-[var(--trace-subtle)] text-[10px] font-sans uppercase font-medium tracking-wider">
                  <th className="px-4 py-2 text-left">Activity Node Name</th>
                  <th className="px-4 py-2 text-right">Factor (kg CO₂e)</th>
                  <th className="px-4 py-2 text-left">Reference Source</th>
                  <th className="px-4 py-2 text-left">Standard Unit</th>
                </tr>
              </thead>
              <tbody>
                {factors.map((f) => (
                  <tr key={f.id} className="h-[44px] border-b border-[var(--border)] last:border-b-0">
                    <td className="px-4 py-2 text-[var(--foreground)] font-medium">{f.activity}</td>
                    <td className="px-4 py-2 text-right font-mono w-[160px]">
                      <Input
                        type="number"
                        step="0.01"
                        value={f.factor}
                        onChange={(e) => handleFactorChange(f.id, parseFloat(e.target.value) || 0)}
                        className="h-[28px] text-[12px] font-mono text-right bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
                      />
                    </td>
                    <td className="px-4 py-2 text-[var(--muted-foreground)]">{f.source}</td>
                    <td className="px-4 py-2 text-[var(--trace-subtle)] font-mono text-[11px]">{f.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 3: Normative Model */}
        <TabsContent value="model" className="outline-none focus:outline-none">
          <div className="max-w-[500px] border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm space-y-6 select-none">
            <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
              Normative Process Policy Model
            </h3>

            <div className="space-y-4">
              <div className="p-3.5 bg-[var(--card)] border border-[var(--border)] rounded-md text-[13px] space-y-2">
                <div>
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase block">Currently Active Policy ruleset</span>
                  <span className="font-mono text-[12px] font-semibold text-[var(--foreground)]">
                    {ruleStatus?.filename ?? modelFile}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase block">Rules Count</span>
                  <span className="font-sans font-medium text-[var(--primary)]">
                    {ruleStatus ? `${ruleStatus.rule_count} rule group(s) — ${ruleStatus.active ? 'custom' : 'default'}` : '4 Active ESG constraints'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                  Replace Ruleset Model File
                </label>
                <div className="border border-dashed border-[var(--border)] bg-[var(--card)] hover:bg-[#ECEAE4] rounded-md p-6 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept=".pnml,.csv"
                    onChange={handleModelUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" strokeWidth={1.5} />
                  <span className="text-[12px] font-sans font-medium text-[var(--foreground)] block">Drop PNML model file here, or click to upload</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] block mt-1">Accepts standard PNML or structured CSV rulesets</span>
                </div>
                {ruleStatus?.active === true && (
                  <Button variant="outline" onClick={handleResetRules} className="w-full h-[32px] text-[11px] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md">Revert to Default Rules</Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Team Access */}
        <TabsContent value="team" className="outline-none focus:outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            {/* Team Add form */}
            <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm space-y-4 select-none">
              <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                Invite Member
              </h3>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="name@louisindia.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                    Access Level
                  </label>
                  <Select
                    value={newMemberRole}
                    onValueChange={(val) => setNewMemberRole((val as 'admin' | 'editor' | 'viewer') || 'viewer')}
                  >
                    <SelectTrigger className="h-[32px] text-[12px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--background)] border-[var(--border)] rounded-md">
                      <SelectItem value="viewer" className="text-[12px]">Viewer (Read Only)</SelectItem>
                      <SelectItem value="editor" className="text-[12px]">Editor (Read/Write)</SelectItem>
                      <SelectItem value="admin" className="text-[12px]">Admin (Full Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-[34px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white text-[12px] rounded-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Send Invite</span>
                </Button>
              </form>
            </div>

            {/* Team Roster */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
                Auditor Roster Access Ledger
              </h3>
              <DataTable columns={teamColumns} data={team} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

```

---

## app/(dashboard)/esg-report/page.tsx

**Summary**: ESG Report Dashboard. Displays an Environmental, Social, and Governance (ESG) scorecard. Includes performance tracking across multiple metrics like carbon emissions and waste.

### Code

```tsx
'use client';

import React from 'react';
import { Download, CheckCircle, Shield, AlertTriangle, Users, Compass, Globe } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { useAnalysis } from '@/lib/AnalysisContext';
import { EsgReport } from '@/lib/types';
import SectionDivider from '@/components/shared/SectionDivider';

const mockEsgReportData: EsgReport = {
  environmental: {
    score: 72.0,
    totalCarbonKg: 55800.0,
    carbonBudgetStatus: "WITHIN_LIMIT",
    topHotspots: [
      {
        activity: "Road Transport Dispatch",
        category: "road_transport",
        estimated: false,
        frequency: 57,
        totalCarbon: 42000.0
      },
      {
        activity: "Warehouse Pick & Pack",
        category: "warehouse",
        estimated: false,
        frequency: 89,
        totalCarbon: 13800.0
      }
    ],
    dataCompleteness: "full"
  },
  social: {
    score: null,
    supplierCount: 12,
    atRiskSupplierCount: 3,
    note: "Social pillar evaluated via supplier compliance proxy only — no direct labor/community data available in source dataset.",
    dataCompleteness: "partial"
  },
  governance: {
    score: 60.0,
    violationCount: 5,
    auditReadiness: "Needs Review",
    note: "Governance pillar evaluated via process conformance proxy only — no board/policy data available in source dataset.",
    dataCompleteness: "partial"
  },
  overallScore: 66.0
};

export default function EsgReportPage() {
  const { analysis } = useAnalysis();
  const handleExportPDF = () => {
    window.print();
  };


  const isReal = !!(analysis && analysis.esgReport);
  const esgReport = isReal ? analysis.esgReport! : mockEsgReportData;

  const renderCompletenessBadge = (type: 'full' | 'partial') => {
    if (type === 'full') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-[var(--trace-success-light)] text-[var(--trace-success)] border border-[var(--trace-success)]/15">
          <CheckCircle className="w-3 h-3" />
          <span>Full Data</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-[var(--trace-warning-light)] text-[var(--trace-warning)] border border-[var(--trace-warning)]/15">
        <AlertTriangle className="w-3 h-3" />
        <span>Proxy (Partial)</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="ESG Sustainability Ledger"
        subtitle="Operational ESG pillar scorecards derived from process mining execution paths and supplier audit logs."
        action={
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md no-print"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </Button>
        }
      />

      <DemoDataBanner show={!isReal} />

      <div className="space-y-6 max-w-5xl mx-auto w-full">
        {/* 1. Overall Score Hero Section */}
        <div className="border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-sans font-semibold text-[var(--primary)] uppercase tracking-widest block">
              Synthesis Rating
            </span>
            <h3 className="text-[20px] font-sans font-bold text-[var(--foreground)]">
              Overall ESG Performance Index
            </h3>
            <p className="text-[12px] text-[var(--muted-foreground)] max-w-md leading-relaxed">
              Synthesized score representing environmental carbon fitness and compliance audit benchmarks. 
              <span className="italic block mt-1 text-[var(--trace-subtle)]">
                *Note: This overall score excludes the Social pillar, as it currently lacks direct quantitative source metrics.
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-[var(--accent)] border border-[var(--primary)]/15 rounded-md p-5 min-w-[180px] shadow-sm shrink-0 select-all">
            <span className="text-[10px] font-sans font-medium text-[var(--primary)] uppercase tracking-wider">Composite Score</span>
            <span className="text-[44px] font-mono font-bold text-[var(--primary)] leading-none mt-1">
              {esgReport.overallScore.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[var(--primary)]/70 font-sans mt-1">Weighted Index Rating</span>
          </div>
        </div>

        {/* 2. Three Pillar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* E - ENVIRONMENTAL */}
          <div className="border border-[var(--border)] bg-[var(--background)] rounded-md p-5 shadow-sm flex flex-col justify-between space-y-6 border-t-4 border-t-[var(--primary)]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans font-bold text-[var(--primary)] uppercase tracking-wider block">Pillar E</span>
                  <h4 className="text-[15px] font-sans font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[var(--primary)]" />
                    <span>Environmental</span>
                  </h4>
                </div>
                {renderCompletenessBadge(esgReport.environmental.dataCompleteness)}
              </div>

              <div className="bg-[var(--accent)] border border-[var(--primary)]/15 rounded p-4 text-center select-all">
                <span className="text-[10px] font-sans font-medium text-[var(--primary)] uppercase tracking-wider block">Carbon Fitness Rating</span>
                <span className="text-[32px] font-mono font-bold text-[var(--primary)] block mt-0.5">
                  {esgReport.environmental.score.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[var(--border)] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Total Emissions</span>
                  <span className="font-mono font-bold text-[var(--foreground)]">{esgReport.environmental.totalCarbonKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Budget Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold select-none ${
                    esgReport.environmental.carbonBudgetStatus === 'EXCEEDED' ? 'bg-[var(--trace-danger-light)] text-[var(--destructive)]' : 'bg-[var(--trace-success-light)] text-[var(--trace-success)]'
                  }`}>
                    {esgReport.environmental.carbonBudgetStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[var(--border)] pt-3">
                <span className="text-[10px] font-sans font-bold text-[var(--muted-foreground)] uppercase tracking-wider block">Top Hotspots</span>
                <ul className="space-y-1.5">
                  {esgReport.environmental.topHotspots.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-baseline gap-2">
                      <span className="font-medium text-[var(--foreground)] truncate max-w-[140px]">{item.activity}</span>
                      <span className="font-mono text-[var(--muted-foreground)] text-[11px] shrink-0">{item.totalCarbon.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <p className="text-[11px] text-[var(--trace-subtle)] leading-relaxed italic pt-2">
              Emissions and fitness scores computed directly from logged shipping events.
            </p>
          </div>

          {/* S - SOCIAL */}
          <div className="border border-[var(--border)] bg-[var(--background)] rounded-md p-5 shadow-sm flex flex-col justify-between space-y-6 border-t-4 border-t-[var(--trace-warning)]/50">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans font-bold text-[var(--trace-warning)] uppercase tracking-wider block">Pillar S</span>
                  <h4 className="text-[15px] font-sans font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[var(--trace-warning)]" />
                    <span>Social</span>
                  </h4>
                </div>
                {renderCompletenessBadge(esgReport.social.dataCompleteness)}
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded p-4 text-center select-all">
                <span className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">Labor & Community</span>
                <span className="text-[20px] font-sans font-bold text-[var(--muted-foreground)] block mt-2">
                  Not Scored
                </span>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[var(--border)] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Active Suppliers</span>
                  <span className="font-mono font-bold text-[var(--foreground)]">{esgReport.social.supplierCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">At-Risk Suppliers</span>
                  <span className="font-mono font-bold text-[var(--destructive)]">{esgReport.social.atRiskSupplierCount}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[var(--trace-warning)] leading-relaxed italic bg-[var(--trace-warning-light)]/40 border border-[var(--trace-warning-light)] p-2.5 rounded text-left">
              {esgReport.social.note}
            </p>
          </div>

          {/* G - GOVERNANCE */}
          <div className="border border-[var(--border)] bg-[var(--background)] rounded-md p-5 shadow-sm flex flex-col justify-between space-y-6 border-t-4 border-t-[#4A5D6E]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans font-bold text-[#4A5D6E] uppercase tracking-wider block">Pillar G</span>
                  <h4 className="text-[15px] font-sans font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#4A5D6E]" />
                    <span>Governance</span>
                  </h4>
                </div>
                {renderCompletenessBadge(esgReport.governance.dataCompleteness)}
              </div>

              <div className="bg-[#4A5D6E]/10 border border-[#4A5D6E]/20 rounded p-4 text-center select-all">
                <span className="text-[10px] font-sans font-medium text-[#4A5D6E] uppercase tracking-wider block">Process Compliance</span>
                <span className="text-[32px] font-mono font-bold text-[#4A5D6E] block mt-0.5">
                  {esgReport.governance.score.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[var(--border)] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Process Gaps</span>
                  <span className="font-mono font-bold text-[var(--destructive)]">{esgReport.governance.violationCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Audit Readiness</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold select-none ${
                    esgReport.governance.auditReadiness === 'Audit Ready' ? 'bg-[var(--trace-success-light)] text-[var(--trace-success)]' : 'bg-[var(--trace-warning-light)] text-[var(--trace-warning)]'
                  }`}>
                    {esgReport.governance.auditReadiness}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed italic bg-[var(--card)] border border-[var(--border)] p-2.5 rounded text-left">
              {esgReport.governance.note}
              {isReal && esgReport.governance.violationCount === 0 && (
                <span className="block mt-1.5 font-sans not-italic text-[var(--muted-foreground)]">
                  <strong>Note on rule scope:</strong> Conformance checking was conducted against limited rules targeting:{" "}
                  <span className="font-semibold text-[var(--primary)]">
                    {analysis?.conformanceRuleScope
                      ? analysis.conformanceRuleScope.flatMap((r) => r.disallowed_activities).join(", ")
                      : "Air Freight Dispatch, Truck Delivery Transport Dispatch, Incineration Disposal, Landfill Disposal"}
                  </span>.
                </span>
              )}
            </p>
          </div>

        </div>

        <SectionDivider />

        {/* Detailed Metrics explanation */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-5 space-y-3.5">
          <h4 className="text-[12px] font-sans font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[var(--primary)]" />
            <span>Proxy-Based Operational ESG Audit Methodology</span>
          </h4>
          <p className="text-[12px] text-[var(--muted-foreground)] leading-relaxed">
            Because transactional logs contain event metadata rather than policy documents, TRACE leverages 
            <strong> proxy compliance modeling</strong>. The Environmental pillar scores represent exact carbon fitness 
            metrics. The Governance pillar scores are calculated using the ratio of process traces complying with 
            regulatory path directives. The Social pillar ranks active supply chain partners by environmental policy deviations 
            to isolate supply chain compliance risks.
          </p>
        </div>
      </div>
    </div>
  );
}

```

---

## app/(dashboard)/brsr-report/page.tsx

**Summary**: BRSR Compliance Report. Generates a Business Responsibility and Sustainability Report (BRSR). Allows downloading the report as a PDF for regulatory compliance.

### Code

```tsx
'use client';

import React from 'react';
import { Download } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { useAnalysis } from '@/lib/AnalysisContext';
import { BrsrReport } from '@/lib/types';
import SectionDivider from '@/components/shared/SectionDivider';

const mockBrsrReportData: BrsrReport = {
  header: {
    orgName: "Louis India Pvt. Ltd.",
    workspaceContext: "Workspace Q3",
    projectContext: "Decarbonization Project",
    reportingPeriod: "Q3 Fiscal 2024",
    reportVersion: "Version 1",
    auditReadiness: "Needs Review",
    reportHash: "a57e58e39f20109c00e9f67b3b2f7286aed982c"
  },
  executiveSummary: "This mock BRSR Compliance Report aggregates 89 case-level traces. The compliance check yields a fitness score of 60.0% with 5 active violations and 2 bottleneck activity nodes, where the worst delay is at 'Road Transport Dispatch'. Carbon attribution models tracked a total actual emission of 55800.0 kg CO2e (WITHIN_LIMIT), identifying 2 carbon hotspots with the largest hotspot at 'Road Transport Dispatch'. ESG overall scoring achieved 75.0%, monitoring 12 suppliers. Based on the collected evidence, this disclosure is classified as 'Needs Review'.",
  kpiStrip: {
    processComplianceScore: 60.0,
    carbonFitnessScore: 90.0,
    esgOverallScore: 75.0,
    totalActualEmissions: 55800.0
  },
  sectionA: {
    orgName: "Louis India Pvt. Ltd.",
    workspaceContext: "Workspace Q3",
    projectContext: "Decarbonization Project",
    reportingPeriod: "Q3 Fiscal 2024",
    reportVersion: "Version 1",
    auditReadiness: "Needs Review"
  },
  sectionB: {
    conformanceMethodology: "rule_based_pattern_matching",
    totalEvaluatedTraces: 89,
    nonConformingTraces: 35,
    bottlenecks: [
      {
        activity: "Road Transport Dispatch",
        avgWaitHours: 25.0,
        occurrences: 57,
        status: "critical"
      },
      {
        activity: "Warehouse Pick & Pack",
        avgWaitHours: 5.0,
        occurrences: 89,
        status: "optimized"
      }
    ]
  },
  sectionC: {
    resourceDraw: {
      energyKwh: null,
      waterLiters: null,
      wasteKg: null,
      carbonBudgetLimitKg: 100000.0,
      carbonBudgetStatus: "WITHIN_LIMIT"
    },
    carbonHotspots: [
      {
        activity: "Road Transport Dispatch",
        category: "road_transport",
        estimated: false,
        frequency: 57,
        totalCarbon: 42000.0,
        contributionPercent: 75.3
      },
      {
        activity: "Warehouse Pick & Pack",
        category: "warehouse",
        estimated: false,
        frequency: 89,
        totalCarbon: 13800.0,
        contributionPercent: 24.7
      }
    ]
  },
  sectionD_traceabilityMatrix: [
    {
      metric: "Carbon Fitness Score",
      engine: "Carbon Fitness Engine",
      sourceTable: "carbon_fitness.py",
      referenceField: "cfsScore"
    },
    {
      metric: "Total Emissions",
      engine: "Carbon Budget Engine",
      sourceTable: "carbon_budget.py",
      referenceField: "totalCarbonKg"
    },
    {
      metric: "Process Compliance Score",
      engine: "Conformance Engine",
      sourceTable: "conformance.py",
      referenceField: "violations"
    },
    {
      metric: "Supplier Risk Rankings",
      engine: "Carbon Fitness Engine",
      sourceTable: "carbon_fitness.py",
      referenceField: "supplierFitness"
    },
    {
      metric: "Bottleneck Wait Times",
      engine: "Process Optimization Engine",
      sourceTable: "process_optimization.py",
      referenceField: "bottlenecks"
    }
  ],
  recommendations: [
    {
      title: "Standardize compliance validation workflows",
      priority: "HIGH",
      narrative: "Process compliance score is currently at 60.0% with 5 active violations. Action is required to standardize compliance checks."
    },
    {
      title: "Optimize bottleneck at 'Road Transport Dispatch'",
      priority: "HIGH",
      narrative: "Activity 'Road Transport Dispatch' is a critical bottleneck with an average wait time of 25.0 hours.",
      estEmissionReductionKg: 250.0
    },
    {
      title: "Remediate supplier compliance risk",
      priority: "HIGH",
      narrative: "Detected 3 at-risk suppliers with active process conformance violations."
    }
  ]
};

export default function BrsrReportPage() {
  const { analysis } = useAnalysis();
  const handleExportPDF = () => {
    window.print();
  };


  const isReal = !!(analysis && analysis.brsrReport);
  const brsrReport = isReal ? analysis.brsrReport! : mockBrsrReportData;

  const getBottleneckBadge = (status: 'critical' | 'moderate' | 'optimized') => {
    const statusMap = {
      critical: { bg: 'bg-[var(--trace-danger-light)]', text: 'text-[var(--destructive)]', border: 'border-[var(--destructive)]/10', label: 'Critical' },
      moderate: { bg: 'bg-[var(--trace-warning-light)]', text: 'text-[var(--trace-warning)]', border: 'border-[var(--trace-warning)]/10', label: 'Moderate' },
      optimized: { bg: 'bg-[var(--trace-success-light)]', text: 'text-[var(--trace-success)]', border: 'border-[var(--trace-success)]/10', label: 'Optimized' }
    };
    const config = statusMap[status] || statusMap.optimized;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 border text-[11px] font-mono font-medium rounded-full ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="BRSR Sustainability Disclosure"
        subtitle="SEBI-mandated Business Responsibility and Sustainability Report — National Guidelines on Responsible Business Conduct (NGRBC)."
        action={
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md no-print"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </Button>
        }
      />

      <DemoDataBanner show={!isReal} />

      <div className="space-y-8 max-w-5xl mx-auto w-full">
        {/* 1. Header block */}
        <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-sans font-semibold text-[var(--primary)] uppercase tracking-widest block">
                Disclosure Cover
              </span>
              <h3 className="text-[16px] font-sans font-bold text-[var(--foreground)]">
                BRSR General Disclosures Header
              </h3>
              <p className="text-[12px] text-[var(--muted-foreground)] font-sans">
                Entity: <span className="font-semibold text-[var(--foreground)]">{brsrReport.header.orgName}</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:items-end gap-1 text-[12px] text-[var(--muted-foreground)] font-sans">
              <div>Version: <span className="font-semibold text-[var(--foreground)]">{brsrReport.header.reportVersion}</span></div>
              <div className="flex items-center gap-1.5">
                Status: 
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  brsrReport.header.auditReadiness === 'Audit Ready' ? 'bg-[var(--trace-success-light)] text-[var(--trace-success)]' : 'bg-[var(--trace-warning-light)] text-[var(--trace-warning)]'
                }`}>
                  {brsrReport.header.auditReadiness}
                </span>
              </div>
              <div className="flex items-center gap-1">
                Hash: <span className="font-mono bg-[var(--card)] px-1.5 py-0.5 rounded text-[11px] text-[var(--foreground)]" title={brsrReport.header.reportHash}>
                  {brsrReport.header.reportHash.substring(0, 12)}...
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px] pt-1">
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider block">Workspace</span>
              <span className="font-semibold text-[var(--foreground)] mt-0.5 block">{brsrReport.header.workspaceContext}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider block">Project</span>
              <span className="font-semibold text-[var(--foreground)] mt-0.5 block">{brsrReport.header.projectContext}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider block">Reporting Period</span>
              <span className="font-semibold text-[var(--foreground)] mt-0.5 block">{brsrReport.header.reportingPeriod}</span>
            </div>
          </div>
        </div>

        {/* 2. Executive summary */}
        <div className="space-y-2">
          <h4 className="text-[12px] font-sans font-bold text-[var(--primary)] uppercase tracking-wider">
            Executive Summary
          </h4>
          <p className="text-[13.5px] text-[var(--foreground)] leading-relaxed font-sans bg-[var(--background)] border border-[var(--border)] p-4 rounded-md shadow-sm">
            {brsrReport.executiveSummary}
          </p>
        </div>

        {/* 3. KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--background)] space-y-1 shadow-sm">
            <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Process Compliance</span>
            <span className="text-[20px] font-mono font-bold text-[var(--foreground)] block mt-1">
              {brsrReport.kpiStrip.processComplianceScore.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[var(--trace-subtle)] italic block">Ratio of compliant cases</span>
          </div>

          <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--background)] space-y-1 shadow-sm">
            <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Carbon Fitness Score</span>
            <span className="text-[20px] font-mono font-bold text-[var(--foreground)] block mt-1">
              {brsrReport.kpiStrip.carbonFitnessScore.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[var(--trace-subtle)] italic block">Average carbon efficiency rating</span>
          </div>

          <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--background)] space-y-1 shadow-sm">
            <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">ESG Overall Score</span>
            <span className="text-[20px] font-mono font-bold text-[var(--primary)] block mt-1">
              {brsrReport.kpiStrip.esgOverallScore.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[var(--trace-subtle)] italic block">Synthesis of operational metrics</span>
          </div>

          <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--background)] space-y-1 shadow-sm">
            <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Total Actual Emissions</span>
            <span className="text-[20px] font-mono font-bold text-[var(--foreground)] block mt-1">
              {brsrReport.kpiStrip.totalActualEmissions.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
            </span>
            <span className="text-[10px] text-[var(--trace-subtle)] italic block">CO2e attributed to logistical activities</span>
          </div>
        </div>

        <SectionDivider />

        {/* 4. Section A — General Disclosures */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-bold text-[var(--primary)] uppercase tracking-wider">
            Section A — General Disclosures
          </h3>
          <div className="w-full border border-[var(--border)] rounded-md overflow-hidden bg-[var(--background)]">
            <table className="min-w-full divide-y divide-[var(--border)] text-[13px]">
              <tbody className="divide-y divide-[var(--border)]">
                <tr className="hover:bg-[var(--card)]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[var(--muted-foreground)] w-1/3 border-r border-[var(--border)]">Organization Name</td>
                  <td className="px-4 py-2 text-[var(--foreground)]">{brsrReport.sectionA.orgName}</td>
                </tr>
                <tr className="hover:bg-[var(--card)]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[var(--muted-foreground)] border-r border-[var(--border)]">Workspace Context</td>
                  <td className="px-4 py-2 text-[var(--foreground)]">{brsrReport.sectionA.workspaceContext}</td>
                </tr>
                <tr className="hover:bg-[var(--card)]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[var(--muted-foreground)] border-r border-[var(--border)]">Project Context</td>
                  <td className="px-4 py-2 text-[var(--foreground)]">{brsrReport.sectionA.projectContext}</td>
                </tr>
                <tr className="hover:bg-[var(--card)]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[var(--muted-foreground)] border-r border-[var(--border)]">Reporting Period</td>
                  <td className="px-4 py-2 text-[var(--foreground)]">{brsrReport.sectionA.reportingPeriod}</td>
                </tr>
                <tr className="hover:bg-[var(--card)]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[var(--muted-foreground)] border-r border-[var(--border)]">Report Version</td>
                  <td className="px-4 py-2 text-[var(--foreground)]">{brsrReport.sectionA.reportVersion}</td>
                </tr>
                <tr className="hover:bg-[var(--card)]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[var(--muted-foreground)] border-r border-[var(--border)]">Audit Readiness Classification</td>
                  <td className="px-4 py-2 text-[var(--foreground)] font-semibold">{brsrReport.sectionA.auditReadiness}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <SectionDivider />

        {/* 5. Section B — Process & Management Disclosures */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-bold text-[var(--primary)] uppercase tracking-wider">
            Section B — Process & Management Disclosures
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-[var(--border)] p-4 bg-[var(--background)] rounded-md shadow-sm">
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Total Evaluated Traces</span>
              <span className="text-[18px] font-mono font-bold text-[var(--foreground)] mt-1 block">{brsrReport.sectionB.totalEvaluatedTraces}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Non-Conforming Traces</span>
              <span className="text-[18px] font-mono font-bold text-[var(--destructive)] mt-1 block">{brsrReport.sectionB.nonConformingTraces}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Conformance Methodology</span>
              <span className="text-[13px] font-sans text-[var(--foreground)] mt-1 block capitalize font-semibold">{brsrReport.sectionB.conformanceMethodology.replace(/_/g, ' ')}</span>
            </div>
          </div>
          {isReal && brsrReport.sectionB.nonConformingTraces === 0 && (
            <div className="p-3 border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] rounded-md text-[11px] font-sans">
              <span className="font-semibold text-[var(--foreground)]">Note on rule scope:</span> Conformance checking was conducted against limited rules targeting:{" "}
              <span className="font-semibold text-[var(--primary)]">
                {analysis?.conformanceRuleScope
                  ? analysis.conformanceRuleScope.flatMap((r) => r.disallowed_activities).join(", ")
                  : "Air Freight Dispatch, Truck Delivery Transport Dispatch, Incineration Disposal, Landfill Disposal"}
              </span>.
            </div>
          )}

          <div className="w-full border border-[var(--border)] rounded-md overflow-hidden bg-[var(--background)]">
            <table className="min-w-full divide-y divide-[var(--border)] text-[13px]">
              <thead className="bg-[var(--card)] border-b-2 border-[var(--border)]">
                <tr className="h-[38px] text-[10px] font-sans font-medium text-[var(--trace-subtle)] uppercase tracking-wider">
                  <th className="px-4 py-2 text-left border-r border-[var(--border)]">Activity</th>
                  <th className="px-4 py-2 text-right border-r border-[var(--border)]">Average Wait Time</th>
                  <th className="px-4 py-2 text-right border-r border-[var(--border)]">Occurrences</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {brsrReport.sectionB.bottlenecks.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--card)]/50 h-[38px]">
                    <td className="px-4 py-2 font-medium text-[var(--foreground)] border-r border-[var(--border)]">{item.activity}</td>
                    <td className="px-4 py-2 text-right font-mono border-r border-[var(--border)]">{item.avgWaitHours.toFixed(1)} h</td>
                    <td className="px-4 py-2 text-right font-mono border-r border-[var(--border)]">{item.occurrences}</td>
                    <td className="px-4 py-2 text-center">{getBottleneckBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SectionDivider />

        {/* 6. Section C — Principle-wise Performance */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-bold text-[var(--primary)] uppercase tracking-wider">
            Section C — Principle-wise Performance (Principle 6 - Environment)
          </h3>

          <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--background)] space-y-4 shadow-sm">
            <h4 className="text-[11.5px] font-sans font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-1.5">Resource Consumption & Budget</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Energy Draw</span>
                <span className="text-[16px] font-mono font-bold text-[var(--foreground)] mt-1 block">{brsrReport.sectionC.resourceDraw.energyKwh ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Water Draw</span>
                <span className="text-[16px] font-mono font-bold text-[var(--foreground)] mt-1 block">{brsrReport.sectionC.resourceDraw.waterLiters ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Waste Generated</span>
                <span className="text-[16px] font-mono font-bold text-[var(--foreground)] mt-1 block">{brsrReport.sectionC.resourceDraw.wasteKg ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Carbon Budget Limit</span>
                <span className="text-[16px] font-mono font-bold text-[var(--foreground)] mt-1 block">{brsrReport.sectionC.resourceDraw.carbonBudgetLimitKg.toLocaleString()} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Budget Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold mt-1 select-none ${
                  brsrReport.sectionC.resourceDraw.carbonBudgetStatus === 'EXCEEDED' ? 'bg-[var(--trace-danger-light)] text-[var(--destructive)]' : 'bg-[var(--trace-success-light)] text-[var(--trace-success)]'
                }`}>
                  {brsrReport.sectionC.resourceDraw.carbonBudgetStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11.5px] font-sans font-bold text-[var(--muted-foreground)] uppercase tracking-wider block">Carbon Hotspots Breakdown</span>
            <div className="w-full border border-[var(--border)] rounded-md overflow-hidden bg-[var(--background)]">
              <table className="min-w-full divide-y divide-[var(--border)] text-[13px]">
                <thead className="bg-[var(--card)] border-b-2 border-[var(--border)]">
                  <tr className="h-[38px] text-[10px] font-sans font-medium text-[var(--trace-subtle)] uppercase tracking-wider">
                    <th className="px-4 py-2 text-left border-r border-[var(--border)]">Activity</th>
                    <th className="px-4 py-2 text-left border-r border-[var(--border)]">Category</th>
                    <th className="px-4 py-2 text-right border-r border-[var(--border)]">Emissions (kg CO2e)</th>
                    <th className="px-4 py-2 text-right">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {brsrReport.sectionC.carbonHotspots.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--card)]/50 h-[38px]">
                      <td className="px-4 py-2 font-medium text-[var(--foreground)] border-r border-[var(--border)]">{item.activity}</td>
                      <td className="px-4 py-2 text-[var(--muted-foreground)] font-mono text-[11px] border-r border-[var(--border)]">{item.category}</td>
                      <td className="px-4 py-2 text-right font-mono border-r border-[var(--border)]">{item.totalCarbon.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-[var(--primary)]">{item.contributionPercent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <SectionDivider />

        {/* 7. Section D — Traceability Matrix */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-bold text-[var(--primary)] uppercase tracking-wider">
            Section D — Traceability Matrix
          </h3>
          <div className="w-full border border-[var(--border)] rounded-md overflow-hidden bg-[var(--background)]">
            <table className="min-w-full divide-y divide-[var(--border)] text-[13px]">
              <thead className="bg-[var(--card)] border-b-2 border-[var(--border)]">
                <tr className="h-[38px] text-[10px] font-sans font-medium text-[var(--trace-subtle)] uppercase tracking-wider">
                  <th className="px-4 py-2 text-left border-r border-[var(--border)]">Metric</th>
                  <th className="px-4 py-2 text-left border-r border-[var(--border)]">Analysis Engine</th>
                  <th className="px-4 py-2 text-left border-r border-[var(--border)]">Source Module</th>
                  <th className="px-4 py-2 text-left">Reference Field</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {brsrReport.sectionD_traceabilityMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--card)]/50 h-[38px]">
                    <td className="px-4 py-2 font-medium text-[var(--foreground)] border-r border-[var(--border)]">{item.metric}</td>
                    <td className="px-4 py-2 text-[var(--foreground)] border-r border-[var(--border)]">{item.engine}</td>
                    <td className="px-4 py-2 text-[var(--muted-foreground)] font-mono text-[11px] border-r border-[var(--border)]">{item.sourceTable}</td>
                    <td className="px-4 py-2 text-[var(--muted-foreground)] font-mono text-[11px]">{item.referenceField}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SectionDivider />

        {/* 8. Recommendations */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-bold text-[var(--primary)] uppercase tracking-wider">
            Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brsrReport.recommendations.map((rec, idx) => {
              const priorityColors = {
                LOW: { bg: 'bg-[var(--card)]', text: 'text-[var(--muted-foreground)]', border: 'border-[var(--border)]' },
                MEDIUM: { bg: 'bg-[var(--trace-warning-light)]', text: 'text-[var(--trace-warning)]', border: 'border-[var(--trace-warning-light)]' },
                HIGH: { bg: 'bg-[#FFE6C7]', text: 'text-[#D97706]', border: 'border-[#FFE6C7]' },
                CRITICAL: { bg: 'bg-[var(--trace-danger-light)]', text: 'text-[var(--destructive)]', border: 'border-[var(--trace-danger-light)]' }
              };
              const pColor = priorityColors[rec.priority] || priorityColors.LOW;
              return (
                <div key={idx} className="border border-[var(--border)] rounded-md p-4 bg-[var(--background)] space-y-2 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-[13px] font-sans font-bold text-[var(--foreground)]">{rec.title}</h5>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${pColor.bg} ${pColor.text} border ${pColor.border}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--muted-foreground)] font-sans leading-relaxed">{rec.narrative}</p>
                  </div>
                  {rec.estEmissionReductionKg !== undefined && (
                    <div className="pt-2 border-t border-[var(--border)]/50 flex items-center justify-between text-[11px] mt-2">
                      <span className="text-[var(--trace-subtle)] font-sans">Est. Emission Reduction:</span>
                      <span className="font-mono font-bold text-[var(--primary)]">{rec.estEmissionReductionKg} kg CO2e</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

```

---

## app/(dashboard)/copilot/page.tsx

**Summary**: AI Copilot Chat. An interactive conversational interface for process auditing. Users can ask questions about their data, and it provides AI-generated insights.

### Code

```tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopilotMessage } from '@/lib/types';
import { mockCopilotMessages } from '@/lib/mockData';
import Link from 'next/link';
import { useAnalysis } from '@/lib/AnalysisContext';
import api from '@/lib/api';

export default function CopilotPage() {
  const { analysis } = useAnalysis();
  const [messages, setMessages] = useState<CopilotMessage[]>(mockCopilotMessages);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const [status, setStatus] = useState<{ online: boolean; availableModels: string[] }>({
    online: false,
    availableModels: [],
  });
  const [selectedModel, setSelectedModel] = useState('gemma3:4b');
  const [selectedStyle, setSelectedStyle] = useState('balanced');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/api/copilot/status');
        setStatus(res.data);
        if (!res.data.online) setShowWarningModal(true);
      } catch (err) {
        setStatus({ online: false, availableModels: [] });
        setShowWarningModal(true);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update default model selection based on availability ONLY initially
  useEffect(() => {
    setSelectedModel(prev => {
      // If user already selected something else, don't overwrite it
      if (prev && prev !== 'gemma3:4b') return prev;
      
      if (status.availableModels && status.availableModels.length > 0) {
        if (status.availableModels.includes('gemma3:4b')) {
          return 'gemma3:4b';
        } else {
          return status.availableModels[0];
        }
      }
      return 'gemma3:4b';
    });
  }, [status.availableModels]);

  const isDemoMode = !analysis;
  const filename = analysis?.metadata?.filename || 'louis_india_q3_sc.csv';
  const totalCarbon = analysis?.totalCarbonKg !== undefined
    ? `${analysis.totalCarbonKg.toLocaleString()} kg`
    : '78,430 kg (Demo)';

  let cfsDisplay = '72 / 100 (Demo)';
  if (analysis && analysis.cfsScores) {
    const scores = analysis.cfsScores.map(s => s.cfsScore);
    if (scores.length > 0) {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      let statusStr = 'Good';
      if (avg < 50) statusStr = 'Critical';
      else if (avg < 80) statusStr = 'Warning';
      cfsDisplay = `${avg} / 100 (${statusStr})`;
    } else {
      cfsDisplay = 'N/A';
    }
  }

  let violationsDisplay = '23 issues (Demo)';
  if (analysis && analysis.violations) {
    const totalViolations = analysis.violations.length;
    const criticalViolations = analysis.violations.filter(
      v => v.severity?.toLowerCase() === 'critical'
    ).length;
    violationsDisplay = `${totalViolations} issues (${criticalViolations} critical)`;
  }

  const suggestedChips = [
    "Which variant is most carbon-efficient?",
    "Days until budget breach?",
    "Worst performing supplier?",
    "Biggest Scope 3 source?",
    "Top conformance violations?",
    "Recommended rerouting plan?",
    "Explain our CFS score",
    "How to improve BRSR score?"
  ];

  const handleSend = async (textToSend?: string) => {
    const finalQuery = textToSend || inputVal;
    if (!finalQuery.trim()) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: finalQuery,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const response = await api.post('/api/copilot/query', {
        query: finalQuery,
        model: selectedModel,
        style: selectedStyle,
        context: analysis,
      });

      const result = response.data;
      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        structured: {
          answer: result.answer,
        },
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to get response from local LLM.';
      const assistantErrorMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Error: ${errMsg}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setMessages(prev => [...prev, assistantErrorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleChipClick = (chipText: string) => {
    setInputVal(chipText);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-100px)]">
      <PageHeader
        title="TRACE. Copilot Engine"
        subtitle="Natural language process auditor querying logistics event sequences, budget burns, and carbon deviations."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 flex-1 items-stretch min-h-0">

        <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm flex flex-col justify-between select-none">
          <div className="space-y-4">
            <h3 className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block border-b border-[var(--border)] pb-2">
              Current Context
            </h3>

            {isDemoMode && (
              <div className="bg-[var(--trace-warning-light)] border border-[#FCD34D] text-[#D97706] text-[10px] p-2 rounded text-center font-medium font-sans">
                Demo Baseline Mode
              </div>
            )}

            <div className="space-y-3 text-[12px] font-sans">
              <div>
                <span className="text-[10px] text-[var(--trace-subtle)] uppercase block">Active Project</span>
                <span className="font-medium text-[var(--foreground)]">
                  {isDemoMode ? 'Q3 Supply Chain Audit 2024' : 'Active Project Context'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--trace-subtle)] uppercase block">Loaded Log file</span>
                <span className="font-mono text-[11px] text-[var(--foreground)] truncate block">{filename}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--trace-subtle)] uppercase block">Carbon Budget Used</span>
                <span className={`font-mono font-semibold ${isDemoMode ? 'text-[var(--destructive)]' : 'text-[var(--primary)]'}`}>
                  {totalCarbon}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--trace-subtle)] uppercase block">Combined CFS Index</span>
                <span className="font-mono text-[var(--trace-warning)] font-semibold">{cfsDisplay}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--trace-subtle)] uppercase block">Active Violations</span>
                <span className="font-mono text-[var(--destructive)] font-semibold">{violationsDisplay}</span>
              </div>
              {analysis && analysis.violations && analysis.violations.length === 0 && (
                <div className="text-[10px] text-[var(--muted-foreground)] leading-relaxed bg-[var(--card)] border border-[var(--border)] p-2 rounded text-left mt-2">
                  <strong>Note:</strong> Conformance checking is limited to:{" "}
                  <span className="font-semibold text-[var(--primary)]">
                    {analysis?.conformanceRuleScope
                      ? analysis.conformanceRuleScope.flatMap((r) => r.disallowed_activities).join(", ")
                      : "Air Freight Dispatch, Truck Delivery Transport Dispatch, Incineration Disposal, Landfill Disposal"}
                  </span>.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
              <Cpu className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Local Context Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
              <span className={`w-2 h-2 rounded-full ${status.online ? 'bg-[var(--primary)]' : 'bg-red-500 animate-pulse'}`} />
              <span className="font-sans font-medium text-[var(--foreground)]">
                {status.online ? 'Ollama Online' : 'Ollama Offline'}
              </span>
            </div>
            <button
              onClick={() => setShowWarningModal(true)}
              className="mt-1 text-[10px] text-yellow-600 underline text-left font-sans"
            >
              Why is Copilot offline?
            </button>
          </div>
        </div>

        <div className="border border-[var(--border)] bg-[var(--background)] rounded-md shadow-sm flex flex-col justify-between overflow-hidden">

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-4 max-w-[760px] mx-auto">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`p-3.5 rounded-md text-[13px] leading-relaxed max-w-[580px] border ${
                      isUser
                        ? 'bg-[var(--accent)] border-[var(--primary)]/10 text-[var(--foreground)]'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]'
                    }`}>
                      {msg.content && (
                        <p className="font-sans whitespace-pre-line">{msg.content}</p>
                      )}

                      {!isUser && msg.structured && (
                        <div className={`${msg.content ? 'mt-4 border-t border-[var(--border)] pt-4' : ''} space-y-3`}>
                          <div className="p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[3px]">
                            <span className="text-[9px] text-[var(--trace-subtle)] font-sans uppercase tracking-wider font-semibold block">ANSWER</span>
                            <p className="text-[12px] font-sans font-medium text-[var(--foreground)] mt-0.5">{msg.structured.answer}</p>
                          </div>

                          {msg.structured.why && (
                            <div>
                              <span className="text-[9px] text-[var(--trace-subtle)] font-sans uppercase tracking-wider font-semibold block">WHY</span>
                              <p className="text-[12px] text-[var(--muted-foreground)] font-sans mt-0.5 leading-relaxed">{msg.structured.why}</p>
                            </div>
                          )}

                          {msg.structured.evidence && msg.structured.evidence.length > 0 && (
                            <div>
                              <span className="text-[9px] text-[var(--trace-subtle)] font-sans uppercase tracking-wider font-semibold block">EVIDENCE</span>
                              <div className="grid grid-cols-3 gap-2 mt-1 select-all">
                                {msg.structured.evidence.map((ev, evIdx) => (
                                  <div key={evIdx} className="bg-[var(--background)] border border-[var(--border)] p-2 rounded-[3px] text-center">
                                    <span className="text-[9px] text-[var(--muted-foreground)] block truncate">{ev.label}</span>
                                    <span className="font-mono text-[13px] font-bold text-[var(--foreground)] mt-0.5 block">{ev.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {msg.structured.action && (
                            <div className="pt-2">
                              <Link href={msg.structured.action.actionId}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-[28px] text-[11px] font-sans border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
                                >
                                  <span>{msg.structured.action.label}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-[var(--trace-subtle)] font-mono mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex flex-col items-start animate-pulse">
                  <div className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-md text-[13px] text-[var(--muted-foreground)] font-sans">
                    Copilot is calculating ESG indicators with {selectedModel}...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="border-t border-[var(--border)] p-3 bg-[var(--background)]">
            <div className="flex gap-2 max-w-[760px] mx-auto overflow-x-auto pb-2.5 select-none no-scrollbar">
              {suggestedChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  disabled={!status.online || isTyping}
                  className="h-[28px] px-3 border border-[var(--border)] bg-[var(--card)] hover:bg-[#ECEAE4] disabled:opacity-50 text-[var(--foreground)] text-[11px] font-sans rounded-full whitespace-nowrap transition-colors shrink-0 focus:outline-none"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="flex gap-4 max-w-[760px] mx-auto mb-2.5 text-[11px] font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!status.online}
                  className="h-[26px] px-2 py-0.5 border border-[var(--border)] bg-[var(--card)] disabled:opacity-50 disabled:bg-gray-100 rounded text-[11px] font-medium text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                >
                  {status.availableModels.length > 0 ? (
                    status.availableModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))
                  ) : (
                    <option value="gemma3:4b">gemma3:4b (Offline)</option>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">Style:</span>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  disabled={!status.online}
                  className="h-[26px] px-2 py-0.5 border border-[var(--border)] bg-[var(--card)] disabled:opacity-50 disabled:bg-gray-100 rounded text-[11px] font-medium text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="balanced">Balanced</option>
                  <option value="numerical">Numerical</option>
                  <option value="executive">Executive</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 max-w-[760px] mx-auto"
            >
              <Input
                placeholder={status.online ? "Ask about emissions forecasts, supplier performance, or process paths..." : "Ollama is currently offline. Connect local Ollama to begin."}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={!status.online || isTyping}
                className="h-[36px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
              />
              <Button
                type="submit"
                disabled={!status.online || !inputVal.trim() || isTyping}
                className="h-[36px] w-[36px] p-0 bg-[var(--primary)] hover:bg-[var(--trace-success)] disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-md shrink-0 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

            <div className="text-center text-[10px] text-[var(--trace-subtle)] font-mono mt-2 select-none">
              Powered by Ollama (local)
            </div>
          </div>
        </div>
      </div>

      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--background)] border border-[var(--border)] p-6 rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Local LLM Required</h2>
            </div>

            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">
              The TRACE Copilot relies on <strong>Ollama</strong> running locally to ensure complete data privacy and security. Because this is a live web demo, the local connection is unavailable.
            </p>

            <div className="bg-[var(--accent)] border border-[var(--border)] rounded-md p-3 mb-3">
              <h4 className="text-xs font-semibold text-[var(--foreground)] mb-1 uppercase tracking-wider">How to test Copilot:</h4>
              <ol className="list-decimal pl-4 text-xs text-[var(--muted-foreground)] space-y-1">
                <li>Clone the TRACE repository from GitHub.</li>
                <li>Install and run Ollama locally on your machine.</li>
                <li>Run the application locally.</li>
              </ol>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-3 mb-5">
              <h4 className="text-xs font-semibold text-[var(--foreground)] mb-1 uppercase tracking-wider">In Production:</h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                We are working on integrating a secure live API fallback (such as a managed Llama instance or Enterprise OpenAI key stored as an environment variable) for cloud-hosted environments where local execution is not feasible.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => window.open('https://github.com/bug1857/TRACE', '_blank')}
                className="px-4 py-2 text-[12px] font-medium border border-[var(--border)] rounded-md text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                View on GitHub
              </button>
              <Button
                onClick={() => setShowWarningModal(false)}
                className="bg-[var(--primary)] text-white hover:bg-[var(--trace-success)]"
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```

---

## app/(dashboard)/carbon-fitness/page.tsx

**Summary**: Carbon Fitness Tracking. Monitors and compares the carbon performance of different process variants against benchmarks.

### Code

```tsx
'use client';

import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { mockCfsScores } from '@/lib/mockData';
import { CfsScore } from '@/lib/types';
import { useAnalysis } from '@/lib/AnalysisContext';

export default function CarbonFitnessPage() {
  const { analysis } = useAnalysis();

  const cfsScores = (analysis && analysis.cfsScores && analysis.cfsScores.length > 0)
    ? analysis.cfsScores
    : mockCfsScores;

  // Helper for color-coded CFS pills
  const getCfsPill = (cfs: number) => {
    let bg = 'bg-[var(--trace-success-light)]';
    let text = 'text-[var(--trace-success)]';
    let border = 'border-[var(--trace-success)]/10';

    if (cfs < 50) {
      bg = 'bg-[var(--trace-danger-light)]';
      text = 'text-[var(--destructive)]';
      border = 'border-[var(--destructive)]/10';
    } else if (cfs < 80) {
      bg = 'bg-[var(--trace-warning-light)]';
      text = 'text-[var(--trace-warning)]';
      border = 'border-[var(--trace-warning)]/10';
    }

    return (
      <span className={`inline-flex items-center justify-center px-2 py-0.5 border text-[11px] font-mono font-medium rounded-full ${bg} ${text} ${border} w-[54px]`}>
        {cfs.toFixed(1)}%
      </span>
    );
  };

  const caseColumns: Column<CfsScore>[] = [
    {
      header: 'Case ID',
      accessorKey: 'caseId',
      sortable: true,
      cell: (row) => <span className="font-mono text-[12px]">{row.caseId}</span>
    },
    {
      header: 'Actual Carbon (kg)',
      accessorKey: 'actualCarbonKg',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.actualCarbonKg.toLocaleString()} kg</span>
    },
    {
      header: 'Ideal Carbon (kg)',
      accessorKey: 'idealCarbonKg',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.idealCarbonKg.toLocaleString()} kg</span>
    },
    {
      header: 'CFS Score',
      accessorKey: 'cfsScore',
      isNumeric: true,
      sortable: true,
      cell: (row) => getCfsPill(row.cfsScore)
    },
    {
      header: 'Violations Count',
      accessorKey: 'violationCount',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.violationCount}</span>
    }
  ];

  // Compute dynamic stats
  const totalCases = cfsScores.length;
  const avgCfs = totalCases > 0
    ? Math.round(cfsScores.reduce((sum, item) => sum + item.cfsScore, 0) / totalCases)
    : 100;
  const totalViolations = cfsScores.reduce((sum, item) => sum + item.violationCount, 0);

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Carbon Fitness Scoring"
        subtitle="Operational performance indicator mapping Carbon Fitness Score (CFS) ratios across cases."
        action={
          <div className="flex items-center gap-3 bg-[var(--trace-warning-light)] border border-[var(--trace-warning)]/10 py-1.5 px-3 rounded-md select-none">
            <span className="text-[11px] font-sans font-medium text-[var(--trace-warning)] uppercase tracking-wider">Project Score:</span>
            <span className="font-mono text-[16px] font-bold text-[var(--trace-warning)]">{avgCfs} / 100</span>
          </div>
        }
      />

      <DemoDataBanner show={!analysis || !analysis.cfsScores || analysis.cfsScores.length === 0} />

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average CFS */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
            Average Case CFS
          </span>
          <div className="mt-3 flex items-baseline gap-1 select-all">
            <span className={`text-[32px] font-mono font-medium leading-none ${
              avgCfs >= 80 ? 'text-[var(--primary)]' : avgCfs >= 50 ? 'text-[var(--trace-warning)]' : 'text-[var(--destructive)]'
            }`}>
              {avgCfs}%
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)] mt-2 font-sans">
            Average operational carbon fitness ratio
          </span>
        </div>

        {/* Total Cases Audited */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
            Audited Cases
          </span>
          <div className="mt-3 flex items-baseline gap-1 select-all">
            <span className="text-[32px] font-mono font-medium text-[var(--foreground)] leading-none">
              {totalCases}
            </span>
            <span className="text-[12px] font-sans text-[var(--muted-foreground)] ml-1">
              instances
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)] mt-2 font-sans">
            Total unique process case streams analyzed
          </span>
        </div>

        {/* Gaps Detected */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
            Gaps Detected
          </span>
          <div className="mt-3 flex items-baseline gap-1 select-all">
            <span className={`text-[32px] font-mono font-medium leading-none ${
              totalViolations > 0 ? 'text-[var(--destructive)]' : 'text-[var(--primary)]'
            }`}>
              {totalViolations}
            </span>
            <span className="text-[12px] font-sans text-[var(--muted-foreground)] ml-1">
              violations
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)] mt-2 font-sans">
            Breaches against mandated lower-carbon routes
          </span>
        </div>
      </div>

      {/* Case Details Table */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
          Case Carbon Fitness Metrics
        </h3>
        <DataTable columns={caseColumns} data={cfsScores} />
      </div>
    </div>
  );
}

```

---

## app/(dashboard)/projects/page.tsx

**Summary**: Projects Management. Allows users to select, create, and delete projects. A project is required before creating workspaces or uploading event logs.

### Code

```tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Plus, Trash2, ArrowRight, Building2 } from 'lucide-react';
import { useWorkspace, BackendProject } from '@/lib/WorkspaceContext';
import { createProject, deleteProject } from '@/lib/api';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function ProjectsPage() {
  const router = useRouter();
  const {
    projects,
    activeOrgId,
    activeProjectId,
    setActiveProjectId,
    refreshProjects
  } = useWorkspace();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setValidationError('Please enter a project name.');
      return;
    }

    if (activeOrgId === null) {
      setValidationError('No active organization selected.');
      return;
    }

    try {
      const created = await createProject(activeOrgId, newName.trim());
      await refreshProjects(activeOrgId);
      if (created?.id) {
        setActiveProjectId(created.id);
      }
      setNewName('');
      setValidationError('');
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      setValidationError('Failed to create project on backend.');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (activeOrgId === null) return;
    try {
      await deleteProject(id);
      const remaining = await refreshProjects(activeOrgId);
      if (activeProjectId === id) {
        if (remaining.length > 0) {
          setActiveProjectId(remaining[0].id);
        } else {
          setActiveProjectId(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete project on backend.');
    }
  };

  const columns: Column<BackendProject>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--foreground)]">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      cell: (row) => (
        <span className="text-[var(--muted-foreground)] text-[13px]">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => {
        const isActive = activeProjectId === row.id;
        return (
          <div className="flex items-center gap-2">
            {!isActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveProjectId(row.id);
                  router.push('/workspaces');
                }}
                className="h-[28px] text-[11px] font-sans text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
              >
                <span>Enter Project</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-[var(--primary)] bg-[var(--accent)] px-2.5 py-1 rounded-md">
                  Active
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/workspaces')}
                  className="h-[28px] text-[11px] font-sans text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
                >
                  <span>Go to Workspaces</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("WARNING: Deleting this project will permanently delete all its workspaces and stored audit analysis snapshots. Are you sure you want to proceed?")) {
                  handleDeleteProject(row.id);
                }
              }}
              className="h-[28px] w-[28px] p-0 text-[var(--destructive)] hover:bg-[var(--trace-danger-light)] hover:text-[var(--destructive)] rounded-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      }
    }
  ];

  if (activeOrgId === null) {
    return (
      <div className="flex flex-col flex-1">
        <PageHeader title="Projects" subtitle="Operational audits and carbon-fitness monitors." />
        <EmptyState
          icon={Building2}
          title="No active organization"
          description="Please select or create an organization first to manage projects."
          actionText="Go to Organizations"
          onAction={() => router.push('/organizations')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Projects"
        subtitle="Operational audits and carbon-fitness monitors."
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          </div>
        }
      />

      {projects.length > 0 ? (
        <DataTable
          columns={columns}
          data={projects}
          onRowClick={(row) => {
            setActiveProjectId(row.id);
            router.push('/workspaces');
          }}
        />
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Create a project to map event logs, check ESG alignment, and run simulations."
          actionText="Create Project"
          onAction={() => setIsDialogOpen(true)}
        />
      )}

      {/* New Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[400px] bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[var(--foreground)]">
              New Project
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4 py-2">
            {validationError && (
              <div className="p-2 bg-[var(--trace-danger-light)] text-[var(--destructive)] text-[11px] font-sans rounded-md border border-[var(--destructive)]/10">
                {validationError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                Project Name
              </label>
              <Input
                placeholder="e.g. Q3 Supply Chain Audit 2024"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                  setValidationError('');
                }}
                className="h-[32px] text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-[32px] text-[12px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white rounded-md"
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

---

## app/(dashboard)/simulation/page.tsx

**Summary**: What-If Simulation. Allows users to simulate structural changes (e.g., supplier shifts, air freight reduction) and observe their projected impact on carbon emissions and compliance.

### Code

```tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Play, Sliders, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { mockSimulationScenarios } from '@/lib/mockData';
import { SimulationScenario } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectionDivider from '@/components/shared/SectionDivider';
import { useAnalysis } from '@/lib/AnalysisContext';

export default function SimulationPage() {
  const { analysis } = useAnalysis();
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(mockSimulationScenarios);
  const [scenarioName, setScenarioName] = useState('Freight Route Optimization');
  const [airFreightRed, setAirFreightRed] = useState(40);
  const [supplierShift, setSupplierShift] = useState(30);
  const [activityRemoval, setActivityRemoval] = useState('None');
  const [isSimulating, setIsSimulating] = useState(false);

  const isReal = !!(analysis && analysis.cfsScores && analysis.cfsScores.length > 0);

  // Compute baselines dynamically
  const totalBudgetLimit = (analysis && analysis.carbonBudget && analysis.carbonBudget.length > 0)
    ? analysis.carbonBudget.reduce((sum, item) => sum + item.budget, 0)
    : 120000;

  const baselineCarbon = isReal ? analysis.totalCarbonKg : 78430;
  const baselineCfs = isReal
    ? Math.round(analysis.cfsScores.reduce((sum, item) => sum + item.cfsScore, 0) / analysis.cfsScores.length)
    : 72;
  const baselineBudget = totalBudgetLimit - baselineCarbon;
  const baselineViolations = isReal ? analysis.violations.length : 23;

  // Active comparison state - stores only simulated overrides, defaults to null (falls back to baselines)
  const [simulatedResults, setSimulatedResults] = useState<{
    afterCarbon: number;
    afterCfs: number;
    afterBudget: number;
    afterViolations: number;
  } | null>(null);

  // Reset simulated results and activity removal if baselines/analysis changes
  const [prevBaselines, setPrevBaselines] = useState({
    baselineCarbon,
    baselineCfs,
    baselineBudget,
    baselineViolations
  });

  const [prevAnalysis, setPrevAnalysis] = useState(analysis);

  if (prevBaselines.baselineCarbon !== baselineCarbon ||
      prevBaselines.baselineCfs !== baselineCfs ||
      prevBaselines.baselineBudget !== baselineBudget ||
      prevBaselines.baselineViolations !== baselineViolations ||
      prevAnalysis !== analysis) {
    setPrevBaselines({
      baselineCarbon,
      baselineCfs,
      baselineBudget,
      baselineViolations
    });
    setPrevAnalysis(analysis);
    setSimulatedResults(null);
    setActivityRemoval('None');
  }

  // Derive comparison metrics dynamically for render
  const currentComparison = {
    beforeCarbon: baselineCarbon,
    afterCarbon: simulatedResults ? simulatedResults.afterCarbon : baselineCarbon,
    beforeCfs: baselineCfs,
    afterCfs: simulatedResults ? simulatedResults.afterCfs : baselineCfs,
    beforeBudget: baselineBudget,
    afterBudget: simulatedResults ? simulatedResults.afterBudget : baselineBudget,
    beforeViolations: baselineViolations,
    afterViolations: simulatedResults ? simulatedResults.afterViolations : baselineViolations,
  };

  // Compute dynamic options for Remove Activity Node
  const activityOptions = useMemo(() => {
    if (isReal && analysis && analysis.nodes) {
      return analysis.nodes
        .map(n => n.label)
        .filter((label, index, self) => label && self.indexOf(label) === index);
    }
    return ["Customs Yard Re-inspection", "Quality Inspection Loop"];
  }, [isReal, analysis]);

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    setTimeout(() => {
      // Calculate simulated outcomes based on configuration inputs
      const carbonReduction = (airFreightRed * 0.35 + supplierShift * 0.45 + (activityRemoval !== 'None' ? 8 : 0));
      const simulatedAfterCarbon = Math.round(baselineCarbon * (1 - carbonReduction / 100));
      const simulatedAfterCfs = Math.min(100, Math.round(baselineCfs + (airFreightRed * 0.15 + supplierShift * 0.18)));
      const simulatedAfterBudget = totalBudgetLimit - simulatedAfterCarbon;
      const simulatedAfterViolations = Math.max(2, Math.round(baselineViolations * (1 - (airFreightRed * 0.4 + supplierShift * 0.3) / 100)));

      const newScenario: SimulationScenario = {
        id: `sim-${Date.now()}`,
        name: scenarioName || 'Unnamed Scenario',
        airFreightReduction: airFreightRed,
        supplierVolumeShift: supplierShift,
        activityRemoval: activityRemoval,
        results: {
          beforeCarbon: baselineCarbon,
          afterCarbon: simulatedAfterCarbon,
          beforeCfs: baselineCfs,
          afterCfs: simulatedAfterCfs,
          beforeBudgetRemaining: baselineBudget,
          afterBudgetRemaining: simulatedAfterBudget,
          beforeViolations: baselineViolations,
          afterViolations: simulatedAfterViolations
        },
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setScenarios([newScenario, ...scenarios]);
      setSimulatedResults({
        afterCarbon: simulatedAfterCarbon,
        afterCfs: simulatedAfterCfs,
        afterBudget: simulatedAfterBudget,
        afterViolations: simulatedAfterViolations
      });
      
      setIsSimulating(false);
    }, 1000); // 1s simulation delay
  };

  const handleDeleteScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const savedColumns: Column<SimulationScenario>[] = [
    {
      header: 'Scenario Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => <span className="font-medium text-[var(--foreground)]">{row.name}</span>
    },
    {
      header: 'Air Red. %',
      accessorKey: 'airFreightReduction',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.airFreightReduction}%</span>
    },
    {
      header: 'Supplier Shift %',
      accessorKey: 'supplierVolumeShift',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.supplierVolumeShift}%</span>
    },
    {
      header: 'Activity Removed',
      accessorKey: 'activityRemoval',
      sortable: true
    },
    {
      header: 'Carbon Delta',
      accessorKey: 'carbonDelta',
      isNumeric: true,
      cell: (row) => {
        const delta = row.results.afterCarbon - row.results.beforeCarbon;
        const color = delta <= 0 ? 'text-[var(--trace-success)]' : 'text-[var(--destructive)]';
        const sign = delta > 0 ? '+' : '';
        return <span className={`${color} font-mono`}>{sign}{delta.toLocaleString()} kg</span>;
      }
    },
    {
      header: 'CFS Delta',
      accessorKey: 'cfsDelta',
      isNumeric: true,
      cell: (row) => {
        const delta = row.results.afterCfs - row.results.beforeCfs;
        const color = delta >= 0 ? 'text-[var(--trace-success)]' : 'text-[var(--destructive)]';
        const sign = delta > 0 ? '+' : '';
        return <span className={`${color} font-mono`}>{sign}{delta}</span>;
      }
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSimulatedResults({
                afterCarbon: row.results.afterCarbon,
                afterCfs: row.results.afterCfs,
                afterBudget: row.results.afterBudgetRemaining,
                afterViolations: row.results.afterViolations
              });
            }}
            className="h-[28px] text-[11px] font-sans border-[var(--border)] hover:bg-[var(--card)] rounded-md"
          >
            Load
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleDeleteScenario(row.id, e)}
            className="h-[28px] w-[28px] p-0 text-[var(--destructive)] hover:bg-[var(--trace-danger-light)] hover:text-[var(--destructive)] rounded-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="What-If Operational Simulator"
        subtitle="Simulate structural changes, supplier volume shifts, and check projected carbon compliance outcomes."
      />

      <DemoDataBanner show={!isReal} />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        {/* Left Column: Config Panel */}
        <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm select-none">
          <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[var(--primary)]" />
            <span>Scenario Parameters</span>
          </h3>

          <form onSubmit={handleRunSimulation} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                Scenario Name
              </label>
              <Input
                placeholder="e.g. Electric Last Mile Shift"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
              />
            </div>

            {/* Slider 1: Air Freight Reduction */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-[11px] font-sans">
                <label className="font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Air Freight Reduction</label>
                <span className="font-mono text-[var(--foreground)] font-semibold">{airFreightRed}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={airFreightRed}
                onChange={(e) => setAirFreightRed(parseInt(e.target.value))}
                className="w-full accent-[var(--primary)] h-1 bg-[var(--border)] rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Supplier Shift */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-[11px] font-sans">
                <label className="font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Supplier Volume Shift</label>
                <span className="font-mono text-[var(--foreground)] font-semibold">{supplierShift}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={supplierShift}
                onChange={(e) => setSupplierShift(parseInt(e.target.value))}
                className="w-full accent-[var(--primary)] h-1 bg-[var(--border)] rounded-lg cursor-pointer"
              />
            </div>

            {/* Dropdown 3: Activity Removal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                Remove Activity Node
              </label>
              <Select value={activityRemoval} onValueChange={(val) => setActivityRemoval(val || 'None')}>
                <SelectTrigger className="h-[32px] text-[12px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--background)] border-[var(--border)] rounded-md">
                  <SelectItem value="None" className="text-[12px]">None</SelectItem>
                  {activityOptions.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-[12px]">{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isSimulating}
              className="w-full h-[36px] bg-[var(--primary)] hover:bg-[var(--trace-success)] disabled:bg-[var(--primary)]/60 text-white font-sans text-[13px] font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors pt-1"
            >
              <Play className="w-4 h-4" />
              <span>{isSimulating ? 'Running Model...' : 'Run Simulation'}</span>
            </Button>
          </form>
        </div>

        {/* Right Column: Results Grid */}
        <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
            <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
              Operational Impact Analysis
            </h3>
            <span className="text-[10px] text-[var(--trace-subtle)] font-sans italic">
              Projections use estimated efficiency coefficients, not measured outcomes — actual results may vary.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Carbon Emissions Card */}
            <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--card)] space-y-2 select-all">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold block">Total Carbon Footprint (kg)</span>
              <div className="grid grid-cols-3 gap-2 items-baseline text-center">
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Before</span>
                  <span className="font-mono text-[14px] font-medium text-[var(--foreground)]">{currentComparison.beforeCarbon.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">After</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">{currentComparison.afterCarbon.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Delta</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">
                    {currentComparison.afterCarbon - currentComparison.beforeCarbon > 0 ? '+' : ''}
                    {(currentComparison.afterCarbon - currentComparison.beforeCarbon).toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>

            {/* CFS Score Card */}
            <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--card)] space-y-2 select-all">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold block">Carbon Fitness Score (CFS)</span>
              <div className="grid grid-cols-3 gap-2 items-baseline text-center">
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Before</span>
                  <span className="font-mono text-[14px] font-medium text-[var(--foreground)]">{currentComparison.beforeCfs}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">After</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">{currentComparison.afterCfs}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Delta</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">
                    {currentComparison.afterCfs - currentComparison.beforeCfs >= 0 ? '+' : ''}
                    {currentComparison.afterCfs - currentComparison.beforeCfs}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Remaining Card */}
            <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--card)] space-y-2 select-all">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold block">Remaining Carbon Credits (kg)</span>
              <div className="grid grid-cols-3 gap-2 items-baseline text-center">
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Before</span>
                  <span className="font-mono text-[14px] font-medium text-[var(--foreground)]">{currentComparison.beforeBudget.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">After</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">{currentComparison.afterBudget.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Delta</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">
                    {currentComparison.afterBudget - currentComparison.beforeBudget > 0 ? '+' : ''}
                    {(currentComparison.afterBudget - currentComparison.beforeBudget).toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Violations Count Card */}
            <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--card)] space-y-2 select-all">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold block">Conformance Violations</span>
              <div className="grid grid-cols-3 gap-2 items-baseline text-center">
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Before</span>
                  <span className="font-mono text-[14px] font-medium text-[var(--foreground)]">{currentComparison.beforeViolations}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">After</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">{currentComparison.afterViolations}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Delta</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">
                    {currentComparison.afterViolations - currentComparison.beforeViolations >= 0 ? '+' : ''}
                    {currentComparison.afterViolations - currentComparison.beforeViolations}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Saved Scenarios Table */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
          Saved Simulation Scenarios Ledger
        </h3>
        <DataTable columns={savedColumns} data={scenarios} />
      </div>
    </div>
  );
}

```

---

## app/(dashboard)/sustainability-conformance/page.tsx

**Summary**: Sustainability Conformance. Audits process paths against ESG policies and corporate rules. Identifies paths that bypass low-carbon alternatives.

### Code

```tsx
'use client';

import React, { useState, useMemo } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { mockCarbonFitnessVariants } from '@/lib/mockData';
import { CarbonFitnessItem, Violation } from '@/lib/types';
import { useAnalysis } from '@/lib/AnalysisContext';

interface PolicyRule {
  id: string;
  name: string;
  category: string;
  check: (variant: CarbonFitnessItem, violations?: Violation[]) => { status: 'pass' | 'fail' | 'unevaluated'; explanation: string };
}

const policyRules: PolicyRule[] = [
  {
    id: 'rule-1',
    name: 'No Air Freight for Local Corridors',
    category: 'Logistics Decarbonization',
    check: (v, violations) => {
      if (violations !== undefined) {
        const airV = violations.find(vl => vl.caseId === v.id && vl.activity.toLowerCase().includes('air'));
        if (airV) {
          return {
            status: 'fail',
            explanation: `Logistics bypass: Air Freight dispatch chosen instead of mandated alternative, causing a ${airV.carbonDeltaKg.toFixed(1)} kg CO₂ emissions excess.`
          };
        }
        return {
          status: 'pass',
          explanation: 'Passed: Route utilizes low-carbon road freight carriers or rail transport for regional shipping hubs.'
        };
      }
      const usesAir = v.name.toLowerCase().includes('air');
      if (usesAir) {
        return {
          status: 'fail',
          explanation: 'Logistics bypass: Air Freight dispatch chosen instead of mandated Electric Rail corridors, causing a 2.45 tCO₂e emissions excess.'
        };
      }
      return {
        status: 'pass',
        explanation: 'Passed: Route utilizes low-carbon road freight carriers or rail transport for regional shipping hubs.'
      };
    }
  },
  {
    id: 'rule-2',
    name: 'Certified Scope 3 Freight Vendors Only',
    category: 'Supply Chain Compliance',
    check: (v, violations) => {
      if (violations !== undefined) {
        const vendorV = violations.find(vl => vl.caseId === v.id && (vl.activity.toLowerCase().includes('truck') || vl.activity.toLowerCase().includes('delivery')));
        if (vendorV) {
          return {
            status: 'fail',
            explanation: `Vendor violation: Outsourced transportation assigned to non-compliant carrier (${vendorV.activity}) with excess ${vendorV.carbonDeltaKg.toFixed(1)} kg CO₂ emissions.`
          };
        }
        return {
          status: 'pass',
          explanation: 'Passed: All assigned vendors hold valid ISO 14064 Carbon Footprint Certifications.'
        };
      }
      const isLocalBypass = v.id === 'VAR-3';
      const isWorstAir = v.id === 'VAR-5';
      if (isLocalBypass || isWorstAir) {
        return {
          status: 'fail',
          explanation: 'Vendor violation: Outsourced transportation assigned to non-Euro VI compliant carrier (Supplier B — FastCargo Ltd.) with Scope 3 factor > 0.80 kg/$'
        };
      }
      return {
        status: 'pass',
        explanation: 'Passed: All assigned vendors (Supplier A/E) hold valid ISO 14064 Carbon Footprint Certifications.'
      };
    }
  },
  {
    id: 'rule-3',
    name: 'Refrigerated Storage Yard Threshold < 24h',
    category: 'Cold Chain Operations',
    check: (v, violations) => {
      if (violations !== undefined) {
        return {
          status: 'unevaluated',
          explanation: 'Not evaluated — requires storage duration data not present in this dataset.'
        };
      }
      const isCustomsRework = v.id === 'VAR-4';
      if (isCustomsRework) {
        return {
          status: 'fail',
          explanation: 'Excess waiting yard delay: Refrigerated container idle duration recorded at 48.1h, exceeding the max 24h cap and wasting cooling diesel.'
        };
      }
      return {
        status: 'pass',
        explanation: 'Passed: Idle customs clearance yard durations average under 14.5 hours across active cases.'
      };
    }
  },
  {
    id: 'rule-4',
    name: 'Order Rework Loops Limit < 2 Cycles',
    category: 'Packaging Efficiency',
    check: (v, violations) => {
      if (violations !== undefined) {
        return {
          status: 'unevaluated',
          explanation: 'Not evaluated — requires activity duration/rework tracking not present in this dataset.'
        };
      }
      const isPackRework = v.id === 'VAR-5';
      if (isPackRework) {
        return {
          status: 'fail',
          explanation: 'Process loop breach: Warehouse packing lines logged 3 consecutive packaging inspections failures, triggering scrap overhead.'
        };
      }
      return {
        status: 'pass',
        explanation: 'Passed: Package cycles completed packing inspection targets in a single iteration.'
      };
    }
  }
];

export default function SustainabilityConformancePage() {
  const { analysis } = useAnalysis();

  const pathways = useMemo(() => {
    if (analysis && analysis.cfsScores && analysis.cfsScores.length > 0) {
      return analysis.cfsScores.map(score => {
        const caseViolations = analysis.violations?.filter(v => v.caseId === score.caseId) || [];
        
        let pathName = 'Recv → Pick → Customs → Road → Last Mile';
        const hasAir = caseViolations.some(v => v.activity.toLowerCase().includes('air'));
        const hasTruck = caseViolations.some(v => v.activity.toLowerCase().includes('truck'));
        const hasWaste = caseViolations.some(v => v.category === 'waste');
        
        if (hasAir) {
          pathName = 'Recv → Pick → Customs → Air Freight → Last Mile';
        } else if (hasTruck) {
          pathName = 'Recv → Pick → Customs → Truck Delivery → Last Mile';
        } else if (hasWaste) {
          pathName = 'Recv → Pick → Waste Management → Last Mile';
        }
        
        return {
          id: score.caseId,
          name: pathName,
          cfs: score.cfsScore,
          carbonEmitted: score.actualCarbonKg,
          volume: 1
        };
      });
    }
    return mockCarbonFitnessVariants;
  }, [analysis]);

  const [selectedVar, setSelectedVar] = useState<CarbonFitnessItem | null>(null);

  const [prevPathways, setPrevPathways] = useState(pathways);
  if (prevPathways !== pathways) {
    setPrevPathways(pathways);
    setSelectedVar(null);
  }

  const currentVar = selectedVar || pathways[0] || null;

  const isReal = !!(analysis && analysis.cfsScores && analysis.cfsScores.length > 0);
  const violations = analysis && analysis.violations ? analysis.violations : undefined;

  const getPassCount = (v: CarbonFitnessItem) => {
    return policyRules.filter(r => r.check(v, violations).status === 'pass').length;
  };

  const passCount = currentVar ? getPassCount(currentVar) : 0;
  const failCount = currentVar ? policyRules.filter(r => r.check(currentVar, violations).status === 'fail').length : 0;

  const isGreen = failCount === 0;
  const isAmber = !isReal && passCount >= 2 && passCount < 4;

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="AI Sustainability Conformance Policies"
        subtitle="AI-driven governance engine auditing process path sequences against ESG covenants, corporate caps, and supplier mandates."
      />

      <DemoDataBanner show={!isReal} />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        
        {/* Left Column: Process Variants List */}
        <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm space-y-3.5 select-none">
          <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
            {isReal ? `Audited Cases (${pathways.length})` : `Process Pathways (${pathways.length})`}
          </h3>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {pathways.map((v) => {
              const isSelected = currentVar && currentVar.id === v.id;
              const rulePass = getPassCount(v);
              const ruleFail = policyRules.filter(r => r.check(v, violations).status === 'fail').length;
              const colorClass = ruleFail > 0 ? 'text-[var(--destructive)]' : 'text-[var(--trace-success)]';

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVar(v)}
                  className={`p-3 border rounded-md cursor-pointer transition-colors flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--accent)] border-[var(--primary)] text-[var(--primary)]'
                      : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[#ECEAE4]'
                  }`}
                >
                  <div className="flex justify-between items-center text-[12px] font-mono">
                    <span className="font-bold">{v.id}</span>
                    <span className={`font-semibold ${colorClass}`}>
                      {isReal ? `${rulePass} / 2 Passed` : `${rulePass} / 4 Passed`}
                    </span>
                  </div>
                  
                  <p className="text-[11px] font-mono leading-tight line-clamp-2">
                    {v.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Audit Policy Checklist */}
        {currentVar ? (
          <div className="border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-sans font-semibold text-[var(--primary)] uppercase tracking-widest block">
                  AI Auditor Log
                </span>
                <h2 className="text-[16px] font-sans font-medium text-[var(--foreground)]">
                  ESG Policy Checklist Analysis — {currentVar.id}
                </h2>
                <p className="text-[12px] text-[var(--muted-foreground)] font-sans">
                  Pathway: <span className="font-mono text-[11px] text-[var(--foreground)]">{currentVar.name}</span>
                </p>
              </div>
              
              <ShieldCheck className="w-10 h-10 text-[var(--primary)]" strokeWidth={1} />
            </div>

            {/* Audit Result Overview banner */}
            <div className={`p-4 rounded-md border flex items-center gap-3 select-none ${
              isGreen
                ? 'bg-[var(--trace-success-light)] border-[var(--trace-success)]/10 text-[var(--trace-success)]'
                : isAmber
                ? 'bg-[var(--trace-warning-light)] border-[var(--trace-warning)]/10 text-[var(--trace-warning)]'
                : 'bg-[var(--trace-danger-light)] border-[var(--destructive)]/10 text-[var(--destructive)]'
            }`}>
              {isGreen ? (
                <CheckCircle2 className="w-6 h-6 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 shrink-0" />
              )}
              <div>
                <h4 className="text-[13px] font-sans font-semibold">
                  {isGreen ? 'Fully Conforming Pathway' : 'Conformance Deviations Identified'}
                </h4>
                <p className="text-[12px] text-[var(--muted-foreground)] font-sans mt-0.5">
                  {isReal ? (
                    `AI auditor analyzed 2 active policy rules. Result: ${passCount} passed, ${failCount} failed. (2 rules not evaluated)`
                  ) : (
                    `AI auditor analyzed 4 policy rules. Result: ${passCount} passed, ${failCount} failed.`
                  )}
                </p>
              </div>
            </div>

            {/* Checklist Rules list */}
            <div className="space-y-4">
              {policyRules.map((rule) => {
                const { status, explanation } = rule.check(currentVar, violations);

                return (
                  <div
                    key={rule.id}
                    className="border border-[var(--border)] rounded-md p-4 bg-[var(--card)] flex items-start gap-3"
                  >
                    {status === 'pass' && (
                      <CheckCircle2 className="w-5 h-5 text-[var(--trace-success)] shrink-0 mt-0.5" />
                    )}
                    {status === 'fail' && (
                      <XCircle className="w-5 h-5 text-[var(--destructive)] shrink-0 mt-0.5" />
                    )}
                    {status === 'unevaluated' && (
                      <HelpCircle className="w-5 h-5 text-[var(--trace-subtle)] shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[13px] font-sans font-semibold text-[var(--foreground)]">
                          {rule.name}
                        </h4>
                        <span className="text-[9px] font-mono text-[var(--trace-subtle)] uppercase tracking-wider border border-[var(--border)] px-1 rounded-sm">
                          {rule.category}
                        </span>
                      </div>

                      <p className={`text-[12px] font-sans ${
                        status === 'pass'
                          ? 'text-[var(--muted-foreground)]'
                          : status === 'fail'
                          ? 'text-[var(--destructive)] font-medium'
                          : 'text-[var(--trace-subtle)] italic'
                      } leading-normal`}>
                        {explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          <div className="border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm text-center text-[var(--muted-foreground)]">
            Select a pathway or case to view policy audits.
          </div>
        )}

      </div>
    </div>
  );
}

```

---

## app/(dashboard)/workspaces/page.tsx

**Summary**: Workspaces Management. Manages logical partitions within a project. Workspaces contain specific event logs, configurations, and reports.

### Code

```tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LayoutGrid, Trash2, Calendar, Briefcase } from 'lucide-react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { createWorkspace, deleteWorkspace } from '@/lib/api';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function WorkspacesPage() {
  const router = useRouter();
  const {
    workspaces,
    activeProjectId,
    activeWorkspaceId,
    setActiveWorkspaceId,
    refreshWorkspaces
  } = useWorkspace();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setValidationError('Please enter a workspace name.');
      return;
    }

    if (activeProjectId === null) {
      setValidationError('No active project selected.');
      return;
    }

    try {
      const created = await createWorkspace(activeProjectId, newName.trim());
      await refreshWorkspaces(activeProjectId);
      if (created?.id) {
        setActiveWorkspaceId(created.id);
      }
      setNewName('');
      setValidationError('');
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      setValidationError('Failed to create workspace on backend.');
    }
  };

  const handleDeleteWorkspace = async (id: number) => {
    if (activeProjectId === null) return;
    try {
      await deleteWorkspace(id);
      const remaining = await refreshWorkspaces(activeProjectId);
      if (activeWorkspaceId === id) {
        if (remaining.length > 0) {
          setActiveWorkspaceId(remaining[0].id);
        } else {
          setActiveWorkspaceId(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete workspace on backend.');
    }
  };

  if (activeProjectId === null) {
    return (
      <div className="flex flex-col flex-1">
        <PageHeader title="Workspaces" subtitle="Logical partitions containing event logs, configs, and reports." />
        <EmptyState
          icon={Briefcase}
          title="No active project"
          description="Please select or create a project first to manage workspaces."
          actionText="Go to Projects"
          onAction={() => router.push('/projects')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Workspaces"
        subtitle="Logical partitions containing event logs, configs, and reports."
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Workspace</span>
            </Button>
          </div>
        }
      />

      {workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workspaces.map((w) => {
            const isActive = activeWorkspaceId === w.id;
            return (
              <div
                key={w.id}
                onClick={() => setActiveWorkspaceId(w.id)}
                className={`border rounded-md p-5 flex flex-col justify-between h-[150px] relative cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-[var(--accent)] border-[var(--primary)]' 
                    : 'bg-[var(--card)] border-[var(--border)] hover:bg-[#ECEAE4]'
                }`}
              >
                {/* Header Info */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start pr-6">
                    <h3 className="text-[14px] font-sans font-medium text-[var(--foreground)] tracking-tight">
                      {w.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("WARNING: Deleting this workspace will permanently erase its stored audit analysis snapshot. Are you sure you want to proceed?")) {
                          handleDeleteWorkspace(w.id);
                        }
                      }}
                      className="h-[24px] w-[24px] p-0 text-[var(--destructive)] hover:bg-[var(--trace-danger-light)] hover:text-[var(--destructive)] rounded-md absolute top-3 right-3 animate-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  
                  {isActive && (
                    <span className="text-[10px] font-medium text-[var(--primary)] bg-[var(--accent)] border border-[var(--primary)]/20 px-2 py-0.5 rounded block w-fit">
                      Active Workspace
                    </span>
                  )}
                </div>

                {/* Bottom modified stamp */}
                <div className="flex items-center gap-1 text-[11px] text-[var(--trace-subtle)] font-mono border-t border-[var(--border)] pt-2">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {new Date(w.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={LayoutGrid}
          title="No workspaces yet"
          description="Create a workspace to group related event logs and configuration metrics."
          actionText="Create Workspace"
          onAction={() => setIsDialogOpen(true)}
        />
      )}

      {/* New Workspace Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[400px] bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[var(--foreground)]">
              New Workspace
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateWorkspace} className="space-y-4 py-2">
            {validationError && (
              <div className="p-2 bg-[var(--trace-danger-light)] text-[var(--destructive)] text-[11px] font-sans rounded-md border border-[var(--destructive)]/10">
                {validationError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                Workspace Name
              </label>
              <Input
                placeholder="e.g. Primary SC Logs"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                  setValidationError('');
                }}
                className="h-[32px] text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-[32px] text-[12px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white rounded-md"
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

---

## app/(dashboard)/carbon-budget/page.tsx

**Summary**: Carbon Budget Ledger. Manages and forecasts carbon credit allocations. Displays historical burn rate and predicts future budget breaches based on trends.

### Code

```tsx
'use client';

import React, { useState } from 'react';
import { AlertTriangle, Sliders } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import ScoreRing from '@/components/shared/ScoreRing';
import DataTable, { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockCarbonBudgetMonths } from '@/lib/mockData';
import { CarbonBudgetMonth, ActivityCarbonBreakdownItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAnalysis } from '@/lib/AnalysisContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function CarbonBudgetPage() {
  const { analysis } = useAnalysis();
  const [budgetLimit, setBudgetLimit] = useState(120000);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempLimit, setTempLimit] = useState(120000);

  // Derive months dynamically based on budgetLimit and analysis context
  const rawMonths = (analysis && analysis.carbonBudget && analysis.carbonBudget.length > 0)
    ? analysis.carbonBudget
    : mockCarbonBudgetMonths;

  const monthlyLimit = budgetLimit / 12;
  const months = rawMonths.map(m => {
    const delta = m.actual > 0 ? m.actual - monthlyLimit : 0;
    let status: 'critical' | 'warning' | 'pass' = 'pass';
    if (m.actual > 0) {
      if (m.actual > monthlyLimit * 1.2) status = 'critical';
      else if (m.actual > monthlyLimit) status = 'warning';
    }
    return {
      ...m,
      budget: monthlyLimit,
      delta: Math.round(delta),
      status
    };
  });

  const totalUsed = months.reduce((sum, m) => sum + m.actual, 0);
  const usedPercent = Math.round((totalUsed / budgetLimit) * 100);
  
  // Calculate forecast: average burn rate of active months (actual > 0)
  const actualMonths = months.filter(m => m.actual > 0);
  const avgMonthlyBurn = actualMonths.reduce((sum, m) => sum + m.actual, 0) / (actualMonths.length || 1);
  const predictedBreachDays = Math.round((budgetLimit - totalUsed) / (avgMonthlyBurn / 30 || 1));

  const handleAdjustBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetLimit(tempLimit);
    setIsDialogOpen(false);
  };

  const columns: Column<CarbonBudgetMonth>[] = [
    {
      header: 'Month',
      accessorKey: 'month',
      sortable: true
    },
    {
      header: 'Budget (kg)',
      accessorKey: 'budget',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{Math.round(row.budget).toLocaleString()}</span>
    },
    {
      header: 'Actual (kg)',
      accessorKey: 'actual',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.actual > 0 ? row.actual.toLocaleString() : '—'}</span>
    },
    {
      header: 'Delta (kg)',
      accessorKey: 'delta',
      isNumeric: true,
      sortable: true,
      cell: (row) => {
        if (row.actual === 0) return <span>—</span>;
        const isOver = row.delta > 0;
        return (
          <span className={isOver ? 'text-[var(--destructive)] font-medium' : 'text-[var(--trace-success)]'}>
            {isOver ? '+' : ''}{Math.round(row.delta).toLocaleString()}
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        if (row.actual === 0) return <span className="text-[var(--trace-subtle)] text-[12px] font-mono">Forecast</span>;
        return <StatusBadge status={row.status} />;
      }
    }
  ];

  const breakdownColumns: Column<ActivityCarbonBreakdownItem>[] = [
    {
      header: 'Activity',
      accessorKey: 'activity',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-sans font-medium">{row.activity}</span>
          {row.estimated && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold bg-[var(--trace-warning-light)] text-[var(--trace-warning)] border border-[var(--trace-warning)]/20 uppercase">
              Estimated factor
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[10px] uppercase text-[var(--muted-foreground)] px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded">
          {row.category.replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Frequency',
      accessorKey: 'frequency',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span className="font-mono text-[12px]">{row.frequency.toLocaleString()}</span>
    },
    {
      header: 'Total Carbon (kg)',
      accessorKey: 'totalCarbon',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span className="font-mono text-[12px] font-medium text-[var(--destructive)]">{row.totalCarbon.toLocaleString()}</span>
    }
  ];

  // Map chart coordinates dynamically
  const chartPoints = months
    .filter(m => m.actual > 0)
    .map((m, index) => {
      const x = 30 + index * 45;
      const monthlyLimit = budgetLimit / 12;
      const y = Math.max(10, Math.min(190, 100 - ((m.actual - monthlyLimit) / (monthlyLimit || 1)) * 50));
      return { x, y, label: m.month, actual: m.actual };
    });

  const pathD = chartPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const forecastPoints = months
    .filter(m => m.actual === 0)
    .map((m, index) => {
      const lastActual = chartPoints[chartPoints.length - 1];
      const startX = lastActual ? lastActual.x : 30;
      const startY = lastActual ? lastActual.y : 100;
      const x = startX + (index + 1) * 45;
      const y = startY; // Flat line projection
      return { x, y };
    });

  const forecastPathD = forecastPoints.reduce((acc, pt, i) => {
    const lastActual = chartPoints[chartPoints.length - 1];
    const startX = lastActual ? lastActual.x : 30;
    const startY = lastActual ? lastActual.y : 100;
    return i === 0 ? `M ${startX} ${startY} L ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Carbon Budget Ledger"
        subtitle="Manage and forecast carbon credits allocation against real-time operational logistics emissions."
        action={
          <Button
            onClick={() => {
              setTempLimit(budgetLimit);
              setIsDialogOpen(true);
            }}
            variant="outline"
            className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Annual Budget</span>
          </Button>
        }
      />

      <DemoDataBanner show={!analysis || !analysis.carbonBudget || analysis.carbonBudget.length === 0} />

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
        {/* Left Column: Budget Status & Score Ring */}
        <div className="space-y-4">
          <div className="border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm flex flex-col items-center select-none">
            <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider self-start mb-6">
              Carbon Budget Allocation
            </h3>

            <ScoreRing score={usedPercent} size={150} label="Budget Utilized" />

            <div className="mt-6 text-center space-y-1">
              <p className="text-[16px] font-mono font-medium text-[var(--foreground)]">
                {totalUsed.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg CO₂e
              </p>
              <p className="text-[12px] text-[var(--muted-foreground)] font-sans">
                used of {budgetLimit.toLocaleString()} kg annual limit
              </p>
            </div>

            {/* Breach prediction alert */}
            {usedPercent > 60 && (
              <div className="w-full mt-6 p-3 bg-[var(--trace-danger-light)] border border-[var(--destructive)]/20 text-[var(--destructive)] rounded-md text-[12px] font-sans">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Emissions Breach Prediction</span>
                </div>
                <p className="mt-1 text-[var(--muted-foreground)] leading-normal font-sans">
                  At the current burn rate ({Math.round(avgMonthlyBurn).toLocaleString()} kg/month), a budget breach is projected in <span className="font-mono font-bold text-[var(--destructive)]">{predictedBreachDays} days</span>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Burn Rate Trend */}
        <div className="flex flex-col gap-6">
          {/* Burn rate SVG Line chart */}
          <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm">
            <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider mb-4">
              Monthly Emissions Burn Rate & Forecast
            </h3>
            
            <div className="h-[220px] w-full relative select-none">
              {/* SVG Line Graph */}
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke='var(--border)' strokeDasharray="3" />
                <line x1="0" y1="80" x2="600" y2="80" stroke='var(--border)' strokeDasharray="3" />
                <line x1="0" y1="120" x2="600" y2="120" stroke='var(--border)' strokeDasharray="3" />
                <line x1="0" y1="160" x2="600" y2="160" stroke='var(--border)' strokeDasharray="3" />

                {/* Limit Threshold Line */}
                <line x1="0" y1="100" x2="600" y2="100" stroke='var(--destructive)' strokeWidth="1.5" strokeDasharray="6 3" />
                <text x="500" y="94" fill='var(--destructive)' className="text-[9px] font-mono uppercase tracking-widest font-bold">Limit Cap</text>

                {/* Actual Line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke='var(--primary)'
                    strokeWidth="2.5"
                  />
                )}

                {/* Data Points */}
                {chartPoints.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="4" fill='var(--primary)' />
                ))}

                {/* Forecast Line */}
                {forecastPathD && (
                  <path
                    d={forecastPathD}
                    fill="none"
                    stroke='var(--trace-subtle)'
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>
              
              {/* X-axis labels */}
              <div className="flex justify-between text-[10px] text-[var(--trace-subtle)] border-t border-[var(--border)] pt-1 font-mono mt-2 px-4">
                {months.map((m, idx) => (
                  <span key={idx}>{m.month.split(' ')[0]}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
              Monthly Emissions Log Detail
            </h3>
            <DataTable columns={columns} data={months} />
          </div>

          {/* Activity Carbon Breakdown Table (if real analysis is loaded) */}
          {analysis && analysis.activityCarbonBreakdown && (
            <div className="space-y-3 mt-4">
              <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
                Activity Carbon Emission Breakdown
              </h3>
              <DataTable columns={breakdownColumns} data={analysis.activityCarbonBreakdown} />
            </div>
          )}
        </div>
      </div>

      {/* Adjust Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[400px] bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[var(--foreground)]">
              Adjust Annual Carbon Budget
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdjustBudget} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                Annual Emissions Cap (kg CO₂e)
              </label>
              <Input
                type="number"
                value={tempLimit}
                onChange={(e) => setTempLimit(parseInt(e.target.value) || 0)}
                className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
              />
              <span className="text-[11px] text-[var(--muted-foreground)] font-sans block mt-1">
                Equivalent monthly limit: <span className="font-mono">{(tempLimit / 12).toFixed(0).toLocaleString()} kg / month</span>
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="h-[32px] text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-[32px] text-[12px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white rounded-md"
              >
                Apply Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

---

## app/(dashboard)/ocel/page.tsx

**Summary**: OCEL Upload & Mapping. Allows users to upload Object-Centric Event Logs (OCEL 2.0). Provides a UI to map CSV columns to expected fields and visualizes the process graph.

### Code

```tsx
'use client';

import React, { useState } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, FileSpreadsheet, Play, CheckCircle, FlaskConical } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import FileUpload from '@/components/shared/FileUpload';
import StatCard from '@/components/shared/StatCard';
import { mockOcelNodes, mockOcelEdges, mockOcelMetadata } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { uploadOcelFile } from '@/lib/api';
import { useAnalysis, UploadResponse } from '@/lib/AnalysisContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { ColumnMapping, MappingField } from '@/lib/types';
import { AxiosError } from 'axios';

export default function OcelPage() {
  const { analysis, setAnalysis } = useAnalysis();
  const { activeWorkspaceId } = useWorkspace();

  // Real backend states / Derived states
  const [isDemo, setIsDemo] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(() => {
    if (analysis?.metadata) {
      return new File([''], analysis.metadata.filename || 'uploaded_log.csv', { type: 'text/csv' });
    }
    return null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [errorType, setErrorType] = useState<'422' | '500' | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    missingFields: string[];
    availableColumns: string[];
    detectedMapping?: ColumnMapping;
  } | null>(null);

  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedTimestamp, setSelectedTimestamp] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedWater, setSelectedWater] = useState<string>('');
  const [selectedElectricity, setSelectedElectricity] = useState<string>('');
  const [selectedCost, setSelectedCost] = useState<string>('');

  const [isAdjustingMapping, setIsAdjustingMapping] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);

  const isAnalyzed = isDemo || !!analysis?.metadata;

  const displayedFileName = isDemo 
    ? mockOcelMetadata.filename 
    : (analysis?.metadata?.filename || selectedFile?.name || null);

  const displayedFileSizeStr = isDemo 
    ? 'Demo dataset' 
    : (analysis?.metadata 
        ? 'Active log' 
        : (selectedFile 
            ? `${(selectedFile.size / 1024).toFixed(1)} KB` 
            : ''));

  const [prevWorkspaceId, setPrevWorkspaceId] = useState<number | null>(null);
  if (activeWorkspaceId !== prevWorkspaceId) {
    setPrevWorkspaceId(activeWorkspaceId);
    setSelectedFile(null);
    setErrorType(null);
    setErrorDetails(null);
    setIsAdjustingMapping(false);
  }

  const [prevAnalysis, setPrevAnalysis] = useState<UploadResponse | null>(null);
  if (analysis !== prevAnalysis) {
    setPrevAnalysis(analysis);
    if (analysis?.metadata) {
      setSelectedFile(new File([''], analysis.metadata.filename || 'uploaded_log.csv', { type: 'text/csv' }));
      setErrorType(null);
      setErrorDetails(null);
      setIsAdjustingMapping(false);
    }
  }

  // Helper to read headers from selected file
  const getHeadersFromFile = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      if (file.size === 0) {
        resolve([]);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const firstLine = text.split('\n')[0];
        const headers = firstLine
          .split(',')
          .map((h) => h.trim().replace(/^["']|["']$/g, ''))
          .filter((h) => h.length > 0);
        resolve(headers);
      };
      reader.onerror = () => resolve([]);
      reader.readAsText(file.slice(0, 10000));
    });
  };

  // Derived state directly from analysis or demo data
  const nodes = isDemo ? mockOcelNodes : (analysis?.nodes || []);
  const edges = isDemo ? mockOcelEdges : (analysis?.edges || []);
  const metadata = isDemo ? mockOcelMetadata : (analysis?.metadata || null);

  const isFieldMissing = (field: string) => {
    return errorDetails?.missingFields?.includes(field) || false;
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setAnalysis(null);
    setIsDemo(false);
    setErrorType(null);
    setErrorDetails(null);
    setIsAdjustingMapping(false);
    try {
      const headers = await getHeadersFromFile(file);
      setParsedHeaders(headers);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunAnalysis = async (isManualOverride = false) => {
    if (!selectedFile) return;
    setIsAnalyzing(true);

    let overrideStr: string | undefined = undefined;
    if (isManualOverride) {
      const overrideObj = {
        case_id: selectedCaseId || null,
        activity: selectedActivity || null,
        timestamp: selectedTimestamp || null,
        resource: selectedResource === '— None —' || !selectedResource ? null : selectedResource,
        supplier: selectedSupplier === '— None —' || !selectedSupplier ? null : selectedSupplier,
        water: selectedWater === '— None —' || !selectedWater ? null : selectedWater,
        electricity: selectedElectricity === '— None —' || !selectedElectricity ? null : selectedElectricity,
        cost: selectedCost === '— None —' || !selectedCost ? null : selectedCost
      };
      overrideStr = JSON.stringify(overrideObj);
    } else {
      setErrorType(null);
      setErrorDetails(null);
    }

    try {
      const result = await uploadOcelFile(selectedFile, overrideStr, activeWorkspaceId || undefined);
      setAnalysis(result);
      setIsDemo(false);
      setErrorType(null);
      setErrorDetails(null);
      setIsAdjustingMapping(false);
    } catch (error) {
      console.error(error);
      const err = error as AxiosError<{
        detail?: {
          available_columns?: string[];
          detected_mapping?: ColumnMapping;
          missing_fields?: string[];
        };
        available_columns?: string[];
        detected_mapping?: ColumnMapping;
        missing_fields?: string[];
      }>;
      const status = err.response?.status;
      if (status === 422) {
        const errData = err.response?.data?.detail || err.response?.data;
        setErrorType('422');
        const availableCols = errData?.available_columns || [];
        const detectedMap = (errData?.detected_mapping || {}) as ColumnMapping;

        setErrorDetails({
          missingFields: errData?.missing_fields || [],
          availableColumns: availableCols,
          detectedMapping: detectedMap
        });

        // Pre-populate dropdown states from detected mapping
        setSelectedCaseId(detectedMap.case_id?.column || '');
        setSelectedActivity(detectedMap.activity?.column || '');
        setSelectedTimestamp(detectedMap.timestamp?.column || '');
        setSelectedResource(detectedMap.resource?.column || '— None —');
        setSelectedSupplier(detectedMap.supplier?.column || '— None —');
        setSelectedWater(detectedMap.water?.column || '— None —');
        setSelectedElectricity(detectedMap.electricity?.column || '— None —');
        setSelectedCost(detectedMap.cost?.column || '— None —');
        setIsAdjustingMapping(false);
      } else {
        setErrorType('500');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAdjustMappingClick = () => {
    if (!analysis?.columnMapping) return;
    const mapping = analysis.columnMapping;
    
    setSelectedCaseId(mapping.case_id?.column || '');
    setSelectedActivity(mapping.activity?.column || '');
    setSelectedTimestamp(mapping.timestamp?.column || '');
    setSelectedResource(mapping.resource?.column || '— None —');
    setSelectedSupplier(mapping.supplier?.column || '— None —');
    setSelectedWater(mapping.water?.column || '— None —');
    setSelectedElectricity(mapping.electricity?.column || '— None —');
    setSelectedCost(mapping.cost?.column || '— None —');
    
    setIsAdjustingMapping(true);
  };


  const loadDemoData = () => {
    setErrorType(null);
    setErrorDetails(null);
    setAnalysis(null);
    const file = new File([''], 'louis_india_q3_sc.csv', { type: 'text/csv' });
    setSelectedFile(file);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsDemo(true);
      setIsAnalyzing(false);
    }, 1200);
  };

  const reactFlowNodes = (isDemo ? mockOcelNodes : (nodes || [])).map((node, index) => {
    const xCoord = 50 + index * 200;
    const yCoord = 100 + (index % 2) * 90;
    return {
      id: node.id,
      data: {
        label: (
          <div className="p-1">
            <div className="font-sans font-medium text-[12px] text-[var(--foreground)]">{node.label}</div>
            <div className="font-mono text-[10px] text-[var(--muted-foreground)] mt-0.5">Freq: {node.frequency}</div>
            <div className="font-mono text-[9px] text-[var(--trace-subtle)]">Duration: {node.avgDuration}</div>
          </div>
        )
      },
      position: { x: xCoord, y: yCoord },
      style: {
        background: 'var(--background)',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        color: 'var(--foreground)',
        width: 170,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    };
  });

  const reactFlowEdges = (isDemo ? mockOcelEdges : (edges || [])).map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: `${edge.frequency}x (${edge.avgDelay})`,
    labelStyle: { fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'monospace', fontWeight: 500 },
    labelBgPadding: [4, 2] as [number, number],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: 'var(--card)', color: 'var(--muted-foreground)' },
    style: { stroke: 'var(--trace-subtle)', strokeWidth: 1.5 },
    animated: true
  }));

  // Get all columns for dropdowns
  const getDropdownColumns = () => {
    if (parsedHeaders && parsedHeaders.length > 0) return parsedHeaders;
    if (errorDetails?.availableColumns && errorDetails.availableColumns.length > 0) {
      return errorDetails.availableColumns;
    }
    if (analysis?.columnMapping) {
      const cols: string[] = [];
      const mapping = analysis.columnMapping;
      const fields: (keyof Omit<ColumnMapping, 'mappingSource'>)[] = ['case_id', 'activity', 'timestamp', 'resource', 'supplier', 'water', 'electricity', 'cost'];
      for (const field of fields) {
        const col = (mapping[field] as MappingField)?.column;
        if (col && !cols.includes(col)) {
          cols.push(col);
        }
      }
      return cols;
    }
    return [];
  };
  const availableColumns = getDropdownColumns();

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="OCEL 2.0 Process Mining"
        subtitle="Upload Object-Centric Event Logs to map process paths, throughput, and carbon footprints."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={loadDemoData}
            className="h-[32px] text-[12px] text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] rounded-md"
          >
            <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
            Load Demo Event Log
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 flex-1 items-start">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm">
            <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider mb-3">
              Event Log Upload
            </h3>

            <FileUpload onFileSelect={handleFileSelect} placeholder="Drop OCEL 2.0 CSV/XML" />

            {(selectedFile || displayedFileName) && (
              <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-3.5">
                <div className="flex items-start gap-2.5 p-2 bg-[var(--card)] rounded-md border border-[var(--border)]">
                  <FileSpreadsheet className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-[12px] font-sans font-medium text-[var(--foreground)] truncate">
                      {displayedFileName}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-mono">
                      {displayedFileSizeStr}
                    </p>
                  </div>
                </div>

                {(((errorType === '422' && errorDetails) || isAdjustingMapping)) && (
                  <div className={`p-3.5 border ${isAdjustingMapping ? 'border-[var(--border)]' : 'border-[var(--destructive)]/30'} bg-[var(--background)] rounded-md text-[12px] font-sans space-y-4`}>
                    <div className="space-y-1">
                      <p className={`font-medium ${isAdjustingMapping ? 'text-[var(--foreground)]' : 'text-[var(--destructive)]'}`}>
                        {isAdjustingMapping ? 'Adjust Column Mapping' : 'Column Mapping Required'}
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        {isAdjustingMapping 
                          ? 'Review and adjust your column mappings below.' 
                          : "We couldn't confidently detect your columns — please confirm them below."}
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-1">
                      {/* Case ID */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('case_id') ? 'text-red-600' : 'text-[var(--foreground)]'}`}>
                          Case ID (Required)
                        </label>
                        <select
                          value={selectedCaseId}
                          onChange={(e) => setSelectedCaseId(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                            isFieldMissing('case_id') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[var(--border)] text-[var(--foreground)]'
                          }`}
                        >
                          <option value="">-- Select Column --</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Activity */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('activity') ? 'text-red-600' : 'text-[var(--foreground)]'}`}>
                          Activity (Required)
                        </label>
                        <select
                          value={selectedActivity}
                          onChange={(e) => setSelectedActivity(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                            isFieldMissing('activity') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[var(--border)] text-[var(--foreground)]'
                          }`}
                        >
                          <option value="">-- Select Column --</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Timestamp */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('timestamp') ? 'text-red-600' : 'text-[var(--foreground)]'}`}>
                          Timestamp (Required)
                        </label>
                        <select
                          value={selectedTimestamp}
                          onChange={(e) => setSelectedTimestamp(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                            isFieldMissing('timestamp') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[var(--border)] text-[var(--foreground)]'
                          }`}
                        >
                          <option value="">-- Select Column --</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Resource */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('resource') ? 'text-red-600' : 'text-[var(--foreground)]'}`}>
                          Resource (Optional)
                        </label>
                        <select
                          value={selectedResource}
                          onChange={(e) => setSelectedResource(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                            isFieldMissing('resource') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[var(--border)] text-[var(--foreground)]'
                          }`}
                        >
                          <option value="— None —">— None —</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Supplier */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('supplier') ? 'text-red-600' : 'text-[var(--foreground)]'}`}>
                          Supplier (Optional)
                        </label>
                        <select
                          value={selectedSupplier}
                          onChange={(e) => setSelectedSupplier(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                            isFieldMissing('supplier') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[var(--border)] text-[var(--foreground)]'
                          }`}
                        >
                          <option value="— None —">— None —</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Water */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('water') ? 'text-red-600' : 'text-[var(--foreground)]'}`}>
                          Water (Optional)
                        </label>
                        <select
                          value={selectedWater}
                          onChange={(e) => setSelectedWater(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                            isFieldMissing('water') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[var(--border)] text-[var(--foreground)]'
                          }`}
                        >
                          <option value="— None —">— None —</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Electricity */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('electricity') ? 'text-red-600' : 'text-[var(--foreground)]'}`}>
                          Electricity (Optional)
                        </label>
                        <select
                          value={selectedElectricity}
                          onChange={(e) => setSelectedElectricity(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                            isFieldMissing('electricity') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[var(--border)] text-[var(--foreground)]'
                          }`}
                        >
                          <option value="— None —">— None —</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Cost */}
                      <div className="space-y-1">
                        <label className={`block text-[11px] font-medium ${isFieldMissing('cost') ? 'text-red-600' : 'text-[var(--foreground)]'}`}>
                          Cost (Optional)
                        </label>
                        <select
                          value={selectedCost}
                          onChange={(e) => setSelectedCost(e.target.value)}
                          className={`w-full h-8 px-2 bg-white border rounded text-[12px] font-sans focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                            isFieldMissing('cost') ? 'border-red-500 bg-red-50 text-red-900 font-medium' : 'border-[var(--border)] text-[var(--foreground)]'
                          }`}
                        >
                          <option value="— None —">— None —</option>
                          {availableColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button
                        onClick={() => handleRunAnalysis(true)}
                        disabled={isAnalyzing || !selectedCaseId || !selectedActivity || !selectedTimestamp}
                        className="flex-1 h-[36px] bg-[var(--primary)] hover:bg-[var(--trace-success)] disabled:bg-[var(--primary)]/60 text-white font-sans text-[13px] font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Confirm & Upload'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (isAdjustingMapping) {
                            setIsAdjustingMapping(false);
                          } else {
                            setErrorType(null);
                            setErrorDetails(null);
                          }
                        }}
                        className="h-[36px] px-3 text-[12px] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--card)] rounded-md"
                      >
                        {isAdjustingMapping ? 'Cancel' : 'Reset'}
                      </Button>
                    </div>
                  </div>
                )}

                {errorType === '500' && (
                  <div className="p-3 border border-[var(--destructive)] bg-[var(--trace-danger-light)] rounded-md text-[12px] font-sans space-y-3">
                    <div className="flex items-center gap-1.5 font-medium text-[var(--destructive)]">
                      <span>Analysis Failed</span>
                    </div>
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      A network error or internal server error occurred while processing the file.
                    </p>
                    <Button
                      onClick={() => handleRunAnalysis()}
                      className="w-full h-[32px] bg-[var(--destructive)] hover:bg-[#a82f24] text-white font-sans text-[12px] font-medium rounded-md"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {isAnalyzed && !errorType && !isAdjustingMapping && (
                  <div className="space-y-2 p-2.5 border border-[var(--border)] bg-[var(--accent)] text-[var(--primary)] rounded-md text-[12px] font-sans">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Analysis Completed</span>
                      </div>
                      {!isDemo && (
                        <button
                          onClick={handleAdjustMappingClick}
                          className="text-[11px] font-medium text-[var(--primary)] underline hover:text-[var(--trace-success)] transition-colors focus:outline-none"
                        >
                          Adjust Column Mapping
                        </button>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-[var(--trace-success)] font-mono text-[11px] leading-relaxed">
                      <div>File: {isDemo ? mockOcelMetadata.filename : metadata?.filename}</div>
                      <div>Events: {isDemo ? mockOcelMetadata.totalEvents.toLocaleString() : metadata?.totalEvents?.toLocaleString()}</div>
                      <div>Cases: {isDemo ? mockOcelMetadata.caseCount : metadata?.caseCount}</div>
                      <div>Activities: {isDemo ? mockOcelMetadata.activityCount : metadata?.activityCount}</div>
                    </div>
                  </div>
                )}

                {!isAnalyzed && !errorType && (
                  <Button
                    onClick={() => handleRunAnalysis()}
                    disabled={isAnalyzing}
                    className="w-full h-[36px] bg-[var(--primary)] hover:bg-[var(--trace-success)] disabled:bg-[var(--primary)]/60 text-white font-sans text-[13px] font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isAnalyzing ? 'Analyzing Event Log...' : 'Run Analysis'}</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div className="border border-[var(--border)] rounded-md bg-[var(--background)] h-[480px] w-full relative flex items-center justify-center overflow-hidden shadow-sm">
            {isAnalyzing ? (
              <div className="text-center p-8">
                <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[13px] text-[var(--muted-foreground)] font-mono">Processing event log...</p>
                {selectedFile && selectedFile.size > 5000000 && (
                  <p className="text-[11px] text-[var(--trace-subtle)] mt-2">Large file detected. This may take a minute.</p>
                )}
              </div>
            ) : isAnalyzed ? (
              <ReactFlow
                nodes={reactFlowNodes}
                edges={reactFlowEdges}
                fitView
                className="w-full h-full"
              >
                <Background color='var(--border)' gap={16} />
                <Controls className="react-flow__controls bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm" />
              </ReactFlow>
            ) : (
              <div className="text-center p-8">
                <Database className="w-16 h-16 text-[var(--border)] mx-auto mb-4" strokeWidth={1.5} />
                <h4 className="text-[14px] font-sans font-medium text-[var(--foreground)] mb-1">
                  Visualize Process Graph
                </h4>
                <p className="text-[13px] text-[var(--muted-foreground)] max-w-xs leading-normal mb-4">
                  Upload an event log on the left or load demo data to view the interactive process map.
                </p>
                <Button
                  onClick={loadDemoData}
                  variant="outline"
                  className="h-[32px] text-[12px] text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--accent)] rounded-md"
                >
                  <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                  Load Demo Data
                </Button>
              </div>
            )}
          </div>

          {isAnalyzed && (
            <div className={`grid grid-cols-2 ${(!isDemo && analysis?.totalOperationalCostUSD !== undefined && analysis?.totalOperationalCostUSD !== null) ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
              <StatCard label="Total Cases" value={isDemo ? mockOcelMetadata.caseCount : (metadata?.caseCount ?? '—')} />
              <StatCard label="Unique Activities" value={isDemo ? mockOcelMetadata.activityCount : (metadata?.activityCount ?? '—')} />
              <StatCard label="Process Variants" value={isDemo ? 18 : '—'} />
              <StatCard label="Avg Case Duration" value={isDemo ? '14.8' : '—'} unit={isDemo ? 'h' : undefined} />
              {!isDemo && analysis?.totalOperationalCostUSD !== undefined && analysis?.totalOperationalCostUSD !== null && (
                <StatCard label="Operational Cost" value={`$${analysis.totalOperationalCostUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## app/(dashboard)/forecasting/page.tsx

**Summary**: Emissions Forecasting. Uses historical trends to benchmark different forecasting models (e.g., Naive, Moving Average) and predicts next month's carbon emissions.

### Code

```tsx
'use client';

import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import SectionDivider from '@/components/shared/SectionDivider';
import { useAnalysis } from '@/lib/AnalysisContext';
import { mockForecastingData, mockCarbonBudgetMonths } from '@/lib/mockData';
import { ForecastingBaseline } from '@/lib/types';
import { Info, AlertTriangle } from 'lucide-react';

export default function ForecastingPage() {
  const { analysis } = useAnalysis();

  const isReal = !!(analysis && analysis.forecasting);

  // Derive forecasting data
  const forecasting = (analysis?.forecasting) || mockForecastingData;

  // Derive historical data for the chart
  const historicalBudget = (analysis && analysis.carbonBudget && analysis.carbonBudget.length > 0)
    ? analysis.carbonBudget
    : mockCarbonBudgetMonths;

  // Only plot months that have actual values
  const actualMonths = historicalBudget.filter(m => m.actual > 0);

  // Layout variables for the chart
  const hasData = actualMonths.length > 0;
  const bestBaseline = forecasting.bestBaseline;
  const forecastVal = forecasting.forecastNextMonth?.predictedActualKg ?? 0;

  const actuals = actualMonths.map(m => m.actual);
  const allValues = [...actuals];
  if (forecasting.dataAvailable && forecastVal > 0) {
    allValues.push(forecastVal);
  }

  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 10000;
  const minVal = allValues.length > 0 ? Math.min(...allValues) : 0;
  const valRange = maxVal - minVal || 1;

  // Margins & dimensions for SVG viewBox="0 0 600 220"
  // Width: 600. Height: 220. Plot area: X [50 to 550], Y [20 to 180]
  const totalPointsCount = actualMonths.length + (forecasting.dataAvailable && forecastVal > 0 ? 1 : 0);

  const chartPoints = actualMonths.map((m, index) => {
    const x = 50 + (index / Math.max(1, totalPointsCount - 1)) * 500;
    const y = 180 - ((m.actual - minVal) / valRange) * 160;
    return { x, y, label: m.month, actual: m.actual };
  });

  const pathD = chartPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Next-month forecast coordinates
  const lastPt = chartPoints[chartPoints.length - 1];
  const forecastX = 50 + ((totalPointsCount - 1) / Math.max(1, totalPointsCount - 1)) * 500;
  const forecastY = 180 - ((forecastVal - minVal) / valRange) * 160;
  const forecastPathD = lastPt && forecasting.dataAvailable && forecastVal > 0
    ? `M ${lastPt.x} ${lastPt.y} L ${forecastX} ${forecastY}`
    : '';

  // Table columns definition
  const columns: Column<ForecastingBaseline>[] = [
    {
      header: 'Baseline Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="font-mono font-medium flex items-center gap-2">
          <span>{row.name}</span>
          {row.name === bestBaseline && (
            <span className="text-[9px] bg-trace-success-light text-[#2a7b56] px-1.5 py-0.5 rounded-[3px] font-sans font-bold uppercase tracking-wider">
              Best Fit
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Applicable',
      accessorKey: 'applicable',
      sortable: true,
      cell: (row) => (
        <span className={`text-[12px] font-sans ${row.applicable ? 'text-[#2a7b56] font-medium' : 'text-[#5e5750]'}`}>
          {row.applicable ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: 'MAE (kg CO2e)',
      accessorKey: 'mae',
      isNumeric: true,
      sortable: true,
      cell: (row) => (
        <span className="font-mono">
          {row.applicable && row.mae !== null ? row.mae.toFixed(1) : '—'}
        </span>
      )
    },
    {
      header: 'MAPE (%)',
      accessorKey: 'mape',
      isNumeric: true,
      sortable: true,
      cell: (row) => (
        <span className="font-mono">
          {row.applicable && row.mape !== null ? `${row.mape.toFixed(1)}%` : '—'}
        </span>
      )
    },
    {
      header: 'Model Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        if (!row.applicable) {
          return <StatusBadge status="warning" label="Not enough data" />;
        }
        if (row.name === bestBaseline) {
          return <StatusBadge status="pass" label="Best Fit Model" />;
        }
        return <StatusBadge status="info" label="Benchmarked" />;
      }
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <DemoDataBanner show={!isReal} />
      <PageHeader
        title="Demand & Emissions Forecasting"
        subtitle="Multi-baseline benchmarking to forecast next month's carbon emissions from historical trends."
      />

      {!forecasting.dataAvailable ? (
        /* Insufficient data view (intentional, clean state) */
        <div className="border border-border bg-background p-8 rounded-md shadow-sm max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="bg-trace-warning-light text-trace-warning p-3 rounded-full shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-3 font-sans">
              <h3 className="text-[16px] font-medium text-foreground">
                Insufficient Historical Baseline Data
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                {forecasting.insufficientDataNote || 
                  'The uploaded dataset does not contain enough chronological monthly intervals to compute reliable statistical forecasts.'}
              </p>
              <div className="text-[12px] text-[#5e5750] bg-card p-3 rounded-[3px] border border-border font-mono leading-normal">
                Requirements: Minimum of {forecasting.holdoutMonths + 3} months of active ledger history needed to configure the training & backtest holdout split correctly.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Rich Forecasting Dashboard View */
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Best Baseline"
              value={bestBaseline || 'N/A'}
            />
            <StatCard
              label="Next Month Forecast"
              value={forecastVal ? Math.round(forecastVal).toLocaleString() : '0'}
              unit="kg CO₂e"
            />
            <StatCard
              label="Training History"
              value={forecasting.trainMonths}
              unit="months"
            />
            <StatCard
              label="Backtest Holdout"
              value={forecasting.holdoutMonths}
              unit="months"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6 items-start">
            {/* Left: Model Benchmarking Table */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-sans font-medium text-foreground uppercase tracking-wider">
                Baseline Model Comparisons
              </h3>
              <DataTable
                columns={columns}
                data={forecasting.baselines.map((b, i) => ({ ...b, id: `model-${i}` }))}
              />
            </div>

            {/* Right: SVG Trend Line Chart */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-sans font-medium text-foreground uppercase tracking-wider">
                Emissions Forecast Trend
              </h3>
              <div className="border border-border bg-background p-5 rounded-md shadow-sm">
                <div className="h-[220px] w-full relative select-none">
                  {hasData ? (
                    <svg className="w-full h-full font-sans" viewBox="0 0 600 220" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="50" y1="20" x2="550" y2="20" stroke="#2E2A2A" strokeDasharray="3" />
                      <line x1="50" y1="60" x2="550" y2="60" stroke="#2E2A2A" strokeDasharray="3" />
                      <line x1="50" y1="100" x2="550" y2="100" stroke="#2E2A2A" strokeDasharray="3" />
                      <line x1="50" y1="140" x2="550" y2="140" stroke="#2E2A2A" strokeDasharray="3" />
                      <line x1="50" y1="180" x2="550" y2="180" stroke="#2E2A2A" strokeWidth="1" />

                      {/* Historical actual emissions line */}
                      {pathD && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#D37A53"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Forecast projection line */}
                      {forecastPathD && (
                        <path
                          d={forecastPathD}
                          fill="none"
                          stroke='var(--color-trace-warning, #F59E0B)'
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Historical points */}
                      {chartPoints.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="4.5" fill="#D37A53" stroke="var(--background)" strokeWidth="1.5" />
                          {/* Label X-axis for every 2nd month or if it's the last month to prevent clutter */}
                          {(i % 2 === 0 || i === chartPoints.length - 1) && (
                            <text
                              x={pt.x}
                              y="202"
                              fill="#9A9188"
                              className="text-[9px] font-mono font-medium"
                              textAnchor="middle"
                            >
                              {pt.label}
                            </text>
                          )}
                        </g>
                      ))}

                      {/* Forecasted Point */}
                      {forecasting.dataAvailable && forecastVal > 0 && (
                        <g>
                          <circle cx={forecastX} cy={forecastY} r="6.5" fill="var(--color-trace-warning, #F59E0B)" stroke="var(--background)" strokeWidth="2" />
                          <text
                            x={forecastX}
                            y="202"
                            fill="var(--color-trace-warning, #F59E0B)"
                            className="text-[9px] font-mono font-bold"
                            textAnchor="middle"
                          >
                            Forecast
                          </text>
                          {/* Highlight forecasted value text above the point */}
                          <text
                            x={forecastX}
                            y={forecastY - 12}
                            fill="var(--color-trace-warning, #F59E0B)"
                            className="text-[9.5px] font-mono font-bold"
                            textAnchor="middle"
                          >
                            {Math.round(forecastVal)} kg
                          </text>
                        </g>
                      )}
                    </svg>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[#5e5750] font-sans">
                      No chart data available
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground font-sans justify-center select-none border-t border-border pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-primary rounded-full inline-block"></span>
                    <span>Historical Actuals</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 border-t-2 border-dashed border-trace-warning inline-block"></span>
                    <span>Forecast Projection ({bestBaseline})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SectionDivider />

          {/* Model info card footer */}
          <div className="border border-border bg-background p-4 rounded-md flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-[13px] text-muted-foreground leading-relaxed font-sans">
              <span className="font-semibold text-foreground">How forecasting works:</span> The engine automatically splits historical carbon ledger entries into a training set and a 3-month holdout set. Four standard models are benchmarked (Naive, Moving Average, Linear Trend, and Seasonal Naive) using Mean Absolute Error (MAE) and Mean Absolute Percentage Error (MAPE). The model with the lowest MAE is selected as the Best Fit Model to forecast next month&apos;s emissions.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

```

---

## app/(dashboard)/green-routes/page.tsx

**Summary**: Green Route Recommendations. Suggests alternative transport routes to reduce carbon footprint. Displays estimated carbon savings and cost deltas.

### Code

```tsx
'use client';

import React, { useState } from 'react';
import { CheckCircle, Leaf, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import { mockRouteRecommendations } from '@/lib/mockData';
import { RouteRecommendation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAnalysis } from '@/lib/AnalysisContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function GreenRoutesPage() {
  const { analysis } = useAnalysis();
  
  // Use real backend recommendations when analysis is present, else fall back to mock data
  const recommendations = analysis?.greenRoutes || mockRouteRecommendations;

  const [activeRec, setActiveRec] = useState<RouteRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleApplyRec = (rec: RouteRecommendation) => {
    setActiveRec(rec);
    setIsModalOpen(true);
  };

  const confirmApplyRec = () => {
    if (!activeRec) return;
    setIsModalOpen(false);

    // (Simulated real-time impact skipped since recommendations are derived from context)
    setFeedbackMsg(`Route Optimization Applied: Changed path to "${activeRec.recommendedRoute}". Saved ${activeRec.carbonSaving.toLocaleString()} kg CO₂e.`);
    
    setTimeout(() => {
      setFeedbackMsg('');
    }, 4500); // clear feedback msg after 4.5s
  };

  // Dynamically calculate emissions savings (in tCO2e) and cost delta from active list
  const totalCarbonSavingKg = recommendations.reduce((sum, r) => sum + r.carbonSaving, 0);
  const totalCarbonSavingT = (totalCarbonSavingKg / 1000).toFixed(1);
  const totalCostDelta = recommendations.reduce((sum, r) => sum + r.costDelta, 0);
  const absCostDelta = Math.abs(totalCostDelta);
  const costText = totalCostDelta <= 0
    ? `reduced by $${absCostDelta.toLocaleString()}`
    : `increased by $${absCostDelta.toLocaleString()}`;

  const columns: Column<RouteRecommendation>[] = [
    {
      header: 'Current Route',
      accessorKey: 'currentRoute',
      sortable: true,
      cell: (row) => <span className="text-[var(--destructive)] font-medium">{row.currentRoute}</span>
    },
    {
      header: 'Recommended Route',
      accessorKey: 'recommendedRoute',
      sortable: true,
      cell: (row) => <span className="text-[var(--trace-success)] font-medium">{row.recommendedRoute}</span>
    },
    {
      header: 'Carbon Saving',
      accessorKey: 'carbonSaving',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span className="font-mono text-[var(--trace-success)] font-bold">-{row.carbonSaving.toLocaleString()} kg</span>
    },
    {
      header: 'Cost Delta',
      accessorKey: 'costDelta',
      isNumeric: true,
      sortable: true,
      cell: (row) => {
        const isSaving = row.costDelta <= 0;
        return (
          <span className={`font-mono ${isSaving ? 'text-[var(--trace-success)]' : 'text-[var(--trace-warning)]'}`}>
            {isSaving ? '-' : '+'}${Math.abs(row.costDelta).toLocaleString()}
          </span>
        );
      }
    },
    {
      header: 'Confidence',
      accessorKey: 'confidence',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span className="font-mono">{(row.confidence * 100).toFixed(0)}%</span>
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleApplyRec(row)}
          className="h-[28px] text-[11px] font-sans border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
        >
          <span>Apply</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Green Route Recommendations"
        subtitle="Transport rerouting scenarios computed from real shipment volumes, using industry-typical carbon reduction estimates."
      />

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-[var(--trace-success-light)] border border-[var(--trace-success)]/10 text-[var(--trace-success)] text-[13px] rounded-md font-sans flex items-center gap-2 select-none">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Summary Banner */}
      <div className="flex items-start gap-3 bg-[var(--trace-success-light)] border border-[var(--trace-success)]/10 p-4 rounded-md select-none">
        <Leaf className="w-5 h-5 text-[var(--trace-success)] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[13px] font-sans font-semibold text-[var(--trace-success)]">
            Emissions Optimization Potential
          </h4>
          <p className="text-[12px] text-[var(--muted-foreground)] font-sans mt-0.5">
            Applying all recommendations saves <span className="font-mono font-bold text-[var(--trace-success)]">{totalCarbonSavingT} tCO₂e</span> this quarter. Cumulative shipping costs are <span className="font-mono font-bold text-[var(--trace-success)]">{costText}</span>.
          </p>
        </div>
      </div>

      {/* Recommendations Ledger */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
          Alternative Pathway Recommendations
        </h3>
        <DataTable columns={columns} data={recommendations} />
      </div>

      {/* Apply Confirmation Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[400px] bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[var(--foreground)]">
              Apply Route Recommendation
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[var(--muted-foreground)] pt-1">
              Confirm applying the route optimization plan. This changes active logistics templates to use the recommended route:
              <span className="block mt-2 font-semibold text-[var(--trace-success)]">&quot;{activeRec?.recommendedRoute}&quot;</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="h-[32px] text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApplyRec}
              className="h-[32px] text-[12px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white rounded-md"
            >
              Confirm Optimization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

---

## app/(dashboard)/supplier-fitness/page.tsx

**Summary**: Supplier Fitness Index. Benchmarks carriers and vendors based on their carbon efficiency (CFS). Allows dispatching corrective action requests to underperforming suppliers.

### Code

```tsx
'use client';

import React, { useState } from 'react';
import { Truck, AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { mockSupplierFitness } from '@/lib/mockData';
import { SupplierFitness } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAnalysis } from '@/lib/AnalysisContext';
import { postAuditLog } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function SupplierFitnessPage() {
  const { analysis } = useAnalysis();
  const [actionSupplier, setActionSupplier] = useState<SupplierFitness | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const suppliers = (analysis && analysis.supplierFitness && analysis.supplierFitness.length > 0)
    ? analysis.supplierFitness
    : mockSupplierFitness;

  const handleRequestAction = (supplier: SupplierFitness) => {
    setActionSupplier(supplier);
    setIsAlertOpen(true);
  };

  const confirmActionRequest = () => {
    if (!actionSupplier) return;
    setIsAlertOpen(false);
    setFeedbackMsg(`Corrective action request sent to ${actionSupplier.supplier} successfully.`);
    setTimeout(() => setFeedbackMsg(''), 4000); // clear feedback message after 4s

    // Fire-and-forget persistence call
    postAuditLog(
      'REQUEST_CORRECTIVE_ACTION',
      actionSupplier.supplier,
      `Corrective action requested for ${actionSupplier.supplier} — CFS ${actionSupplier.avgCfsScore.toFixed(1)}%, ${actionSupplier.violationCount} violations`
    ).catch((err) => {
      console.error('Failed to persist audit log:', err);
    });
  };

  // Helper for color-coded CFS pills
  const getCfsPill = (cfs: number) => {
    let bg = 'bg-[var(--trace-success-light)]';
    let text = 'text-[var(--trace-success)]';
    let border = 'border-[var(--trace-success)]/10';

    if (cfs < 50) {
      bg = 'bg-[var(--trace-danger-light)]';
      text = 'text-[var(--destructive)]';
      border = 'border-[var(--destructive)]/10';
    } else if (cfs < 80) {
      bg = 'bg-[var(--trace-warning-light)]';
      text = 'text-[var(--trace-warning)]';
      border = 'border-[var(--trace-warning)]/10';
    }

    return (
      <span className={`inline-flex items-center justify-center px-2 py-0.5 border text-[11px] font-mono font-medium rounded-full ${bg} ${text} ${border} w-[54px]`}>
        {cfs.toFixed(1)}%
      </span>
    );
  };

  const columns: Column<SupplierFitness>[] = [
    {
      header: 'Supplier Name',
      accessorKey: 'supplier',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[var(--muted-foreground)]" />
            <span className="font-medium text-[var(--foreground)]">{row.supplier}</span>
          </div>
          {row.isResourceFallback && (
            <span className="text-[10px] text-[var(--trace-subtle)] ml-6 font-sans italic">
              (via resource column)
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Total Carbon (kg)',
      accessorKey: 'totalCarbonKg',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.totalCarbonKg.toLocaleString()} kg</span>
    },
    {
      header: 'Cases Handled',
      accessorKey: 'caseCount',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.caseCount}</span>
    },
    {
      header: 'Violations Count',
      accessorKey: 'violationCount',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.violationCount}</span>
    },
    {
      header: 'Average CFS',
      accessorKey: 'avgCfsScore',
      isNumeric: true,
      sortable: true,
      cell: (row) => getCfsPill(row.avgCfsScore)
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRequestAction(row)}
          className="h-[28px] text-[11px] font-sans border-[var(--border)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
        >
          <Mail className="w-3 h-3" />
          <span>Request Corrective Action</span>
        </Button>
      )
    }
  ];

  const lowCfsSuppliers = suppliers.filter(s => s.avgCfsScore < 50);

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Supplier ESG Fitness Index"
        subtitle="Benchmark external cargo carriers, transport providers, and Scope 3 vendors by carbon efficiency."
      />

      <DemoDataBanner show={!analysis || !analysis.supplierFitness || analysis.supplierFitness.length === 0} />

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-[var(--trace-success-light)] border border-[var(--trace-success)]/10 text-[var(--trace-success)] text-[13px] rounded-md font-sans flex items-center gap-2 select-none">
          <CheckCircle className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Warning Banner */}
      {lowCfsSuppliers.length > 0 && (
        <div className="flex items-start gap-3 bg-[var(--trace-danger-light)] border border-[var(--destructive)]/10 p-4 rounded-md select-none">
          <AlertTriangle className="w-5 h-5 text-[var(--destructive)] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[13px] font-sans font-semibold text-[var(--destructive)]">
              Action Required
            </h4>
            <p className="text-[12px] text-[var(--muted-foreground)] font-sans mt-0.5">
              {lowCfsSuppliers.length} supplier{lowCfsSuppliers.length > 1 ? 's' : ''} below threshold (CFS &lt; 50). Dispatched freight is causing active carbon ledger deficits. Corrective actions are recommended.
            </p>
          </div>
        </div>
      )}

      {/* Supplier Index Table */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
          Carrier Performance Ledger
        </h3>
        <DataTable columns={columns} data={suppliers} />
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="max-w-[400px] bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[var(--foreground)]">
              Confirm Corrective Action Request
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[var(--muted-foreground)] pt-1">
              Are you sure you want to dispatch a formal carbon-compliance warning and request corrective action plans from {actionSupplier?.supplier}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsAlertOpen(false)}
              className="h-[32px] text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmActionRequest}
              className="h-[32px] text-[12px] bg-[var(--destructive)] hover:bg-[#9B2C21] text-white rounded-md"
            >
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

---

## app/(dashboard)/executive/page.tsx

**Summary**: Executive Dashboard. Provides a high-level summary for executives. Displays composite ESG scores, total violations, best forecasting models, and top supplier risks.

### Code

```tsx
'use client'
import { useAnalysis } from '@/lib/AnalysisContext'
import PageHeader from '@/components/shared/PageHeader'
import { Database } from 'lucide-react'

export default function ExecutiveDashboard() {
  const { analysis } = useAnalysis()
  
  if (!analysis) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.03)_0%,_transparent_60%)] pointer-events-none" />
        <div className="flex flex-col flex-1 items-center justify-center min-h-[400px] relative z-10">
          <Database className="w-12 h-12 text-[var(--trace-muted)] mb-4 opacity-50" />
          <p className="text-[var(--trace-muted)] text-[13px] font-sans">
            No data loaded. Upload an event log first.
          </p>
        </div>
      </div>
    )
  }

  const totalCases = analysis.metadata?.caseCount ?? '—'
  const totalCarbon = analysis.totalCarbonKg?.toFixed(1) ?? '—'
  const violations = analysis.violations?.length ?? 0
  const avgCFS = analysis.cfsScores?.length ? (analysis.cfsScores.reduce((acc: number, curr: any) => acc + curr.cfsScore, 0) / analysis.cfsScores.length).toFixed(1) : '—'
  const bestModel = analysis.forecasting?.bestBaseline ?? '—'
  const nextForecast = analysis.forecasting?.forecastNextMonth?.predictedActualKg?.toFixed(0) ?? '—'
  const suppliers = analysis.supplierFitness ?? []
  const atRiskSuppliers = suppliers.filter((s: any) => (s.avgCfsScore ?? 0) < 90).length

  const esgScore = analysis.esgReport?.overallScore?.toFixed(1) ?? '—'
  
  // Map color strings to semantic classes where possible
  const getViolationsColor = () => violations > 0 ? 'text-[var(--trace-danger)]' : 'text-[var(--trace-success)]'
  const getEsgColor = () => Number(esgScore) >= 80 ? 'text-[var(--trace-success)]' : 'text-[var(--trace-warning)]'
  const getSupplierColor = () => atRiskSuppliers > 0 ? 'text-[var(--trace-warning)]' : 'text-[var(--trace-success)]'

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.03)_0%,_transparent_60%)] pointer-events-none" />
      <div className="flex flex-col flex-1 pt-2 pb-10 relative z-10">
        
        <PageHeader 
          title="Executive Overview" 
          subtitle="Key performance indicators across process, carbon, and compliance."
        />

        {/* Top KPI row — 4 cards */}
        <div className="grid grid-cols-4 gap-4 mb-4 mt-2">
          {[
            { label: 'TOTAL CASES', value: totalCases, sub: 'Event traces analysed', color: 'text-[var(--trace-text)]' },
            { label: 'TOTAL CARBON', value: `${totalCarbon} kg`, sub: 'CO₂e attributed', color: 'text-[var(--trace-text)]' },
            { label: 'VIOLATIONS', value: violations, sub: 'Conformance breaches', color: getViolationsColor() },
            { label: 'ESG SCORE', value: `${esgScore}%`, sub: 'Composite index', color: getEsgColor() },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 flex flex-col justify-between h-[110px]">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <span className="text-[10px] text-[var(--trace-muted)] font-mono tracking-widest relative z-10">{label}</span>
              <div className="mt-2 flex items-baseline gap-1 relative z-10">
                <span className={`text-[28px] font-mono font-bold leading-none ${color}`}>{value}</span>
              </div>
              <p className="mt-auto text-[11px] font-sans text-[var(--trace-muted)] relative z-10">{sub}</p>
            </div>
          ))}
        </div>

        {/* Second row — 3 cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Carbon Fitness */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 h-full">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <p className="text-[10px] font-mono text-[var(--trace-muted)] tracking-widest mb-3 relative z-10">CARBON FITNESS</p>
            <p className="text-3xl font-mono font-bold text-[var(--trace-accent)] mb-1 relative z-10">{avgCFS}%</p>
            <p className="text-xs font-sans text-[var(--trace-muted)] relative z-10">Average CFS across all cases</p>
          </div>

          {/* Supplier Risk */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 h-full">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <p className="text-[10px] font-mono text-[var(--trace-muted)] tracking-widest mb-3 relative z-10">SUPPLIER RISK</p>
            <p className={`text-3xl font-mono font-bold mb-1 relative z-10 ${getSupplierColor()}`}>
              {atRiskSuppliers} / {suppliers.length}
            </p>
            <p className="text-xs font-sans text-[var(--trace-muted)] relative z-10">At-risk suppliers (CFS &lt; 90%)</p>
            <div className="mt-3 flex flex-col gap-1.5 relative z-10">
              {suppliers.slice(0, 3).map((s: any) => {
                const cfsValue = s.avgCfsScore ?? null
                const isGood = (cfsValue ?? 0) >= 90
                return (
                  <div key={s.supplier} className="flex justify-between items-center bg-white/[0.02] px-2 py-1 rounded">
                    <span className="text-xs text-[var(--trace-muted)] font-mono truncate mr-2">{s.supplier}</span>
                    <span className={`text-xs font-mono shrink-0 ${isGood ? 'text-[var(--trace-success)]' : 'text-[var(--trace-danger)]'}`}>
                      {cfsValue != null ? `${cfsValue.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Forecasting */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 h-full">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <p className="text-[10px] font-mono text-[var(--trace-muted)] tracking-widest mb-3 relative z-10">NEXT MONTH FORECAST</p>
            <div className="mt-2 flex items-baseline gap-1 relative z-10">
              <span className="text-[28px] font-mono font-bold text-[var(--trace-text)] leading-none">{nextForecast}</span>
              {nextForecast !== '—' && <span className="text-[var(--trace-muted)] text-[13px] font-sans">kg</span>}
            </div>
            <p className="mt-auto pt-4 text-xs font-sans text-[var(--trace-muted)] relative z-10">Model: {bestModel}</p>
          </div>
        </div>

        {/* Third row — top violations table */}
        <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
          <p className="text-[10px] font-mono text-[var(--trace-muted)] tracking-widest mb-4 relative z-10">TOP VIOLATIONS</p>
          <div className="grid grid-cols-[1fr_1fr_100px_80px] gap-2 text-[10px] font-mono text-[var(--trace-subtle)] uppercase tracking-wider border-b border-white/[0.07] pb-2 px-2 relative z-10">
            <span>Case</span>
            <span>Activity</span>
            <span>Severity</span>
            <span className="text-right">Carbon Δ</span>
          </div>
          <div className="flex flex-col relative z-10 mt-1">
            {(analysis.violations ?? []).slice(0, 6).map((v: any, i: number) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_100px_80px] gap-2 px-2 py-2.5 rounded text-[12px] font-sans hover:bg-white/[0.02] transition-colors items-center border-b border-white/[0.03] last:border-0">
                <span className="text-xs font-mono text-[var(--trace-muted)]">{v.caseId ?? '—'}</span>
                <span className="text-xs text-[var(--trace-text)]">{v.activity ?? '—'}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded w-max ${v.severity === 'CRITICAL' ? 'bg-[var(--trace-danger)]/10 text-[var(--trace-danger)]' : 'bg-[var(--trace-warning)]/10 text-[var(--trace-warning)]'}`}>
                  {v.severity ?? '—'}
                </span>
                <span className="text-xs font-mono text-[var(--trace-danger)] text-right">
                  +{v.carbonDeltaKg?.toFixed(2) ?? '—'} kg
                </span>
              </div>
            ))}
          </div>
          {(!analysis.violations || analysis.violations.length === 0) && (
            <div className="py-8 text-center text-[var(--trace-muted)] text-[12px] font-sans relative z-10">
              No violations detected.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

```

---

## app/(dashboard)/conformance/page.tsx

**Summary**: Conformance Violations. Lists individual violations of ESG policies. Shows the delta carbon impact of each violation and provides detailed narrative explanations.

### Code

```tsx
'use client';

import React, { useState } from 'react';
import { AlertTriangle, FileCode, Upload, Eye } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { mockViolations } from '@/lib/mockData';
import { Violation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAnalysis } from '@/lib/AnalysisContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

export default function ConformancePage() {
  const { analysis } = useAnalysis();
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [modelFile, setModelFile] = useState<string>('decarbonization_policy_rules_v2.pnml');

  const isReal = !!(analysis && analysis.cfsScores && analysis.cfsScores.length > 0);

  const violations = isReal ? (analysis?.violations || []) : mockViolations;

  const handleRowClick = (violation: Violation) => {
    setSelectedViolation(violation);
    setIsDetailOpen(true);
  };

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setModelFile(e.target.files[0].name);
    }
  };

  // Compute dynamic stats
  const totalViolations = violations.length;
  const totalExcessCarbon = violations.reduce((sum, v) => sum + v.carbonDeltaKg, 0);
  const criticalCount = violations.filter(v => v.severity === 'critical').length;

  const columns: Column<Violation>[] = [
    {
      header: 'Case ID',
      accessorKey: 'caseId',
      sortable: true,
      cell: (row) => <span className="font-mono text-[12px]">{row.caseId}</span>
    },
    {
      header: 'Activity',
      accessorKey: 'activity',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-sans font-medium">{row.activity}</span>
          {row.estimated && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold bg-[var(--trace-warning-light)] text-[var(--trace-warning)] border border-[var(--trace-warning)]/20 uppercase tracking-wider">
              Estimated factor
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Mandated Alternative',
      accessorKey: 'mandatedAlternative',
      sortable: true,
      cell: (row) => <span className="font-sans font-medium text-[var(--primary)]">{row.mandatedAlternative}</span>
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[10px] uppercase text-[var(--muted-foreground)] px-1.5 py-0.5 bg-[var(--card)] border border-[var(--border)] rounded">
          {row.category}
        </span>
      )
    },
    {
      header: 'Severity',
      accessorKey: 'severity',
      sortable: true,
      cell: (row) => {
        const severityStyles = {
          critical: 'bg-[var(--trace-danger-light)] text-[var(--destructive)] border-[#FCA5A5]/40',
          warning: 'bg-[var(--trace-warning-light)] text-[var(--trace-warning)] border-[#FDE68A]/40',
          info: 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)]'
        };
        const style = severityStyles[row.severity] || severityStyles.info;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider border ${style}`}>
            {row.severity}
          </span>
        );
      }
    },
    {
      header: 'Carbon Delta (kg)',
      accessorKey: 'carbonDeltaKg',
      isNumeric: true,
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[12px] font-semibold text-[var(--destructive)]">
          +{row.carbonDeltaKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRowClick(row)}
          className="h-[28px] text-[11px] font-sans border-[var(--border)] hover:bg-[var(--card)] flex items-center gap-1 rounded-md"
        >
          <Eye className="w-3 h-3" />
          <span>Details</span>
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Process Conformance Audits"
        subtitle="Compare actual paths against normative ESG policies to flag compliance and emission loops."
      />

      <DemoDataBanner show={!isReal} />

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Gaps */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
            Active Gaps
          </span>
          <div className="mt-3 flex items-baseline gap-2 select-all">
            <span className="text-[32px] font-mono font-medium text-[var(--destructive)] leading-none">
              {totalViolations}
            </span>
            {criticalCount > 0 && (
              <span className="text-[12px] font-sans text-[var(--muted-foreground)]">
                ({criticalCount} Critical)
              </span>
            )}
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)] mt-2 font-sans">
            Total detected policy non-conformance loops
          </span>
        </div>

        {/* Excess Carbon */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
            Excess Emissions
          </span>
          <div className="mt-3 flex items-baseline gap-1 select-all">
            <span className="text-[32px] font-mono font-medium text-[var(--trace-warning)] leading-none">
              {totalExcessCarbon.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[14px] font-sans text-[var(--muted-foreground)] font-normal lowercase ml-0.5">
              kg CO₂
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)] mt-2 font-sans">
            Delta carbon compared to mandated alternatives
          </span>
        </div>

        {/* Audited Process Rules */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
            Active Policy Rules
          </span>
          <div className="mt-3 flex items-baseline gap-1 select-all">
            <span className="text-[32px] font-mono font-medium text-[var(--primary)] leading-none">
              4
            </span>
            <span className="text-[12px] font-sans text-[var(--muted-foreground)] ml-1">
              Rules Policed
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)] mt-2 font-sans">
            Logistics & Waste categories audited automatically
          </span>
        </div>
      </div>

      {/* Violations Table Section */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
          Active Conformance Violations ({totalViolations})
        </h3>
        <DataTable
          columns={columns}
          data={violations}
          onRowClick={handleRowClick}
        />
        {isReal && violations.length === 0 && (
          <div className="p-4 border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] rounded-md text-[12px] font-sans space-y-1">
            <p className="font-semibold text-[var(--foreground)]">
              0 violations detected
            </p>
            <p className="text-[11px] leading-relaxed">
              Current rules check for these activity names:{" "}
              <span className="font-semibold text-[var(--primary)]">
                {analysis?.conformanceRuleScope
                  ? analysis.conformanceRuleScope.flatMap((r) => r.disallowed_activities).join(", ")
                  : "Air Freight Dispatch, Truck Delivery Transport Dispatch, Incineration Disposal, Landfill Disposal"}
              </span>.
            </p>
          </div>
        )}
      </div>

      {/* Bottom: Normative Model Upload */}
      <div className="border border-[var(--border)] bg-[var(--card)] rounded-md p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm select-none">
        <div className="flex items-center gap-3">
          <FileCode className="w-8 h-8 text-[var(--primary)]" strokeWidth={1.5} />
          <div>
            <h4 className="text-[14px] font-sans font-medium text-[var(--foreground)]">
              Normative Process Policy Model
            </h4>
            <p className="text-[12px] text-[var(--muted-foreground)] font-sans mt-0.5">
              Active Ruleset: <span className="font-mono text-[11px] text-[var(--foreground)] font-medium">{modelFile}</span>
            </p>
          </div>
        </div>
        
        <div>
          <label className="h-[32px] text-[12px] font-sans font-medium bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--card)] text-[var(--foreground)] flex items-center gap-1.5 px-3 rounded-md cursor-pointer select-none transition-colors border-solid">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Reference Model (.pnml)</span>
            <input
              type="file"
              accept=".pnml,.csv"
              onChange={handleModelUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Slide-over Detail Panel */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-[460px] bg-[var(--background)] border-l border-[var(--border)] p-6 shadow-md overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-[var(--border)] mb-6">
            <SheetTitle className="text-[16px] font-sans font-medium text-[var(--foreground)] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[var(--destructive)]" />
              <span>Violation Audit Record</span>
            </SheetTitle>
            <SheetDescription className="text-[12px] text-[var(--muted-foreground)]">
              Details for compliance investigation of case {selectedViolation?.caseId}
            </SheetDescription>
          </SheetHeader>

          {selectedViolation && (
            <div className="space-y-6">
              {/* Core Attributes */}
              <div className="grid grid-cols-2 gap-4 border border-[var(--border)] rounded-md p-3.5 bg-[var(--card)]">
                <div>
                  <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Case Identifier</span>
                  <span className="text-[13px] font-mono font-medium text-[var(--foreground)]">{selectedViolation.caseId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Timestamp</span>
                  <span className="text-[13px] font-mono text-[var(--foreground)]">{selectedViolation.timestamp}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Logged Activity</span>
                  <span className="text-[13px] font-sans font-medium text-[var(--foreground)]">{selectedViolation.activity}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-[var(--muted-foreground)] font-sans uppercase tracking-wider block">Violation Category</span>
                  <span className="text-[13px] font-mono text-[var(--destructive)] font-medium uppercase">{selectedViolation.category}</span>
                </div>
              </div>

              {/* Conformance Metrics */}
              <div className="space-y-3">
                <h4 className="text-[12px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">Policy Requirement</h4>
                <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--background)] space-y-3">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[var(--muted-foreground)]">Mandated Alternative:</span>
                    <span className="font-semibold text-[var(--primary)]">{selectedViolation.mandatedAlternative}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[var(--muted-foreground)]">Severity Level:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold uppercase tracking-wider border ${
                      selectedViolation.severity === 'critical' ? 'bg-[var(--trace-danger-light)] text-[var(--destructive)] border-[#FCA5A5]/40' :
                      selectedViolation.severity === 'warning' ? 'bg-[var(--trace-warning-light)] text-[var(--trace-warning)] border-[#FDE68A]/40' :
                      'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)]'
                    }`}>
                      {selectedViolation.severity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[var(--muted-foreground)]">Emission Factor:</span>
                    <span className="font-mono text-[var(--foreground)]">
                      {selectedViolation.estimated ? 'Estimated' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Excess carbon stats */}
              <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--trace-danger-light)]/40 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[var(--destructive)] font-sans font-medium uppercase tracking-wider block">Carbon Gaps Impact</span>
                  <span className="text-[12px] text-[var(--muted-foreground)] font-sans mt-0.5 block">Estimated excess overhead emissions</span>
                </div>
                <span className="text-[20px] font-mono font-bold text-[var(--destructive)]">
                  +{selectedViolation.carbonDeltaKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
                </span>
              </div>

              {/* Narrative explanation */}
              <div className="space-y-1.5 border border-[var(--border)] rounded-md p-3.5 bg-[var(--background)]">
                <h5 className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Audited Gaps Explanation</h5>
                <p className="text-[13px] text-[var(--foreground)] font-sans leading-relaxed">
                  Logistics policy breach detected: {selectedViolation.activity} was used instead of the mandated lower-carbon alternative {selectedViolation.mandatedAlternative}. This bypass {
                    selectedViolation.category === 'transport'
                      ? 'violates regional shipping/logistics policy'
                      : selectedViolation.category === 'waste'
                      ? 'violates waste management policy'
                      : 'violates environmental policy'
                  } and results in excess {selectedViolation.carbonDeltaKg.toLocaleString()} kg of CO₂ emissions.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsDetailOpen(false)}
                  className="flex-1 h-[36px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white text-[13px] rounded-md"
                >
                  Acknowledge & Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

```

---

