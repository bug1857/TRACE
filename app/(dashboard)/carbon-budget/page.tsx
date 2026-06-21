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
          <span className={isOver ? 'text-[#C0392B] font-medium' : 'text-[#166534]'}>
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
        if (row.actual === 0) return <span className="text-[#9B9891] text-[12px] font-mono">Forecast</span>;
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
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/20 uppercase">
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
        <span className="font-mono text-[10px] uppercase text-[#6B6963] px-1.5 py-0.5 bg-[#F3F2EE] border border-[#E2E0D8] rounded">
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
      cell: (row) => <span className="font-mono text-[12px] font-medium text-[#C0392B]">{row.totalCarbon.toLocaleString()}</span>
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
            className="h-[32px] text-[12px] font-sans font-medium border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] flex items-center gap-1.5 rounded-md"
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
          <div className="border border-[#E2E0D8] bg-[#FAFAF8] p-6 rounded-md shadow-sm flex flex-col items-center select-none">
            <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider self-start mb-6">
              Carbon Budget Allocation
            </h3>

            <ScoreRing score={usedPercent} size={150} label="Budget Utilized" />

            <div className="mt-6 text-center space-y-1">
              <p className="text-[16px] font-mono font-medium text-[#1A1917]">
                {totalUsed.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg CO₂e
              </p>
              <p className="text-[12px] text-[#6B6963] font-sans">
                used of {budgetLimit.toLocaleString()} kg annual limit
              </p>
            </div>

            {/* Breach prediction alert */}
            {usedPercent > 60 && (
              <div className="w-full mt-6 p-3 bg-[#FDECEA] border border-[#C0392B]/20 text-[#C0392B] rounded-md text-[12px] font-sans">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Emissions Breach Prediction</span>
                </div>
                <p className="mt-1 text-[#6B6963] leading-normal font-sans">
                  At the current burn rate ({Math.round(avgMonthlyBurn).toLocaleString()} kg/month), a budget breach is projected in <span className="font-mono font-bold text-[#C0392B]">{predictedBreachDays} days</span>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Burn Rate Trend */}
        <div className="flex flex-col gap-6">
          {/* Burn rate SVG Line chart */}
          <div className="border border-[#E2E0D8] bg-[#FAFAF8] p-5 rounded-md shadow-sm">
            <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider mb-4">
              Monthly Emissions Burn Rate & Forecast
            </h3>
            
            <div className="h-[220px] w-full relative select-none">
              {/* SVG Line Graph */}
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#E2E0D8" strokeDasharray="3" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="#E2E0D8" strokeDasharray="3" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#E2E0D8" strokeDasharray="3" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="#E2E0D8" strokeDasharray="3" />

                {/* Limit Threshold Line */}
                <line x1="0" y1="100" x2="600" y2="100" stroke="#C0392B" strokeWidth="1.5" strokeDasharray="6 3" />
                <text x="500" y="94" fill="#C0392B" className="text-[9px] font-mono uppercase tracking-widest font-bold">Limit Cap</text>

                {/* Actual Line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#2D6A4F"
                    strokeWidth="2.5"
                  />
                )}

                {/* Data Points */}
                {chartPoints.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#2D6A4F" />
                ))}

                {/* Forecast Line */}
                {forecastPathD && (
                  <path
                    d={forecastPathD}
                    fill="none"
                    stroke="#9B9891"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>
              
              {/* X-axis labels */}
              <div className="flex justify-between text-[10px] text-[#9B9891] border-t border-[#E2E0D8] pt-1 font-mono mt-2 px-4">
                {months.map((m, idx) => (
                  <span key={idx}>{m.month.split(' ')[0]}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">
              Monthly Emissions Log Detail
            </h3>
            <DataTable columns={columns} data={months} />
          </div>

          {/* Activity Carbon Breakdown Table (if real analysis is loaded) */}
          {analysis && analysis.activityCarbonBreakdown && (
            <div className="space-y-3 mt-4">
              <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">
                Activity Carbon Emission Breakdown
              </h3>
              <DataTable columns={breakdownColumns} data={analysis.activityCarbonBreakdown} />
            </div>
          )}
        </div>
      </div>

      {/* Adjust Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[400px] bg-[#FAFAF8] border border-[#E2E0D8] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[#1A1917]">
              Adjust Annual Carbon Budget
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdjustBudget} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
                Annual Emissions Cap (kg CO₂e)
              </label>
              <Input
                type="number"
                value={tempLimit}
                onChange={(e) => setTempLimit(parseInt(e.target.value) || 0)}
                className="h-[34px] text-[13px] bg-[#F3F2EE] border-[#E2E0D8] text-[#1A1917] rounded-md focus:border-[#2D6A4F]"
              />
              <span className="text-[11px] text-[#6B6963] font-sans block mt-1">
                Equivalent monthly limit: <span className="font-mono">{(tempLimit / 12).toFixed(0).toLocaleString()} kg / month</span>
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="h-[32px] text-[12px] text-[#6B6963] hover:bg-[#F3F2EE] rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-[32px] text-[12px] bg-[#2D6A4F] hover:bg-[#166534] text-white rounded-md"
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
