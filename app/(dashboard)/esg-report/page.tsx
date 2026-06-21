'use client';

import React from 'react';
import { Download, CheckCircle, Shield, AlertTriangle, Users, Compass, Globe } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { useAnalysis } from '@/lib/AnalysisContext';
import { EsgReport } from '@/lib/types';
import SectionDivider from '@/components/shared/SectionDivider';

const mockEsgReportData: EsgReport = {
  environmental: {
    score: 72.0,
    totalCarbonKg: 55800.0,
    carbonBudgetStatus: "WITHIN_LIMIT",
    topHotspots: [
      {
        activity: "Road Transport Dispatch",
        category: "road_transport",
        estimated: false,
        frequency: 57,
        totalCarbon: 42000.0
      },
      {
        activity: "Warehouse Pick & Pack",
        category: "warehouse",
        estimated: false,
        frequency: 89,
        totalCarbon: 13800.0
      }
    ],
    dataCompleteness: "full"
  },
  social: {
    score: null,
    supplierCount: 12,
    atRiskSupplierCount: 3,
    note: "Social pillar evaluated via supplier compliance proxy only — no direct labor/community data available in source dataset.",
    dataCompleteness: "partial"
  },
  governance: {
    score: 60.0,
    violationCount: 5,
    auditReadiness: "Needs Review",
    note: "Governance pillar evaluated via process conformance proxy only — no board/policy data available in source dataset.",
    dataCompleteness: "partial"
  },
  overallScore: 66.0
};

export default function EsgReportPage() {
  const { analysis } = useAnalysis();
  const handleExportPDF = () => {
    window.print();
  };


  const isReal = !!(analysis && analysis.esgReport);
  const esgReport = isReal ? analysis.esgReport! : mockEsgReportData;

  const renderCompletenessBadge = (type: 'full' | 'partial') => {
    if (type === 'full') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-[#DCFCE7] text-[#166534] border border-[#166534]/15">
          <CheckCircle className="w-3 h-3" />
          <span>Full Data</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/15">
        <AlertTriangle className="w-3 h-3" />
        <span>Proxy (Partial)</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="ESG Sustainability Ledger"
        subtitle="Operational ESG pillar scorecards derived from process mining execution paths and supplier audit logs."
        action={
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="h-[32px] text-[12px] font-sans font-medium border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] flex items-center gap-1.5 rounded-md no-print"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </Button>
        }
      />

      <DemoDataBanner show={!isReal} />

      <div className="space-y-6 max-w-5xl mx-auto w-full">
        {/* 1. Overall Score Hero Section */}
        <div className="border border-[#E2E0D8] bg-[#FAFAF8] p-6 rounded-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-sans font-semibold text-[#2D6A4F] uppercase tracking-widest block">
              Synthesis Rating
            </span>
            <h3 className="text-[20px] font-sans font-bold text-[#1A1917]">
              Overall ESG Performance Index
            </h3>
            <p className="text-[12px] text-[#6B6963] max-w-md leading-relaxed">
              Synthesized score representing environmental carbon fitness and compliance audit benchmarks. 
              <span className="italic block mt-1 text-[#9B9891]">
                *Note: This overall score excludes the Social pillar, as it currently lacks direct quantitative source metrics.
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-[#E8F0EB] border border-[#2D6A4F]/15 rounded-md p-5 min-w-[180px] shadow-sm shrink-0 select-all">
            <span className="text-[10px] font-sans font-medium text-[#2D6A4F] uppercase tracking-wider">Composite Score</span>
            <span className="text-[44px] font-mono font-bold text-[#2D6A4F] leading-none mt-1">
              {esgReport.overallScore.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[#2D6A4F]/70 font-sans mt-1">Weighted Index Rating</span>
          </div>
        </div>

        {/* 2. Three Pillar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* E - ENVIRONMENTAL */}
          <div className="border border-[#E2E0D8] bg-[#FAFAF8] rounded-md p-5 shadow-sm flex flex-col justify-between space-y-6 border-t-4 border-t-[#2D6A4F]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans font-bold text-[#2D6A4F] uppercase tracking-wider block">Pillar E</span>
                  <h4 className="text-[15px] font-sans font-bold text-[#1A1917] flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Environmental</span>
                  </h4>
                </div>
                {renderCompletenessBadge(esgReport.environmental.dataCompleteness)}
              </div>

              <div className="bg-[#E8F0EB] border border-[#2D6A4F]/15 rounded p-4 text-center select-all">
                <span className="text-[10px] font-sans font-medium text-[#2D6A4F] uppercase tracking-wider block">Carbon Fitness Rating</span>
                <span className="text-[32px] font-mono font-bold text-[#2D6A4F] block mt-0.5">
                  {esgReport.environmental.score.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[#E2E0D8] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6963]">Total Emissions</span>
                  <span className="font-mono font-bold text-[#1A1917]">{esgReport.environmental.totalCarbonKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6963]">Budget Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold select-none ${
                    esgReport.environmental.carbonBudgetStatus === 'EXCEEDED' ? 'bg-[#FDECEA] text-[#C0392B]' : 'bg-[#DCFCE7] text-[#166534]'
                  }`}>
                    {esgReport.environmental.carbonBudgetStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[#E2E0D8] pt-3">
                <span className="text-[10px] font-sans font-bold text-[#6B6963] uppercase tracking-wider block">Top Hotspots</span>
                <ul className="space-y-1.5">
                  {esgReport.environmental.topHotspots.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-baseline gap-2">
                      <span className="font-medium text-[#1A1917] truncate max-w-[140px]">{item.activity}</span>
                      <span className="font-mono text-[#6B6963] text-[11px] shrink-0">{item.totalCarbon.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <p className="text-[11px] text-[#9B9891] leading-relaxed italic pt-2">
              Emissions and fitness scores computed directly from logged shipping events.
            </p>
          </div>

          {/* S - SOCIAL */}
          <div className="border border-[#E2E0D8] bg-[#FAFAF8] rounded-md p-5 shadow-sm flex flex-col justify-between space-y-6 border-t-4 border-t-[#B45309]/50">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans font-bold text-[#B45309] uppercase tracking-wider block">Pillar S</span>
                  <h4 className="text-[15px] font-sans font-bold text-[#1A1917] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#B45309]" />
                    <span>Social</span>
                  </h4>
                </div>
                {renderCompletenessBadge(esgReport.social.dataCompleteness)}
              </div>

              <div className="bg-[#F3F2EE] border border-[#E2E0D8] rounded p-4 text-center select-all">
                <span className="text-[10px] font-sans font-medium text-[#6B6963] uppercase tracking-wider block">Labor & Community</span>
                <span className="text-[20px] font-sans font-bold text-[#6B6963] block mt-2">
                  Not Scored
                </span>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[#E2E0D8] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6963]">Active Suppliers</span>
                  <span className="font-mono font-bold text-[#1A1917]">{esgReport.social.supplierCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6963]">At-Risk Suppliers</span>
                  <span className="font-mono font-bold text-[#C0392B]">{esgReport.social.atRiskSupplierCount}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#B45309] leading-relaxed italic bg-[#FEF3C7]/40 border border-[#FEF3C7] p-2.5 rounded text-left">
              {esgReport.social.note}
            </p>
          </div>

          {/* G - GOVERNANCE */}
          <div className="border border-[#E2E0D8] bg-[#FAFAF8] rounded-md p-5 shadow-sm flex flex-col justify-between space-y-6 border-t-4 border-t-[#4A5D6E]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans font-bold text-[#4A5D6E] uppercase tracking-wider block">Pillar G</span>
                  <h4 className="text-[15px] font-sans font-bold text-[#1A1917] flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#4A5D6E]" />
                    <span>Governance</span>
                  </h4>
                </div>
                {renderCompletenessBadge(esgReport.governance.dataCompleteness)}
              </div>

              <div className="bg-[#4A5D6E]/10 border border-[#4A5D6E]/20 rounded p-4 text-center select-all">
                <span className="text-[10px] font-sans font-medium text-[#4A5D6E] uppercase tracking-wider block">Process Compliance</span>
                <span className="text-[32px] font-mono font-bold text-[#4A5D6E] block mt-0.5">
                  {esgReport.governance.score.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[#E2E0D8] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6963]">Process Gaps</span>
                  <span className="font-mono font-bold text-[#C0392B]">{esgReport.governance.violationCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B6963]">Audit Readiness</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold select-none ${
                    esgReport.governance.auditReadiness === 'Audit Ready' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#B45309]'
                  }`}>
                    {esgReport.governance.auditReadiness}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#6B6963] leading-relaxed italic bg-[#F3F2EE] border border-[#E2E0D8] p-2.5 rounded text-left">
              {esgReport.governance.note}
              {isReal && esgReport.governance.violationCount === 0 && (
                <span className="block mt-1.5 font-sans not-italic text-[#6B6963]">
                  <strong>Note on rule scope:</strong> Conformance checking was conducted against limited rules targeting:{" "}
                  <span className="font-semibold text-[#2D6A4F]">
                    {analysis?.conformanceRuleScope
                      ? analysis.conformanceRuleScope.flatMap((r) => r.disallowed_activities).join(", ")
                      : "Air Freight Dispatch, Truck Delivery Transport Dispatch, Incineration Disposal, Landfill Disposal"}
                  </span>.
                </span>
              )}
            </p>
          </div>

        </div>

        <SectionDivider />

        {/* Detailed Metrics explanation */}
        <div className="bg-[#FAFAF8] border border-[#E2E0D8] rounded-md p-5 space-y-3.5">
          <h4 className="text-[12px] font-sans font-bold text-[#1A1917] uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#2D6A4F]" />
            <span>Proxy-Based Operational ESG Audit Methodology</span>
          </h4>
          <p className="text-[12px] text-[#6B6963] leading-relaxed">
            Because transactional logs contain event metadata rather than policy documents, TRACE leverages 
            <strong> proxy compliance modeling</strong>. The Environmental pillar scores represent exact carbon fitness 
            metrics. The Governance pillar scores are calculated using the ratio of process traces complying with 
            regulatory path directives. The Social pillar ranks active supply chain partners by environmental policy deviations 
            to isolate supply chain compliance risks.
          </p>
        </div>
      </div>
    </div>
  );
}
