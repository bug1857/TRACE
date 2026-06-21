'use client';

import React from 'react';
import { Download } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { useAnalysis } from '@/lib/AnalysisContext';
import { BrsrReport } from '@/lib/types';
import SectionDivider from '@/components/shared/SectionDivider';

const mockBrsrReportData: BrsrReport = {
  header: {
    orgName: "Louis India Pvt. Ltd.",
    workspaceContext: "Workspace Q3",
    projectContext: "Decarbonization Project",
    reportingPeriod: "Q3 Fiscal 2024",
    reportVersion: "Version 1",
    auditReadiness: "Needs Review",
    reportHash: "a57e58e39f20109c00e9f67b3b2f7286aed982c"
  },
  executiveSummary: "This mock BRSR Compliance Report aggregates 89 case-level traces. The compliance check yields a fitness score of 60.0% with 5 active violations and 2 bottleneck activity nodes, where the worst delay is at 'Road Transport Dispatch'. Carbon attribution models tracked a total actual emission of 55800.0 kg CO2e (WITHIN_LIMIT), identifying 2 carbon hotspots with the largest hotspot at 'Road Transport Dispatch'. ESG overall scoring achieved 75.0%, monitoring 12 suppliers. Based on the collected evidence, this disclosure is classified as 'Needs Review'.",
  kpiStrip: {
    processComplianceScore: 60.0,
    carbonFitnessScore: 90.0,
    esgOverallScore: 75.0,
    totalActualEmissions: 55800.0
  },
  sectionA: {
    orgName: "Louis India Pvt. Ltd.",
    workspaceContext: "Workspace Q3",
    projectContext: "Decarbonization Project",
    reportingPeriod: "Q3 Fiscal 2024",
    reportVersion: "Version 1",
    auditReadiness: "Needs Review"
  },
  sectionB: {
    conformanceMethodology: "rule_based_pattern_matching",
    totalEvaluatedTraces: 89,
    nonConformingTraces: 35,
    bottlenecks: [
      {
        activity: "Road Transport Dispatch",
        avgWaitHours: 25.0,
        occurrences: 57,
        status: "critical"
      },
      {
        activity: "Warehouse Pick & Pack",
        avgWaitHours: 5.0,
        occurrences: 89,
        status: "optimized"
      }
    ]
  },
  sectionC: {
    resourceDraw: {
      energyKwh: null,
      waterLiters: null,
      wasteKg: null,
      carbonBudgetLimitKg: 100000.0,
      carbonBudgetStatus: "WITHIN_LIMIT"
    },
    carbonHotspots: [
      {
        activity: "Road Transport Dispatch",
        category: "road_transport",
        estimated: false,
        frequency: 57,
        totalCarbon: 42000.0,
        contributionPercent: 75.3
      },
      {
        activity: "Warehouse Pick & Pack",
        category: "warehouse",
        estimated: false,
        frequency: 89,
        totalCarbon: 13800.0,
        contributionPercent: 24.7
      }
    ]
  },
  sectionD_traceabilityMatrix: [
    {
      metric: "Carbon Fitness Score",
      engine: "Carbon Fitness Engine",
      sourceTable: "carbon_fitness.py",
      referenceField: "cfsScore"
    },
    {
      metric: "Total Emissions",
      engine: "Carbon Budget Engine",
      sourceTable: "carbon_budget.py",
      referenceField: "totalCarbonKg"
    },
    {
      metric: "Process Compliance Score",
      engine: "Conformance Engine",
      sourceTable: "conformance.py",
      referenceField: "violations"
    },
    {
      metric: "Supplier Risk Rankings",
      engine: "Carbon Fitness Engine",
      sourceTable: "carbon_fitness.py",
      referenceField: "supplierFitness"
    },
    {
      metric: "Bottleneck Wait Times",
      engine: "Process Optimization Engine",
      sourceTable: "process_optimization.py",
      referenceField: "bottlenecks"
    }
  ],
  recommendations: [
    {
      title: "Standardize compliance validation workflows",
      priority: "HIGH",
      narrative: "Process compliance score is currently at 60.0% with 5 active violations. Action is required to standardize compliance checks."
    },
    {
      title: "Optimize bottleneck at 'Road Transport Dispatch'",
      priority: "HIGH",
      narrative: "Activity 'Road Transport Dispatch' is a critical bottleneck with an average wait time of 25.0 hours.",
      estEmissionReductionKg: 250.0
    },
    {
      title: "Remediate supplier compliance risk",
      priority: "HIGH",
      narrative: "Detected 3 at-risk suppliers with active process conformance violations."
    }
  ]
};

export default function BrsrReportPage() {
  const { analysis } = useAnalysis();
  const handleExportPDF = () => {
    window.print();
  };


  const isReal = !!(analysis && analysis.brsrReport);
  const brsrReport = isReal ? analysis.brsrReport! : mockBrsrReportData;

  const getBottleneckBadge = (status: 'critical' | 'moderate' | 'optimized') => {
    const statusMap = {
      critical: { bg: 'bg-[#FDECEA]', text: 'text-[#C0392B]', border: 'border-[#C0392B]/10', label: 'Critical' },
      moderate: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#B45309]/10', label: 'Moderate' },
      optimized: { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]', border: 'border-[#166534]/10', label: 'Optimized' }
    };
    const config = statusMap[status] || statusMap.optimized;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 border text-[11px] font-mono font-medium rounded-full ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="BRSR Sustainability Disclosure"
        subtitle="SEBI-mandated Business Responsibility and Sustainability Report — National Guidelines on Responsible Business Conduct (NGRBC)."
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

      <div className="space-y-8 max-w-5xl mx-auto w-full">
        {/* 1. Header block */}
        <div className="border border-[#E2E0D8] bg-[#FAFAF8] p-5 rounded-md shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E0D8] pb-4 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-sans font-semibold text-[#2D6A4F] uppercase tracking-widest block">
                Disclosure Cover
              </span>
              <h3 className="text-[16px] font-sans font-bold text-[#1A1917]">
                BRSR General Disclosures Header
              </h3>
              <p className="text-[12px] text-[#6B6963] font-sans">
                Entity: <span className="font-semibold text-[#1A1917]">{brsrReport.header.orgName}</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:items-end gap-1 text-[12px] text-[#6B6963] font-sans">
              <div>Version: <span className="font-semibold text-[#1A1917]">{brsrReport.header.reportVersion}</span></div>
              <div className="flex items-center gap-1.5">
                Status: 
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  brsrReport.header.auditReadiness === 'Audit Ready' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#B45309]'
                }`}>
                  {brsrReport.header.auditReadiness}
                </span>
              </div>
              <div className="flex items-center gap-1">
                Hash: <span className="font-mono bg-[#F3F2EE] px-1.5 py-0.5 rounded text-[11px] text-[#1A1917]" title={brsrReport.header.reportHash}>
                  {brsrReport.header.reportHash.substring(0, 12)}...
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px] pt-1">
            <div>
              <span className="text-[10px] text-[#6B6963] uppercase tracking-wider block">Workspace</span>
              <span className="font-semibold text-[#1A1917] mt-0.5 block">{brsrReport.header.workspaceContext}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6B6963] uppercase tracking-wider block">Project</span>
              <span className="font-semibold text-[#1A1917] mt-0.5 block">{brsrReport.header.projectContext}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6B6963] uppercase tracking-wider block">Reporting Period</span>
              <span className="font-semibold text-[#1A1917] mt-0.5 block">{brsrReport.header.reportingPeriod}</span>
            </div>
          </div>
        </div>

        {/* 2. Executive summary */}
        <div className="space-y-2">
          <h4 className="text-[12px] font-sans font-bold text-[#2D6A4F] uppercase tracking-wider">
            Executive Summary
          </h4>
          <p className="text-[13.5px] text-[#1A1917] leading-relaxed font-sans bg-[#FAFAF8] border border-[#E2E0D8] p-4 rounded-md shadow-sm">
            {brsrReport.executiveSummary}
          </p>
        </div>

        {/* 3. KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-1 shadow-sm">
            <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Process Compliance</span>
            <span className="text-[20px] font-mono font-bold text-[#1A1917] block mt-1">
              {brsrReport.kpiStrip.processComplianceScore.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[#9B9891] italic block">Ratio of compliant cases</span>
          </div>

          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-1 shadow-sm">
            <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Carbon Fitness Score</span>
            <span className="text-[20px] font-mono font-bold text-[#1A1917] block mt-1">
              {brsrReport.kpiStrip.carbonFitnessScore.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[#9B9891] italic block">Average carbon efficiency rating</span>
          </div>

          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-1 shadow-sm">
            <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">ESG Overall Score</span>
            <span className="text-[20px] font-mono font-bold text-[#2D6A4F] block mt-1">
              {brsrReport.kpiStrip.esgOverallScore.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[#9B9891] italic block">Synthesis of operational metrics</span>
          </div>

          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-1 shadow-sm">
            <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Total Actual Emissions</span>
            <span className="text-[20px] font-mono font-bold text-[#1A1917] block mt-1">
              {brsrReport.kpiStrip.totalActualEmissions.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
            </span>
            <span className="text-[10px] text-[#9B9891] italic block">CO2e attributed to logistical activities</span>
          </div>
        </div>

        <SectionDivider />

        {/* 4. Section A — General Disclosures */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-bold text-[#2D6A4F] uppercase tracking-wider">
            Section A — General Disclosures
          </h3>
          <div className="w-full border border-[#E2E0D8] rounded-md overflow-hidden bg-[#FAFAF8]">
            <table className="min-w-full divide-y divide-[#E2E0D8] text-[13px]">
              <tbody className="divide-y divide-[#E2E0D8]">
                <tr className="hover:bg-[#F3F2EE]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[#6B6963] w-1/3 border-r border-[#E2E0D8]">Organization Name</td>
                  <td className="px-4 py-2 text-[#1A1917]">{brsrReport.sectionA.orgName}</td>
                </tr>
                <tr className="hover:bg-[#F3F2EE]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[#6B6963] border-r border-[#E2E0D8]">Workspace Context</td>
                  <td className="px-4 py-2 text-[#1A1917]">{brsrReport.sectionA.workspaceContext}</td>
                </tr>
                <tr className="hover:bg-[#F3F2EE]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[#6B6963] border-r border-[#E2E0D8]">Project Context</td>
                  <td className="px-4 py-2 text-[#1A1917]">{brsrReport.sectionA.projectContext}</td>
                </tr>
                <tr className="hover:bg-[#F3F2EE]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[#6B6963] border-r border-[#E2E0D8]">Reporting Period</td>
                  <td className="px-4 py-2 text-[#1A1917]">{brsrReport.sectionA.reportingPeriod}</td>
                </tr>
                <tr className="hover:bg-[#F3F2EE]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[#6B6963] border-r border-[#E2E0D8]">Report Version</td>
                  <td className="px-4 py-2 text-[#1A1917]">{brsrReport.sectionA.reportVersion}</td>
                </tr>
                <tr className="hover:bg-[#F3F2EE]/50 h-[38px]">
                  <td className="px-4 py-2 font-medium text-[#6B6963] border-r border-[#E2E0D8]">Audit Readiness Classification</td>
                  <td className="px-4 py-2 text-[#1A1917] font-semibold">{brsrReport.sectionA.auditReadiness}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <SectionDivider />

        {/* 5. Section B — Process & Management Disclosures */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-bold text-[#2D6A4F] uppercase tracking-wider">
            Section B — Process & Management Disclosures
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-[#E2E0D8] p-4 bg-[#FAFAF8] rounded-md shadow-sm">
            <div>
              <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Total Evaluated Traces</span>
              <span className="text-[18px] font-mono font-bold text-[#1A1917] mt-1 block">{brsrReport.sectionB.totalEvaluatedTraces}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Non-Conforming Traces</span>
              <span className="text-[18px] font-mono font-bold text-[#C0392B] mt-1 block">{brsrReport.sectionB.nonConformingTraces}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Conformance Methodology</span>
              <span className="text-[13px] font-sans text-[#1A1917] mt-1 block capitalize font-semibold">{brsrReport.sectionB.conformanceMethodology.replace(/_/g, ' ')}</span>
            </div>
          </div>
          {isReal && brsrReport.sectionB.nonConformingTraces === 0 && (
            <div className="p-3 border border-[#E2E0D8] bg-[#FAFAF8] text-[#6B6963] rounded-md text-[11px] font-sans">
              <span className="font-semibold text-[#1A1917]">Note on rule scope:</span> Conformance checking was conducted against limited rules targeting:{" "}
              <span className="font-semibold text-[#2D6A4F]">
                {analysis?.conformanceRuleScope
                  ? analysis.conformanceRuleScope.flatMap((r) => r.disallowed_activities).join(", ")
                  : "Air Freight Dispatch, Truck Delivery Transport Dispatch, Incineration Disposal, Landfill Disposal"}
              </span>.
            </div>
          )}

          <div className="w-full border border-[#E2E0D8] rounded-md overflow-hidden bg-[#FAFAF8]">
            <table className="min-w-full divide-y divide-[#E2E0D8] text-[13px]">
              <thead className="bg-[#F3F2EE] border-b-2 border-[#E2E0D8]">
                <tr className="h-[38px] text-[10px] font-sans font-medium text-[#9B9891] uppercase tracking-wider">
                  <th className="px-4 py-2 text-left border-r border-[#E2E0D8]">Activity</th>
                  <th className="px-4 py-2 text-right border-r border-[#E2E0D8]">Average Wait Time</th>
                  <th className="px-4 py-2 text-right border-r border-[#E2E0D8]">Occurrences</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E0D8]">
                {brsrReport.sectionB.bottlenecks.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F2EE]/50 h-[38px]">
                    <td className="px-4 py-2 font-medium text-[#1A1917] border-r border-[#E2E0D8]">{item.activity}</td>
                    <td className="px-4 py-2 text-right font-mono border-r border-[#E2E0D8]">{item.avgWaitHours.toFixed(1)} h</td>
                    <td className="px-4 py-2 text-right font-mono border-r border-[#E2E0D8]">{item.occurrences}</td>
                    <td className="px-4 py-2 text-center">{getBottleneckBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SectionDivider />

        {/* 6. Section C — Principle-wise Performance */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-bold text-[#2D6A4F] uppercase tracking-wider">
            Section C — Principle-wise Performance (Principle 6 - Environment)
          </h3>

          <div className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-4 shadow-sm">
            <h4 className="text-[11.5px] font-sans font-bold text-[#1A1917] uppercase tracking-wider border-b border-[#E2E0D8] pb-1.5">Resource Consumption & Budget</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Energy Draw</span>
                <span className="text-[16px] font-mono font-bold text-[#1A1917] mt-1 block">{brsrReport.sectionC.resourceDraw.energyKwh ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Water Draw</span>
                <span className="text-[16px] font-mono font-bold text-[#1A1917] mt-1 block">{brsrReport.sectionC.resourceDraw.waterLiters ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Waste Generated</span>
                <span className="text-[16px] font-mono font-bold text-[#1A1917] mt-1 block">{brsrReport.sectionC.resourceDraw.wasteKg ?? '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Carbon Budget Limit</span>
                <span className="text-[16px] font-mono font-bold text-[#1A1917] mt-1 block">{brsrReport.sectionC.resourceDraw.carbonBudgetLimitKg.toLocaleString()} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6963] font-sans uppercase tracking-wider block">Budget Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold mt-1 select-none ${
                  brsrReport.sectionC.resourceDraw.carbonBudgetStatus === 'EXCEEDED' ? 'bg-[#FDECEA] text-[#C0392B]' : 'bg-[#DCFCE7] text-[#166534]'
                }`}>
                  {brsrReport.sectionC.resourceDraw.carbonBudgetStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11.5px] font-sans font-bold text-[#6B6963] uppercase tracking-wider block">Carbon Hotspots Breakdown</span>
            <div className="w-full border border-[#E2E0D8] rounded-md overflow-hidden bg-[#FAFAF8]">
              <table className="min-w-full divide-y divide-[#E2E0D8] text-[13px]">
                <thead className="bg-[#F3F2EE] border-b-2 border-[#E2E0D8]">
                  <tr className="h-[38px] text-[10px] font-sans font-medium text-[#9B9891] uppercase tracking-wider">
                    <th className="px-4 py-2 text-left border-r border-[#E2E0D8]">Activity</th>
                    <th className="px-4 py-2 text-left border-r border-[#E2E0D8]">Category</th>
                    <th className="px-4 py-2 text-right border-r border-[#E2E0D8]">Emissions (kg CO2e)</th>
                    <th className="px-4 py-2 text-right">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E0D8]">
                  {brsrReport.sectionC.carbonHotspots.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F3F2EE]/50 h-[38px]">
                      <td className="px-4 py-2 font-medium text-[#1A1917] border-r border-[#E2E0D8]">{item.activity}</td>
                      <td className="px-4 py-2 text-[#6B6963] font-mono text-[11px] border-r border-[#E2E0D8]">{item.category}</td>
                      <td className="px-4 py-2 text-right font-mono border-r border-[#E2E0D8]">{item.totalCarbon.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-[#2D6A4F]">{item.contributionPercent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <SectionDivider />

        {/* 7. Section D — Traceability Matrix */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-bold text-[#2D6A4F] uppercase tracking-wider">
            Section D — Traceability Matrix
          </h3>
          <div className="w-full border border-[#E2E0D8] rounded-md overflow-hidden bg-[#FAFAF8]">
            <table className="min-w-full divide-y divide-[#E2E0D8] text-[13px]">
              <thead className="bg-[#F3F2EE] border-b-2 border-[#E2E0D8]">
                <tr className="h-[38px] text-[10px] font-sans font-medium text-[#9B9891] uppercase tracking-wider">
                  <th className="px-4 py-2 text-left border-r border-[#E2E0D8]">Metric</th>
                  <th className="px-4 py-2 text-left border-r border-[#E2E0D8]">Analysis Engine</th>
                  <th className="px-4 py-2 text-left border-r border-[#E2E0D8]">Source Module</th>
                  <th className="px-4 py-2 text-left">Reference Field</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E0D8]">
                {brsrReport.sectionD_traceabilityMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F2EE]/50 h-[38px]">
                    <td className="px-4 py-2 font-medium text-[#1A1917] border-r border-[#E2E0D8]">{item.metric}</td>
                    <td className="px-4 py-2 text-[#1A1917] border-r border-[#E2E0D8]">{item.engine}</td>
                    <td className="px-4 py-2 text-[#6B6963] font-mono text-[11px] border-r border-[#E2E0D8]">{item.sourceTable}</td>
                    <td className="px-4 py-2 text-[#6B6963] font-mono text-[11px]">{item.referenceField}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SectionDivider />

        {/* 8. Recommendations */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-sans font-bold text-[#2D6A4F] uppercase tracking-wider">
            Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brsrReport.recommendations.map((rec, idx) => {
              const priorityColors = {
                LOW: { bg: 'bg-[#F3F2EE]', text: 'text-[#6B6963]', border: 'border-[#E2E0D8]' },
                MEDIUM: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#FEF3C7]' },
                HIGH: { bg: 'bg-[#FFE6C7]', text: 'text-[#D97706]', border: 'border-[#FFE6C7]' },
                CRITICAL: { bg: 'bg-[#FDECEA]', text: 'text-[#C0392B]', border: 'border-[#FDECEA]' }
              };
              const pColor = priorityColors[rec.priority] || priorityColors.LOW;
              return (
                <div key={idx} className="border border-[#E2E0D8] rounded-md p-4 bg-[#FAFAF8] space-y-2 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-[13px] font-sans font-bold text-[#1A1917]">{rec.title}</h5>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${pColor.bg} ${pColor.text} border ${pColor.border}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6B6963] font-sans leading-relaxed">{rec.narrative}</p>
                  </div>
                  {rec.estEmissionReductionKg !== undefined && (
                    <div className="pt-2 border-t border-[#E2E0D8]/50 flex items-center justify-between text-[11px] mt-2">
                      <span className="text-[#9B9891] font-sans">Est. Emission Reduction:</span>
                      <span className="font-mono font-bold text-[#2D6A4F]">{rec.estEmissionReductionKg} kg CO2e</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
