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
