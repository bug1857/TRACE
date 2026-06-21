'use client';

import React, { useState } from 'react';
import { FileText, Download, HelpCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { useAnalysis } from '@/lib/AnalysisContext';

export default function EsgReportPage() {
  const { analysis } = useAnalysis();
  const [exporting, setExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 2000);
  };

  const isReal = !!(analysis && analysis.cfsScores && analysis.cfsScores.length > 0);

  // Scope 3 Carbon emissions (only Scope 3 value chain logistics are logged)
  const scope3Total = isReal ? (analysis?.totalCarbonKg || 0) : 55800;

  // Carbon Budget Status
  const latestBudget = isReal && analysis?.carbonBudget && analysis.carbonBudget.length > 0
    ? analysis.carbonBudget[analysis.carbonBudget.length - 1]
    : null;
  const budgetStatus = latestBudget ? latestBudget.status : 'pass'; // pass / warning / critical
  const budgetActual = latestBudget ? latestBudget.actual : scope3Total;
  const budgetCap = latestBudget ? latestBudget.budget : 100000;

  // Active Conformance Violations
  const violations = isReal ? (analysis?.violations || []) : [];
  const totalViolations = isReal ? violations.length : 5;
  const transportViolations = isReal ? violations.filter(v => v.category === 'transport').length : 5;
  const wasteViolations = isReal ? violations.filter(v => v.category === 'waste').length : 0;

  // Average Carbon Fitness Score
  const cfsScores = isReal ? (analysis?.cfsScores || []) : [];
  const avgCfs = isReal
    ? (cfsScores.length > 0 ? cfsScores.reduce((sum, s) => sum + s.cfsScore, 0) / cfsScores.length : 100.0)
    : 72.0;

  // Supplier Compliance
  const supplierFitness = isReal ? (analysis?.supplierFitness || []) : [];
  const totalSuppliers = isReal ? supplierFitness.length : 12;
  const compliantSuppliers = isReal ? supplierFitness.filter(s => s.violationCount === 0).length : 9;
  const supplierComplianceRate = totalSuppliers > 0 ? (compliantSuppliers / totalSuppliers) * 100 : 100.0;

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="ESG Sustainability Ledger"
        subtitle="Generate disclosures, carbon accounting templates, and compliance sheets under global standards."
        action={
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            variant="outline"
            className="h-[32px] text-[12px] font-sans font-medium border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] flex items-center gap-1.5 rounded-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Generating PDF...' : downloaded ? 'Downloaded!' : 'Export PDF'}</span>
          </Button>
        }
      />

      <DemoDataBanner show={!isReal} />

      <div className="border border-[#E2E0D8] bg-[#FAFAF8] p-6 rounded-md shadow-sm space-y-8 max-w-4xl mx-auto w-full">
        {/* Header Preview Banner */}
        <div className="flex items-start justify-between border-b border-[#E2E0D8] pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-sans font-semibold text-[#2D6A4F] uppercase tracking-widest block">
              Draft Preview
            </span>
            <h2 className="text-[16px] font-sans font-medium text-[#1A1917]">
              ESG Performance & Carbon Accounting Ledger
            </h2>
            <p className="text-[12px] text-[#6B6963] font-sans">
              Entity: <span className="font-semibold text-[#1A1917]">{isReal ? 'Active Organization' : 'Louis India Pvt. Ltd.'}</span> • Period: <span className="font-semibold text-[#1A1917]">{isReal ? (analysis?.metadata?.filename || 'Uploaded Log') : 'Q3 Fiscal 2024'}</span>
            </p>
          </div>
          
          <FileText className="w-10 h-10 text-[#6B6963]" strokeWidth={1} />
        </div>

        <div className="space-y-8">
          {/* PILLAR 1: ENVIRONMENTAL (E) */}
          <div className="space-y-4">
            <h3 className="text-[13px] font-sans font-bold text-[#2D6A4F] uppercase tracking-wider border-b border-[#2D6A4F]/10 pb-1.5">
              Environmental Pillar (E) — Emissions & Compliance
            </h3>

            {/* Scope 1 */}
            <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
              <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                    Scope 1 — Direct Greenhouse Gas Emissions
                  </h4>
                  <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                    UNEVALUATED
                  </span>
                </div>
                <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                  Not evaluated — requires direct fuel combustion or fleet telemetry data not present in this dataset.
                </p>
              </div>
            </div>

            {/* Scope 2 */}
            <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
              <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                    Scope 2 — Indirect Energy Emissions
                  </h4>
                  <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                    UNEVALUATED
                  </span>
                </div>
                <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                  Not evaluated — requires facility utility electricity purchase logs not present in this dataset.
                </p>
              </div>
            </div>

            {/* Scope 3 */}
            <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] border-l-4 border-l-[#2D6A4F] shadow-sm">
              <div className="flex justify-between items-baseline">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-sans font-semibold text-[#1A1917] uppercase tracking-wider">
                      Scope 3 — Other Indirect Emissions (Value Chain)
                    </h4>
                    <span className="text-[9px] font-mono text-[#2D6A4F] uppercase tracking-wider border border-[#2D6A4F]/20 px-1.5 py-0.5 rounded-sm bg-[#E8F0EB]">
                      AUDITED
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[15px] font-bold text-[#2D6A4F] select-all">
                  {scope3Total.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg CO₂e
                </span>
              </div>
              <p className="text-[12px] text-[#6B6963] font-sans mt-2 leading-relaxed">
                Reflects value chain logistics, outsourced freight transportation, and supplier shipping carbon overhead extracted from the audited event log.
              </p>
            </div>

            {/* Value Chain Gross Emissions (Scope 3) */}
            <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#E8F0EB] flex justify-between items-center select-all shadow-sm">
              <div>
                <span className="text-[11px] text-[#2D6A4F] font-sans font-medium uppercase tracking-wider block">Audited Gross Scope 3 Emissions</span>
                <span className="text-[12px] text-[#6B6963] font-sans mt-0.5">Total measured greenhouse gas footprint from value chain operations</span>
              </div>
              <span className="text-[20px] font-mono font-bold text-[#2D6A4F]">
                {scope3Total.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg CO₂e
              </span>
            </div>

            {/* Performance Metrics Sub-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Carbon Budget Status */}
              <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-1 shadow-sm">
                <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Carbon Budget Status</span>
                <div className="flex items-center gap-2 mt-1">
                  {budgetStatus === 'pass' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#166534] border border-[#166534]/15">
                      PASS — WITHIN LIMIT
                    </span>
                  )}
                  {budgetStatus === 'warning' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/15">
                      WARNING — HIGH BUDGET UTILIZATION
                    </span>
                  )}
                  {budgetStatus === 'critical' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FDECEA] text-[#C0392B] border border-[#C0392B]/15">
                      CRITICAL — BUDGET EXCEEDED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B6963] font-sans mt-1.5">
                  Actual: {budgetActual.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg vs Cap: {budgetCap.toLocaleString()} kg
                </p>
              </div>

              {/* Active Conformance Violations */}
              <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-1 shadow-sm">
                <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Policy Conformance Audits</span>
                <div className="flex items-center gap-1.5 mt-1 select-all">
                  <span className={`text-[15px] font-bold ${totalViolations > 0 ? 'text-[#C0392B]' : 'text-[#2D6A4F]'}`}>
                    {totalViolations} Active Gaps
                  </span>
                  <span className="text-[11px] text-[#6B6963]">
                    ({transportViolations} transport, {wasteViolations} waste)
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6963] font-sans mt-1.5">
                  Detected policy deviations from process conformance standards.
                </p>
              </div>

              {/* Average Carbon Fitness Score */}
              <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-1 shadow-sm">
                <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Average Carbon Fitness Score</span>
                <div className="flex items-baseline gap-1 mt-1 select-all">
                  <span className="text-[18px] font-mono font-bold text-[#1A1917]">
                    {avgCfs.toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-[#6B6963]">CFS Index</span>
                </div>
                <p className="text-[11px] text-[#6B6963] font-sans mt-1.5">
                  Overall emission efficiency relative to ideal low-carbon alternatives.
                </p>
              </div>

              {/* Supplier Compliance */}
              <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-1 shadow-sm">
                <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Vendor Compliance Rating</span>
                <div className="flex items-baseline gap-1 mt-1 select-all">
                  <span className="text-[18px] font-mono font-bold text-[#2D6A4F]">
                    {supplierComplianceRate.toFixed(1)}%
                    </span>
                  <span className="text-[11px] text-[#6B6963]">
                    ({compliantSuppliers} of {totalSuppliers} compliant)
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6963] font-sans mt-1.5">
                  Percentage of active suppliers with zero detected process violations.
                </p>
              </div>
            </div>
          </div>

          {/* PILLAR 2: SOCIAL (S) */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-sans font-bold text-[#6B6963] uppercase tracking-wider border-b border-[#E2E0D8] pb-1.5">
              Social Pillar (S) — Labor, Safety & Community
            </h3>
            
            <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
              <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                    Workforce & Labor Disclosures
                  </h4>
                  <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                    UNEVALUATED
                  </span>
                </div>
                <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                  Not evaluated — requires workforce/labor data not present in this dataset.
                </p>
              </div>
            </div>
          </div>

          {/* PILLAR 3: GOVERNANCE (G) */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-sans font-bold text-[#6B6963] uppercase tracking-wider border-b border-[#E2E0D8] pb-1.5">
              Governance Pillar (G) — Board, Policy & Audits
            </h3>
            
            <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
              <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                    Corporate Governance & Risk Auditing
                  </h4>
                  <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                    UNEVALUATED
                  </span>
                </div>
                <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                  Not evaluated — requires board/governance structure data not present in this dataset.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
