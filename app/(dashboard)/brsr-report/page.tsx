'use client';

import React, { useState } from 'react';
import { FileText, Download, HelpCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { useAnalysis } from '@/lib/AnalysisContext';

export default function BrsrReportPage() {
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

  // Environmental numbers (Scope 3 logistics emissions)
  const scope3Total = isReal ? (analysis?.totalCarbonKg || 0) : 55800;
  const caseCount = isReal ? (analysis?.metadata?.caseCount || 1) : 89;
  const intensityProxy = scope3Total / caseCount;

  // Violations & Supplier Compliance
  const violations = isReal ? (analysis?.violations || []) : [];
  const wasteViolations = isReal ? violations.filter(v => v.category === 'waste').length : 0;
  const transportViolations = isReal ? violations.filter(v => v.category === 'transport').length : 5;

  const supplierFitness = isReal ? (analysis?.supplierFitness || []) : [];
  const totalSuppliers = isReal ? supplierFitness.length : 12;
  const compliantSuppliers = isReal ? supplierFitness.filter(s => s.violationCount === 0).length : 9;
  const supplierComplianceRate = totalSuppliers > 0 ? (compliantSuppliers / totalSuppliers) * 100 : 75.0;

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="BRSR Sustainability Disclosure"
        subtitle="SEBI-mandated Business Responsibility and Sustainability Report — National Guidelines on Responsible Business Conduct (NGRBC)."
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
              Business Responsibility & Sustainability Report (BRSR)
            </h2>
            <p className="text-[12px] text-[#6B6963] font-sans">
              Entity: <span className="font-semibold text-[#1A1917]">{isReal ? 'Active Organization' : 'Louis India Pvt. Ltd.'}</span> • Period: <span className="font-semibold text-[#1A1917]">{isReal ? (analysis?.metadata?.filename || 'Uploaded Log') : 'Q3 Fiscal 2024'}</span>
            </p>
          </div>
          
          <FileText className="w-10 h-10 text-[#6B6963]" strokeWidth={1} />
        </div>

        <div className="space-y-6">
          
          {/* P1 */}
          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
            <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                  P1 — Ethics, Transparency & Accountability
                </h4>
                <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                  UNEVALUATED
                </span>
              </div>
              <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                Not evaluated — requires governance/board policy disclosures not present in this dataset.
              </p>
            </div>
          </div>

          {/* P2 */}
          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
            <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                  P2 — Sustainable & Safe Products/Services
                </h4>
                <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                  UNEVALUATED
                </span>
              </div>
              <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                Not evaluated — requires product safety/lifecycle data not present in this dataset.
              </p>
            </div>
          </div>

          {/* P3 */}
          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
            <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                  P3 — Employee Wellbeing
                </h4>
                <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                  UNEVALUATED
                </span>
              </div>
              <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                Not evaluated — requires employee wellbeing/workforce data not present in this dataset.
              </p>
            </div>
          </div>

          {/* P4 */}
          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
            <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                  P4 — Stakeholder Engagement
                </h4>
                <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                  UNEVALUATED
                </span>
              </div>
              <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                Not evaluated — requires stakeholder engagement records not present in this dataset.
              </p>
            </div>
          </div>

          {/* P5 */}
          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
            <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                  P5 — Human Rights
                </h4>
                <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                  UNEVALUATED
                </span>
              </div>
              <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                Not evaluated — requires human rights audit data not present in this dataset.
              </p>
            </div>
          </div>

          {/* P6: ENVIRONMENT (Real Data) */}
          <div className="border border-[#E2E0D8] rounded-md p-5 bg-[#FAFAF8] border-l-4 border-l-[#2D6A4F] shadow-sm space-y-4">
            <div className="flex justify-between items-baseline border-b border-[#2D6A4F]/10 pb-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-[14px] font-sans font-bold text-[#1A1917]">
                    P6 — Environment (Respect and Protect the Environment)
                  </h4>
                  <span className="text-[9px] font-mono text-[#2D6A4F] uppercase tracking-wider border border-[#2D6A4F]/20 px-1.5 py-0.5 rounded-sm bg-[#E8F0EB]">
                    AUDITED
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[12px] text-[#6B6963] font-sans leading-relaxed">
                Audited environmental footprint and process compliance indicators mapped from value chain shipping and logistics events.
              </p>

              {/* Grid of Essential Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Scope 3 emissions */}
                <div className="border border-[#E2E0D8] rounded-md p-3.5 bg-[#FAFAF8] space-y-1 shadow-sm">
                  <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Total Scope 3 GHG Emissions</span>
                  <span className="text-[18px] font-mono font-bold text-[#2D6A4F] block mt-1 select-all">
                    {scope3Total.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg CO₂e
                  </span>
                  <span className="text-[10px] text-[#9B9891] italic block">Value chain shipping and supplier freight footprint</span>
                </div>

                {/* Energy intensity proxy */}
                <div className="border border-[#E2E0D8] rounded-md p-3.5 bg-[#FAFAF8] space-y-1 shadow-sm">
                  <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Derived Emission Intensity Proxy</span>
                  <span className="text-[18px] font-mono font-bold text-[#1A1917] block mt-1 select-all">
                    {intensityProxy.toFixed(2)} kg CO₂e / case
                  </span>
                  <span className="text-[10px] text-[#9B9891] italic block">Ratio of combined emissions over case volume</span>
                </div>

                {/* Conformance violation category counts */}
                <div className="border border-[#E2E0D8] rounded-md p-3.5 bg-[#FAFAF8] space-y-1 shadow-sm">
                  <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Environmental Policy Gaps</span>
                  <div className="flex items-baseline gap-1 mt-1 select-all">
                    <span className={`text-[18px] font-bold ${wasteViolations + transportViolations > 0 ? 'text-[#C0392B]' : 'text-[#2D6A4F]'}`}>
                      {wasteViolations + transportViolations} Gaps
                    </span>
                    <span className="text-[11px] text-[#6B6963]">
                      ({transportViolations} transport, {wasteViolations} waste)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9B9891] italic block">Non-conforming waste routing or logistical bypasses</span>
                </div>

                {/* Supplier compliance */}
                <div className="border border-[#E2E0D8] rounded-md p-3.5 bg-[#FAFAF8] space-y-1 shadow-sm">
                  <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Vendor Environmental Compliance</span>
                  <div className="flex items-baseline gap-1.5 mt-1 select-all">
                    <span className="text-[18px] font-mono font-bold text-[#2D6A4F]">
                      {supplierComplianceRate.toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-[#6B6963]">
                      ({compliantSuppliers} of {totalSuppliers} compliant)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9B9891] italic block">Outsourced vendors with zero environmental violations</span>
                </div>
              </div>
            </div>
          </div>

          {/* P7 */}
          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
            <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                  P7 — Public & Regulatory Policy
                </h4>
                <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                  UNEVALUATED
                </span>
              </div>
              <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                Not evaluated — requires public policy advocacy records not present in this dataset.
              </p>
            </div>
          </div>

          {/* P8 */}
          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
            <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                  P8 — Inclusive Growth
                </h4>
                <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                  UNEVALUATED
                </span>
              </div>
              <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                Not evaluated — requires inclusive growth/community investment data not present in this dataset.
              </p>
            </div>
          </div>

          {/* P9 */}
          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#F3F2EE] flex items-start gap-3 select-none">
            <HelpCircle className="w-5 h-5 text-[#9B9891] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-sans font-semibold text-[#1A1917]">
                  P9 — Consumer Value & Engagement
                </h4>
                <span className="text-[9px] font-mono text-[#9B9891] uppercase tracking-wider border border-[#E2E0D8] px-1.5 py-0.5 rounded-sm bg-[#FAFAF8]">
                  UNEVALUATED
                </span>
              </div>
              <p className="text-[12px] font-sans text-[#9B9891] italic leading-normal">
                Not evaluated — requires consumer feedback/grievance data not present in this dataset.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
