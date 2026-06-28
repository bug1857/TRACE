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
