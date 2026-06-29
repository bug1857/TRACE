'use client';

import React from 'react';
import { useAnalysis } from '@/lib/AnalysisContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { Database, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { analysis } = useAnalysis();

  const hasAnalysis = !!analysis;

  // ── KPI computations ────────────────────────────────────────────────────
  const totalCarbonKg = analysis?.totalCarbonKg ?? null;
  const totalCarbonFormatted =
    totalCarbonKg !== null
      ? totalCarbonKg.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : '—';

  const intensity =
    totalCarbonKg !== null
      ? (totalCarbonKg / (analysis?.metadata?.rowCount || 1)).toFixed(1)
      : '—';

  const avgCfs =
    analysis?.cfsScores?.length
      ? analysis.cfsScores.reduce(
          (sum: number, c: any) => sum + (c.cfsScore || 0),
          0
        ) / analysis.cfsScores.length
      : null;
  const netZeroFormatted =
    avgCfs !== null ? `${Math.min(Math.round(avgCfs), 100)}%` : '—';

  const energyKwh = analysis?.brsrReport?.sectionC?.resourceDraw?.energyKwh;
  const energyFormatted =
    energyKwh
      ? (energyKwh / 1_000_000).toLocaleString(undefined, {
          maximumFractionDigits: 1,
        })
      : '—';

  // ── Derive year badge from carbon budget date range ─────────────────────
  const yearBadge = (() => {
    const budget = analysis?.carbonBudget;
    if (!budget || budget.length === 0) return null;
    // carbonBudget months are strings like "Jan 2024"
    const lastMonth = budget[budget.length - 1]?.month ?? '';
    const match = lastMonth.match(/\d{4}/);
    return match ? match[0] : null;
  })();

  // ── Chart data ──────────────────────────────────────────────────────────
  const areaData = analysis?.carbonBudget ?? [];

  // Top 8 activities by total carbon — replaces the fake scope pie chart
  const activityBarData = (() => {
    const breakdown = analysis?.activityCarbonBreakdown ?? [];
    return breakdown
      .slice(0, 8)
      .map((item: any) => ({
        name:
          item.activity.length > 18
            ? item.activity.slice(0, 16) + '…'
            : item.activity,
        fullName: item.activity,
        carbon: item.totalCarbon ?? item.totalCarbonKg ?? 0,
      }));
  })();

  // Recent emissions — only real columns from activityCarbonBreakdown
  const recentData = analysis?.activityCarbonBreakdown?.slice(0, 5) ?? [];

  // Data quality warning
  const droppedRows = analysis?.dataQuality?.droppedRows ?? 0;

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

        {/* Data quality warning banner */}
        {droppedRows > 0 && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 text-[12px] font-sans">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>{droppedRows.toLocaleString()} row{droppedRows !== 1 ? 's' : ''}</strong>{' '}
              were skipped due to unparseable timestamps and excluded from all calculations.
            </span>
          </div>
        )}

        {/* 1. Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[13px] text-trace-muted font-mono tracking-tight uppercase">
            Enterprise Carbon Tracking Dashboard
          </h1>
          {yearBadge && (
            <span className="text-[12px] font-mono bg-white/[0.05] text-trace-muted px-2 py-0.5 rounded">
              {yearBadge}
            </span>
          )}
        </div>

        {/* 2. KPI Strip */}
        <div className="grid grid-cols-4 gap-4">
          {/* Card 1 — Total Emissions */}
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
              {totalCarbonKg !== null && (
                <span className="text-trace-muted text-[13px] font-sans">tCO₂e</span>
              )}
            </div>
            <div className="mt-auto text-trace-muted text-[11px] font-sans relative z-10">
              &mdash;
            </div>
          </div>

          {/* Card 2 — Carbon Intensity */}
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
              {intensity !== '—' && (
                <span className="text-trace-muted text-[13px] font-sans">kg/event</span>
              )}
            </div>
            <div className="mt-auto text-trace-muted text-[11px] font-sans relative z-10">
              &mdash;
            </div>
          </div>

          {/* Card 3 — Net Zero Progress (CFS proxy) */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 flex flex-col justify-between h-[110px] border-l-2 border-l-trace-warning">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-trace-warning shadow-[0_0_8px_rgba(210,153,34,0.6)]" />
            <span className="text-[11px] text-trace-muted uppercase tracking-wider font-sans relative z-10">
              Avg CFS Score
            </span>
            <div className="mt-2 relative z-10">
              <span className="text-[28px] font-mono font-bold text-trace-success leading-none">
                {netZeroFormatted}
              </span>
            </div>
            <div className="mt-auto text-trace-muted text-[11px] font-sans relative z-10">
              &mdash;
            </div>
          </div>

          {/* Card 4 — Energy Use */}
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
              {energyFormatted !== '—' && (
                <span className="text-trace-muted text-[13px] font-sans">GWh</span>
              )}
            </div>
            <div className="mt-auto text-trace-muted text-[11px] font-sans relative z-10">
              &mdash;
            </div>
          </div>
        </div>

        {/* 3. Two-column grid */}
        <div className="grid grid-cols-[1fr_380px] gap-4 mt-4">
          {/* LEFT — Emissions Trend */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 flex flex-col">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h2 className="text-[13px] font-sans font-medium text-trace-text">
                Emissions Trend Over Time
              </h2>
            </div>
            <div className="w-full mt-2 relative z-10">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#7D8590' }}
                    stroke="#484F58"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#7D8590' }}
                    stroke="#484F58"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                    }
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#111',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                    itemStyle={{ fontSize: 11 }}
                    labelStyle={{ color: 'var(--trace-subtle)', marginBottom: 4 }}
                    formatter={(v: any) => [`${Number(v).toLocaleString()} kg CO₂e`, 'Actual']}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--primary)"
                    fill="url(#actualGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT — Top Activities by Carbon */}
          <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 flex flex-col">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <h2 className="text-[13px] font-sans font-medium text-trace-text mb-3 relative z-10">
              Top Activities by Carbon
            </h2>
            {activityBarData.length > 0 ? (
              <div className="w-full flex-1 relative z-10">
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart
                    data={activityBarData}
                    layout="vertical"
                    margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 9, fill: '#7D8590' }}
                      stroke="#484F58"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 9, fill: '#9A9188' }}
                      stroke="#484F58"
                      tickLine={false}
                      axisLine={false}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#111',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                      formatter={(v: any, _name: any, props: any) => [
                        `${Number(v).toLocaleString()} kg CO₂e`,
                        props.payload?.fullName ?? 'Carbon',
                      ]}
                    />
                    <Bar
                      dataKey="carbon"
                      fill="var(--primary)"
                      radius={[0, 3, 3, 0]}
                      opacity={0.85}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-trace-muted text-[12px] font-sans relative z-10">
                No activity carbon data available
              </div>
            )}
          </div>
        </div>

        {/* 4. Recent Emissions Data — only real columns */}
        <div className="relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-5 mt-4">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <h2 className="text-[13px] font-sans font-medium text-trace-text">
              Top Activity Carbon Breakdown
            </h2>
          </div>

          {recentData.length > 0 ? (
            <div className="w-full relative z-10">
              <div className="grid grid-cols-4 text-[10px] text-trace-muted uppercase tracking-wider border-b border-white/[0.07] pb-2 font-sans">
                <div className="col-span-2">Activity</div>
                <div>Category</div>
                <div className="text-right">Total CO₂e (kg)</div>
              </div>
              <div className="flex flex-col">
                {recentData.map((row: any, i: number) => {
                  const categoryName = (row.category || '')
                    .split('_')
                    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-4 py-2.5 text-[12px] font-sans text-trace-text border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors items-center"
                    >
                      <div className="col-span-2 truncate pr-4 font-medium">
                        {row.activity}
                      </div>
                      <div className="text-trace-subtle text-[11px]">
                        {categoryName}
                      </div>
                      <div className="text-right font-mono text-trace-accent">
                        {row.totalCarbon != null
                          ? row.totalCarbon.toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })
                          : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-trace-muted text-[12px] font-sans relative z-10">
              No activity data available.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
