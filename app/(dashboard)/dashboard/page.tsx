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
    { name: 'Scope 1', value: totalCarbonKg * 0.55, color: '#2DD4BF' },
    { name: 'Scope 2', value: totalCarbonKg * 0.35, color: '#3FB950' },
    { name: 'Scope 3', value: totalCarbonKg * 0.10, color: '#D29922' },
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
                      <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0}/>
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
                    labelStyle={{ color: '#94A3B8', marginBottom: 4 }}
                  />
                  <Area type="monotone" dataKey="actual" stroke="#2DD4BF" fill="url(#actualGrad)" strokeWidth={2} />
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
