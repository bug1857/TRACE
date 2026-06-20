'use client';

import React, { useState } from 'react';
import { AlertTriangle, FileCode, CheckCircle, Upload, Eye } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockViolations } from '@/lib/mockData';
import { Violation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

export default function ConformancePage() {
  const [violations, setViolations] = useState<Violation[]>(mockViolations);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [modelFile, setModelFile] = useState<string>('decarbonization_policy_rules_v2.pnml');

  const handleRowClick = (violation: Violation) => {
    setSelectedViolation(violation);
    setIsDetailOpen(true);
  };

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setModelFile(e.target.files[0].name);
    }
  };

  // Helper to color code conformance scores
  const getScoreColorClass = (val: number, isPercent = false) => {
    const score = isPercent ? val * 100 : val;
    if (score >= 70) return 'text-[#2D6A4F]';
    if (score >= 50) return 'text-[#B45309]';
    return 'text-[#C0392B]';
  };

  const columns: Column<Violation>[] = [
    {
      header: 'Case ID',
      accessorKey: 'caseId',
      sortable: true
    },
    {
      header: 'Activity',
      accessorKey: 'activity',
      sortable: true
    },
    {
      header: 'Violation Type',
      accessorKey: 'violationType',
      sortable: true
    },
    {
      header: 'Seq. Fit',
      accessorKey: 'sequenceFit',
      isNumeric: true,
      sortable: true,
      cell: (row) => (
        <span className={getScoreColorClass(row.sequenceFit, true)}>
          {row.sequenceFit.toFixed(2)}
        </span>
      )
    },
    {
      header: 'Carbon Fit',
      accessorKey: 'carbonFit',
      isNumeric: true,
      sortable: true,
      cell: (row) => (
        <span className={getScoreColorClass(row.carbonFit, true)}>
          {row.carbonFit.toFixed(2)}
        </span>
      )
    },
    {
      header: 'CFS',
      accessorKey: 'cfs',
      isNumeric: true,
      sortable: true,
      cell: (row) => (
        <span className={`font-medium ${getScoreColorClass(row.cfs)}`}>
          {row.cfs}
        </span>
      )
    },
    {
      header: 'Excess (kg)',
      accessorKey: 'carbonExcess',
      isNumeric: true,
      sortable: true,
      cell: (row) => (
        <span>{row.carbonExcess.toLocaleString()} kg</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => (
        <StatusBadge status={row.status} />
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
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

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sequence Fitness */}
        <div className="bg-[#FAFAF8] border border-[#E2E0D8] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
            Sequence Fitness
          </span>
          <div className="mt-3 flex items-baseline gap-1 select-all">
            <span className="text-[32px] font-mono font-medium text-[#2D6A4F] leading-none">
              0.84
            </span>
          </div>
          <span className="text-[11px] text-[#6B6963] mt-2 font-sans">
            Path routing matching rules. Target &gt; 0.90
          </span>
        </div>

        {/* Carbon Fitness */}
        <div className="bg-[#FAFAF8] border border-[#E2E0D8] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
            Carbon Fitness
          </span>
          <div className="mt-3 flex items-baseline gap-1 select-all">
            <span className="text-[32px] font-mono font-medium text-[#B45309] leading-none">
              0.61
            </span>
          </div>
          <span className="text-[11px] text-[#6B6963] mt-2 font-sans">
            Carbon compliance per route. Target &gt; 0.70
          </span>
        </div>

        {/* Combined CFS */}
        <div className="bg-[#FAFAF8] border border-[#E2E0D8] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px]">
          <span className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">
            Combined CFS
          </span>
          <div className="mt-3 flex items-baseline gap-1 select-all">
            <span className="text-[32px] font-mono font-medium text-[#B45309] leading-none">
              72
            </span>
            <span className="text-[14px] font-mono text-[#6B6963] font-normal lowercase ml-0.5">
              / 100
            </span>
          </div>
          <span className="text-[11px] text-[#6B6963] mt-2 font-sans">
            Overall carbon fitness score. Status: Warning
          </span>
        </div>
      </div>

      {/* Violations Table Section */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">
          Active Conformance Violations ({violations.length})
        </h3>
        <DataTable
          columns={columns}
          data={violations}
          onRowClick={handleRowClick}
        />
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
              <span>Violation Breakdown</span>
            </SheetTitle>
            <SheetDescription className="text-[12px] text-[#6B6963]">
              Details for compliance investigation of {selectedViolation?.caseId}
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
                  <span className="text-[13px] font-sans text-[#C0392B] font-medium">{selectedViolation.violationType}</span>
                </div>
              </div>

              {/* Conformance Metrics */}
              <div className="space-y-3">
                <h4 className="text-[12px] font-sans font-medium text-[#1A1917] uppercase tracking-wider">Conformance Metrics</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="border border-[#E2E0D8] rounded-md p-2 bg-[#FAFAF8] text-center">
                    <span className="text-[9px] text-[#6B6963] uppercase block">Sequence Fit</span>
                    <span className="text-[15px] font-mono font-semibold text-[#1A1917]">{(selectedViolation.sequenceFit * 100).toFixed(0)}%</span>
                  </div>
                  <div className="border border-[#E2E0D8] rounded-md p-2 bg-[#FAFAF8] text-center">
                    <span className="text-[9px] text-[#6B6963] uppercase block">Carbon Fit</span>
                    <span className="text-[15px] font-mono font-semibold text-[#1A1917]">{(selectedViolation.carbonFit * 100).toFixed(0)}%</span>
                  </div>
                  <div className="border border-[#E2E0D8] rounded-md p-2 bg-[#FAFAF8] text-center">
                    <span className="text-[9px] text-[#6B6963] uppercase block">CFS Index</span>
                    <span className="text-[15px] font-mono font-semibold text-[#1A1917]">{selectedViolation.cfs}</span>
                  </div>
                </div>
              </div>

              {/* Excess carbon stats */}
              <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FDECEA]/40 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#C0392B] font-sans font-medium uppercase tracking-wider block">Carbon Excess</span>
                  <span className="text-[13px] text-[#6B6963] font-sans mt-0.5 block">Estimated overhead emissions</span>
                </div>
                <span className="text-[20px] font-mono font-bold text-[#C0392B]">
                  +{selectedViolation.carbonExcess.toLocaleString()} kg
                </span>
              </div>

              {/* Description explanation */}
              <div className="space-y-1.5 border border-[#E2E0D8] rounded-md p-3.5 bg-[#FAFAF8]">
                <h5 className="text-[11px] font-sans font-medium text-[#6B6963] uppercase tracking-wider">Analysis Narrative</h5>
                <p className="text-[13px] text-[#1A1917] font-sans leading-relaxed">
                  {selectedViolation.explanation}
                </p>
                {selectedViolation.expectedActivity && selectedViolation.expectedActivity !== 'N/A' && (
                  <div className="mt-3 pt-3 border-t border-[#E2E0D8] text-[12px] font-sans text-[#6B6963]">
                    Expected Reference Activity:{' '}
                    <span className="font-semibold text-[#2D6A4F]">{selectedViolation.expectedActivity}</span>
                  </div>
                )}
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
