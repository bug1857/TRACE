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
              <span>{avgCfs}%</span>
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
              <span>{totalCases}</span>
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
              <span>{totalViolations}</span>
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
