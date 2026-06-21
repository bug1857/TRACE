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
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/20 uppercase tracking-wider">
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
      cell: (row) => <span className="font-sans font-medium text-[#2D6A4F]">{row.mandatedAlternative}</span>
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[10px] uppercase text-[#6B6963] px-1.5 py-0.5 bg-[#F3F2EE] border border-[#E2E0D8] rounded">
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
          critical: 'bg-[#FDECEA] text-[#C0392B] border-[#FCA5A5]/40',
          warning: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]/40',
          info: 'bg-[#FAFAF8] text-[#6B6963] border-[#E2E0D8]'
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
        <span className="font-mono text-[12px] font-semibold text-[#C0392B]">
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
          className="h-[28px] text-[11px] font-sans border-[#E2E0D8] hover:bg-[#F3F2EE] flex items-center gap-1 rounded-md"
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
        <div className="bg-[#FAFAF8] border border-[#E2E0D8] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
            Active Gaps
          </span>
          <div className="mt-3 flex items-baseline gap-2 select-all">
            <span className="text-[32px] font-mono font-medium text-[#C0392B] leading-none">
              {totalViolations}
            </span>
            {criticalCount > 0 && (
              <span className="text-[12px] font-sans text-[#6B6963]">
                ({criticalCount} Critical)
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#6B6963] mt-2 font-sans">
            Total detected policy non-conformance loops
          </span>
        </div>

        {/* Excess Carbon */}
        <div className="bg-[#FAFAF8] border border-[#E2E0D8] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
            Excess Emissions
          </span>
          <div className="mt-3 flex items-baseline gap-1 select-all">
            <span className="text-[32px] font-mono font-medium text-[#B45309] leading-none">
              {totalExcessCarbon.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[14px] font-sans text-[#6B6963] font-normal lowercase ml-0.5">
              kg CO₂
            </span>
          </div>
          <span className="text-[11px] text-[#6B6963] mt-2 font-sans">
            Delta carbon compared to mandated alternatives
          </span>
        </div>

        {/* Audited Process Rules */}
        <div className="bg-[#FAFAF8] border border-[#E2E0D8] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
            Active Policy Rules
          </span>
          <div className="mt-3 flex items-baseline gap-1 select-all">
            <span className="text-[32px] font-mono font-medium text-[#2D6A4F] leading-none">
              4
            </span>
            <span className="text-[12px] font-sans text-[#6B6963] ml-1">
              Rules Policed
            </span>
          </div>
          <span className="text-[11px] text-[#6B6963] mt-2 font-sans">
            Logistics & Waste categories audited automatically
          </span>
        </div>
      </div>

      {/* Violations Table Section */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">
          Active Conformance Violations ({totalViolations})
        </h3>
        <DataTable
          columns={columns}
          data={violations}
          onRowClick={handleRowClick}
        />
        {isReal && violations.length === 0 && (
          <div className="p-4 border border-[#E2E0D8] bg-[#FAFAF8] text-[#6B6963] rounded-md text-[12px] font-sans space-y-1">
            <p className="font-semibold text-[#1A1917]">
              0 violations detected
            </p>
            <p className="text-[11px] leading-relaxed">
              Current rules check for these activity names:{" "}
              <span className="font-semibold text-[#2D6A4F]">
                {analysis?.conformanceRuleScope
                  ? analysis.conformanceRuleScope.flatMap((r) => r.disallowed_activities).join(", ")
                  : "Air Freight Dispatch, Truck Delivery Transport Dispatch, Incineration Disposal, Landfill Disposal"}
              </span>.
            </p>
          </div>
        )}
      </div>

      {/* Bottom: Normative Model Upload */}
      <div className="border border-[#E2E0D8] bg-[#F3F2EE] rounded-md p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm select-none">
        <div className="flex items-center gap-3">
          <FileCode className="w-8 h-8 text-[#2D6A4F]" strokeWidth={1.5} />
          <div>
            <h4 className="text-[14px] font-sans font-medium text-[#1A1917]">
              Normative Process Policy Model
            </h4>
            <p className="text-[12px] text-[#6B6963] font-sans mt-0.5">
              Active Ruleset: <span className="font-mono text-[11px] text-[#1A1917] font-medium">{modelFile}</span>
            </p>
          </div>
        </div>
        
        <div>
          <label className="h-[32px] text-[12px] font-sans font-medium bg-[#FAFAF8] border border-[#E2E0D8] hover:bg-[#F3F2EE] text-[#1A1917] flex items-center gap-1.5 px-3 rounded-md cursor-pointer select-none transition-colors border-solid">
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
        <SheetContent className="w-full sm:max-w-[460px] bg-[#FAFAF8] border-l border-[#E2E0D8] p-6 shadow-md overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-[#E2E0D8] mb-6">
            <SheetTitle className="text-[16px] font-sans font-medium text-[#1A1917] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#C0392B]" />
              <span>Violation Audit Record</span>
            </SheetTitle>
            <SheetDescription className="text-[12px] text-[#6B6963]">
              Details for compliance investigation of case {selectedViolation?.caseId}
            </SheetDescription>
          </SheetHeader>

          {selectedViolation && (
            <div className="space-y-6">
              {/* Core Attributes */}
              <div className="grid grid-cols-2 gap-4 border border-[#E2E0D8] rounded-md p-3.5 bg-[#F3F2EE]">
                <div>
                  <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Case Identifier</span>
                  <span className="text-[13px] font-mono font-medium text-[#1A1917]">{selectedViolation.caseId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Timestamp</span>
                  <span className="text-[13px] font-mono text-[#1A1917]">{selectedViolation.timestamp}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Logged Activity</span>
                  <span className="text-[13px] font-sans font-medium text-[#1A1917]">{selectedViolation.activity}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Violation Category</span>
                  <span className="text-[13px] font-mono text-[#C0392B] font-medium uppercase">{selectedViolation.category}</span>
                </div>
              </div>

              {/* Conformance Metrics */}
              <div className="space-y-3">
                <h4 className="text-[12px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">Policy Requirement</h4>
                <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-3">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[#6B6963]">Mandated Alternative:</span>
                    <span className="font-semibold text-[#2D6A4F]">{selectedViolation.mandatedAlternative}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[#6B6963]">Severity Level:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold uppercase tracking-wider border ${
                      selectedViolation.severity === 'critical' ? 'bg-[#FDECEA] text-[#C0392B] border-[#FCA5A5]/40' :
                      selectedViolation.severity === 'warning' ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]/40' :
                      'bg-[#FAFAF8] text-[#6B6963] border-[#E2E0D8]'
                    }`}>
                      {selectedViolation.severity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[#6B6963]">Emission Factor:</span>
                    <span className="font-mono text-[#1A1917]">
                      {selectedViolation.estimated ? 'Estimated' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Excess carbon stats */}
              <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FDECEA]/40 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#C0392B] font-sans font-medium uppercase tracking-wider block">Carbon Gaps Impact</span>
                  <span className="text-[12px] text-[#6B6963] font-sans mt-0.5 block">Estimated excess overhead emissions</span>
                </div>
                <span className="text-[20px] font-mono font-bold text-[#C0392B]">
                  +{selectedViolation.carbonDeltaKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
                </span>
              </div>

              {/* Narrative explanation */}
              <div className="space-y-1.5 border border-[#E2E0D8] rounded-md p-3.5 bg-[#FAFAF8]">
                <h5 className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider">Audited Gaps Explanation</h5>
                <p className="text-[13px] text-[#1A1917] font-sans leading-relaxed">
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
                  className="flex-1 h-[36px] bg-[#2D6A4F] hover:bg-[#166534] text-white text-[13px] rounded-md"
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
