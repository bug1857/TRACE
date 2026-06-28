'use client';

import React from 'react';
import { Download, CheckCircle, Shield, AlertTriangle, Users, Compass, Globe } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { useAnalysis } from '@/lib/AnalysisContext';
import { EsgReport } from '@/lib/types';
import SectionDivider from '@/components/shared/SectionDivider';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { StaggeredList, StaggeredItem } from '@/components/StaggeredList';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { GlowCard } from '@/components/GlowCard';

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


  const hasAnalysis = !!analysis;
  const isReal = !!(analysis && analysis.esgReport);

  if (!hasAnalysis) {
    return <DashboardSkeleton />;
  }

  const esgReport = isReal ? analysis.esgReport! : mockEsgReportData;

  const renderCompletenessBadge = (type: 'full' | 'partial') => {
    if (type === 'full') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-[var(--trace-success-light)] text-[var(--trace-success)] border border-[var(--trace-success)]/15">
          <CheckCircle className="w-3 h-3" />
          <span>Full Data</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-[var(--trace-warning-light)] text-[var(--trace-warning)] border border-[var(--trace-warning)]/15">
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
            className="h-[32px] text-[12px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1.5 rounded-md no-print"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </Button>
        }
      />

      <DemoDataBanner show={!isReal} />

      <div className="space-y-6 max-w-5xl mx-auto w-full">
        {/* 1. Overall Score Hero Section */}
        <GlowCard className="border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-sans font-semibold text-[var(--primary)] uppercase tracking-widest block">
              Synthesis Rating
            </span>
            <h3 className="text-[20px] font-sans font-bold text-[var(--foreground)]">
              Overall ESG Performance Index
            </h3>
            <p className="text-[12px] text-[var(--muted-foreground)] max-w-md leading-relaxed">
              Synthesized score representing environmental carbon fitness and compliance audit benchmarks. 
              <span className="italic block mt-1 text-[var(--trace-subtle)]">
                *Note: This overall score excludes the Social pillar, as it currently lacks direct quantitative source metrics.
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-[var(--accent)] border border-[var(--primary)]/15 rounded-md p-5 min-w-[180px] shadow-sm shrink-0 select-all">
            <span className="text-[10px] font-sans font-medium text-[var(--primary)] uppercase tracking-wider">Composite Score</span>
            <span className="text-[44px] font-mono font-bold text-[var(--primary)] leading-none mt-1">
              <AnimatedNumber value={esgReport.overallScore} decimals={1} suffix="%" />
            </span>
            <span className="text-[10px] text-[var(--primary)]/70 font-sans mt-1">Weighted Index Rating</span>
          </div>
        </GlowCard>

        {/* 2. Three Pillar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* E - ENVIRONMENTAL */}
          <GlowCard className="border border-[var(--border)] bg-[var(--background)] rounded-md p-5 shadow-sm flex flex-col justify-between space-y-6 border-t-4 border-t-[var(--primary)]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans font-bold text-[var(--primary)] uppercase tracking-wider block">Pillar E</span>
                  <h4 className="text-[15px] font-sans font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[var(--primary)]" />
                    <span>Environmental</span>
                  </h4>
                </div>
                {renderCompletenessBadge(esgReport.environmental.dataCompleteness)}
              </div>

              <div className="bg-[var(--accent)] border border-[var(--primary)]/15 rounded p-4 text-center select-all">
                <span className="text-[10px] font-sans font-medium text-[var(--primary)] uppercase tracking-wider block">Carbon Fitness Rating</span>
                <span className="text-[32px] font-mono font-bold text-[var(--primary)] block mt-0.5">
                  <AnimatedNumber value={esgReport.environmental.score} decimals={1} suffix="%" />
                </span>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[var(--border)] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Total Emissions</span>
                  <span className="font-mono font-bold text-[var(--foreground)]">{esgReport.environmental.totalCarbonKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Budget Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold select-none ${
                    esgReport.environmental.carbonBudgetStatus === 'EXCEEDED' ? 'bg-[var(--trace-danger-light)] text-[var(--destructive)]' : 'bg-[var(--trace-success-light)] text-[var(--trace-success)]'
                  }`}>
                    {esgReport.environmental.carbonBudgetStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[var(--border)] pt-3">
                <span className="text-[10px] font-sans font-bold text-[var(--muted-foreground)] uppercase tracking-wider block">Top Hotspots</span>
                <StaggeredList className="space-y-1.5">
                  {esgReport.environmental.topHotspots.map((item, idx) => (
                    <StaggeredItem key={idx} className="flex justify-between items-baseline gap-2">
                      <span className="font-medium text-[var(--foreground)] truncate max-w-[140px]">{item.activity}</span>
                      <span className="font-mono text-[var(--muted-foreground)] text-[11px] shrink-0">{item.totalCarbon.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</span>
                    </StaggeredItem>
                  ))}
                </StaggeredList>
              </div>
            </div>
            
            <p className="text-[11px] text-[var(--trace-subtle)] leading-relaxed italic pt-2">
              Emissions and fitness scores computed directly from logged shipping events.
            </p>
          </GlowCard>

          {/* S - SOCIAL */}
          <GlowCard className="border border-[var(--border)] bg-[var(--background)] rounded-md p-5 shadow-sm flex flex-col justify-between space-y-6 border-t-4 border-t-[var(--trace-warning)]/50">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans font-bold text-[var(--trace-warning)] uppercase tracking-wider block">Pillar S</span>
                  <h4 className="text-[15px] font-sans font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[var(--trace-warning)]" />
                    <span>Social</span>
                  </h4>
                </div>
                {renderCompletenessBadge(esgReport.social.dataCompleteness)}
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded p-4 text-center select-all">
                <span className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">Labor & Community</span>
                <span className="text-[20px] font-sans font-bold text-[var(--muted-foreground)] block mt-2">
                  Not Scored
                </span>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[var(--border)] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Active Suppliers</span>
                  <span className="font-mono font-bold text-[var(--foreground)]">{esgReport.social.supplierCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">At-Risk Suppliers</span>
                  <span className="font-mono font-bold text-[var(--destructive)]">{esgReport.social.atRiskSupplierCount}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[var(--trace-warning)] leading-relaxed italic bg-[var(--trace-warning-light)]/40 border border-[var(--trace-warning-light)] p-2.5 rounded text-left">
              {esgReport.social.note}
            </p>
          </GlowCard>

          {/* G - GOVERNANCE */}
          <GlowCard className="border border-[var(--border)] bg-[var(--background)] rounded-md p-5 shadow-sm flex flex-col justify-between space-y-6 border-t-4 border-t-[#4A5D6E]">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans font-bold text-[#4A5D6E] uppercase tracking-wider block">Pillar G</span>
                  <h4 className="text-[15px] font-sans font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#4A5D6E]" />
                    <span>Governance</span>
                  </h4>
                </div>
                {renderCompletenessBadge(esgReport.governance.dataCompleteness)}
              </div>

              <div className="bg-[#4A5D6E]/10 border border-[#4A5D6E]/20 rounded p-4 text-center select-all">
                <span className="text-[10px] font-sans font-medium text-[#4A5D6E] uppercase tracking-wider block">Process Compliance</span>
                <span className="text-[32px] font-mono font-bold text-[#4A5D6E] block mt-0.5">
                  <AnimatedNumber value={esgReport.governance.score} decimals={1} suffix="%" />
                </span>
              </div>

              <div className="space-y-2 text-[12px] border-t border-[var(--border)] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Process Gaps</span>
                  <span className="font-mono font-bold text-[var(--destructive)]">{esgReport.governance.violationCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted-foreground)]">Audit Readiness</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold select-none ${
                    esgReport.governance.auditReadiness === 'Audit Ready' ? 'bg-[var(--trace-success-light)] text-[var(--trace-success)]' : 'bg-[var(--trace-warning-light)] text-[var(--trace-warning)]'
                  }`}>
                    {esgReport.governance.auditReadiness}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed italic bg-[var(--card)] border border-[var(--border)] p-2.5 rounded text-left">
              {esgReport.governance.note}
              {isReal && esgReport.governance.violationCount === 0 && (
                <span className="block mt-1.5 font-sans not-italic text-[var(--muted-foreground)]">
                  <strong>Note on rule scope:</strong> Conformance checking was conducted against limited rules targeting:{" "}
                  <span className="font-semibold text-[var(--primary)]">
                    {analysis?.conformanceRuleScope
                      ? analysis.conformanceRuleScope.flatMap((r) => r.disallowed_activities).join(", ")
                      : "Air Freight Dispatch, Truck Delivery Transport Dispatch, Incineration Disposal, Landfill Disposal"}
                  </span>.
                </span>
              )}
            </p>
          </GlowCard>

        </div>

        <SectionDivider />

        {/* Detailed Metrics explanation */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-5 space-y-3.5">
          <h4 className="text-[12px] font-sans font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[var(--primary)]" />
            <span>Proxy-Based Operational ESG Audit Methodology</span>
          </h4>
          <p className="text-[12px] text-[var(--muted-foreground)] leading-relaxed">
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
