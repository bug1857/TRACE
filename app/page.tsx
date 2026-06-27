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
          and supplier fitness scores — in under 90 seconds.
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
            ['Quick Start', 'Upload a CSV with case ID, activity, and timestamp columns. Analysis completes in under 90 seconds.'],
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

