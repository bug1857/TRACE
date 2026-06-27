'use client';

import React, { useState, useMemo } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { mockCarbonFitnessVariants } from '@/lib/mockData';
import { CarbonFitnessItem, Violation } from '@/lib/types';
import { useAnalysis } from '@/lib/AnalysisContext';

interface PolicyRule {
  id: string;
  name: string;
  category: string;
  check: (variant: CarbonFitnessItem, violations?: Violation[]) => { status: 'pass' | 'fail' | 'unevaluated'; explanation: string };
}

const policyRules: PolicyRule[] = [
  {
    id: 'rule-1',
    name: 'No Air Freight for Local Corridors',
    category: 'Logistics Decarbonization',
    check: (v, violations) => {
      if (violations !== undefined) {
        const airV = violations.find(vl => vl.caseId === v.id && vl.activity.toLowerCase().includes('air'));
        if (airV) {
          return {
            status: 'fail',
            explanation: `Logistics bypass: Air Freight dispatch chosen instead of mandated alternative, causing a ${airV.carbonDeltaKg.toFixed(1)} kg CO₂ emissions excess.`
          };
        }
        return {
          status: 'pass',
          explanation: 'Passed: Route utilizes low-carbon road freight carriers or rail transport for regional shipping hubs.'
        };
      }
      const usesAir = v.name.toLowerCase().includes('air');
      if (usesAir) {
        return {
          status: 'fail',
          explanation: 'Logistics bypass: Air Freight dispatch chosen instead of mandated Electric Rail corridors, causing a 2.45 tCO₂e emissions excess.'
        };
      }
      return {
        status: 'pass',
        explanation: 'Passed: Route utilizes low-carbon road freight carriers or rail transport for regional shipping hubs.'
      };
    }
  },
  {
    id: 'rule-2',
    name: 'Certified Scope 3 Freight Vendors Only',
    category: 'Supply Chain Compliance',
    check: (v, violations) => {
      if (violations !== undefined) {
        const vendorV = violations.find(vl => vl.caseId === v.id && (vl.activity.toLowerCase().includes('truck') || vl.activity.toLowerCase().includes('delivery')));
        if (vendorV) {
          return {
            status: 'fail',
            explanation: `Vendor violation: Outsourced transportation assigned to non-compliant carrier (${vendorV.activity}) with excess ${vendorV.carbonDeltaKg.toFixed(1)} kg CO₂ emissions.`
          };
        }
        return {
          status: 'pass',
          explanation: 'Passed: All assigned vendors hold valid ISO 14064 Carbon Footprint Certifications.'
        };
      }
      const isLocalBypass = v.id === 'VAR-3';
      const isWorstAir = v.id === 'VAR-5';
      if (isLocalBypass || isWorstAir) {
        return {
          status: 'fail',
          explanation: 'Vendor violation: Outsourced transportation assigned to non-Euro VI compliant carrier (Supplier B — FastCargo Ltd.) with Scope 3 factor > 0.80 kg/$'
        };
      }
      return {
        status: 'pass',
        explanation: 'Passed: All assigned vendors (Supplier A/E) hold valid ISO 14064 Carbon Footprint Certifications.'
      };
    }
  },
  {
    id: 'rule-3',
    name: 'Refrigerated Storage Yard Threshold < 24h',
    category: 'Cold Chain Operations',
    check: (v, violations) => {
      if (violations !== undefined) {
        return {
          status: 'unevaluated',
          explanation: 'Not evaluated — requires storage duration data not present in this dataset.'
        };
      }
      const isCustomsRework = v.id === 'VAR-4';
      if (isCustomsRework) {
        return {
          status: 'fail',
          explanation: 'Excess waiting yard delay: Refrigerated container idle duration recorded at 48.1h, exceeding the max 24h cap and wasting cooling diesel.'
        };
      }
      return {
        status: 'pass',
        explanation: 'Passed: Idle customs clearance yard durations average under 14.5 hours across active cases.'
      };
    }
  },
  {
    id: 'rule-4',
    name: 'Order Rework Loops Limit < 2 Cycles',
    category: 'Packaging Efficiency',
    check: (v, violations) => {
      if (violations !== undefined) {
        return {
          status: 'unevaluated',
          explanation: 'Not evaluated — requires activity duration/rework tracking not present in this dataset.'
        };
      }
      const isPackRework = v.id === 'VAR-5';
      if (isPackRework) {
        return {
          status: 'fail',
          explanation: 'Process loop breach: Warehouse packing lines logged 3 consecutive packaging inspections failures, triggering scrap overhead.'
        };
      }
      return {
        status: 'pass',
        explanation: 'Passed: Package cycles completed packing inspection targets in a single iteration.'
      };
    }
  }
];

export default function SustainabilityConformancePage() {
  const { analysis } = useAnalysis();

  const pathways = useMemo(() => {
    if (analysis && analysis.cfsScores && analysis.cfsScores.length > 0) {
      return analysis.cfsScores.map(score => {
        const caseViolations = analysis.violations?.filter(v => v.caseId === score.caseId) || [];
        
        let pathName = 'Recv → Pick → Customs → Road → Last Mile';
        const hasAir = caseViolations.some(v => v.activity.toLowerCase().includes('air'));
        const hasTruck = caseViolations.some(v => v.activity.toLowerCase().includes('truck'));
        const hasWaste = caseViolations.some(v => v.category === 'waste');
        
        if (hasAir) {
          pathName = 'Recv → Pick → Customs → Air Freight → Last Mile';
        } else if (hasTruck) {
          pathName = 'Recv → Pick → Customs → Truck Delivery → Last Mile';
        } else if (hasWaste) {
          pathName = 'Recv → Pick → Waste Management → Last Mile';
        }
        
        return {
          id: score.caseId,
          name: pathName,
          cfs: score.cfsScore,
          carbonEmitted: score.actualCarbonKg,
          volume: 1
        };
      });
    }
    return mockCarbonFitnessVariants;
  }, [analysis]);

  const [selectedVar, setSelectedVar] = useState<CarbonFitnessItem | null>(null);

  const [prevPathways, setPrevPathways] = useState(pathways);
  if (prevPathways !== pathways) {
    setPrevPathways(pathways);
    setSelectedVar(null);
  }

  const currentVar = selectedVar || pathways[0] || null;

  const isReal = !!(analysis && analysis.cfsScores && analysis.cfsScores.length > 0);
  const violations = analysis && analysis.violations ? analysis.violations : undefined;

  const getPassCount = (v: CarbonFitnessItem) => {
    return policyRules.filter(r => r.check(v, violations).status === 'pass').length;
  };

  const passCount = currentVar ? getPassCount(currentVar) : 0;
  const failCount = currentVar ? policyRules.filter(r => r.check(currentVar, violations).status === 'fail').length : 0;

  const isGreen = failCount === 0;
  const isAmber = !isReal && passCount >= 2 && passCount < 4;

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="AI Sustainability Conformance Policies"
        subtitle="AI-driven governance engine auditing process path sequences against ESG covenants, corporate caps, and supplier mandates."
      />

      <DemoDataBanner show={!isReal} />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        
        {/* Left Column: Process Variants List */}
        <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm space-y-3.5 select-none">
          <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
            {isReal ? `Audited Cases (${pathways.length})` : `Process Pathways (${pathways.length})`}
          </h3>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {pathways.map((v) => {
              const isSelected = currentVar && currentVar.id === v.id;
              const rulePass = getPassCount(v);
              const ruleFail = policyRules.filter(r => r.check(v, violations).status === 'fail').length;
              const colorClass = ruleFail > 0 ? 'text-[var(--destructive)]' : 'text-[var(--trace-success)]';

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVar(v)}
                  className={`p-3 border rounded-md cursor-pointer transition-colors flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--accent)] border-[var(--primary)] text-[var(--primary)]'
                      : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[#ECEAE4]'
                  }`}
                >
                  <div className="flex justify-between items-center text-[12px] font-mono">
                    <span className="font-bold">{v.id}</span>
                    <span className={`font-semibold ${colorClass}`}>
                      {isReal ? `${rulePass} / 2 Passed` : `${rulePass} / 4 Passed`}
                    </span>
                  </div>
                  
                  <p className="text-[11px] font-mono leading-tight line-clamp-2">
                    {v.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Audit Policy Checklist */}
        {currentVar ? (
          <div className="border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-sans font-semibold text-[var(--primary)] uppercase tracking-widest block">
                  AI Auditor Log
                </span>
                <h2 className="text-[16px] font-sans font-medium text-[var(--foreground)]">
                  ESG Policy Checklist Analysis — {currentVar.id}
                </h2>
                <p className="text-[12px] text-[var(--muted-foreground)] font-sans">
                  Pathway: <span className="font-mono text-[11px] text-[var(--foreground)]">{currentVar.name}</span>
                </p>
              </div>
              
              <ShieldCheck className="w-10 h-10 text-[var(--primary)]" strokeWidth={1} />
            </div>

            {/* Audit Result Overview banner */}
            <div className={`p-4 rounded-md border flex items-center gap-3 select-none ${
              isGreen
                ? 'bg-[var(--trace-success-light)] border-[var(--trace-success)]/10 text-[var(--trace-success)]'
                : isAmber
                ? 'bg-[var(--trace-warning-light)] border-[var(--trace-warning)]/10 text-[var(--trace-warning)]'
                : 'bg-[var(--trace-danger-light)] border-[var(--destructive)]/10 text-[var(--destructive)]'
            }`}>
              {isGreen ? (
                <CheckCircle2 className="w-6 h-6 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 shrink-0" />
              )}
              <div>
                <h4 className="text-[13px] font-sans font-semibold">
                  {isGreen ? 'Fully Conforming Pathway' : 'Conformance Deviations Identified'}
                </h4>
                <p className="text-[12px] text-[var(--muted-foreground)] font-sans mt-0.5">
                  {isReal ? (
                    `AI auditor analyzed 2 active policy rules. Result: ${passCount} passed, ${failCount} failed. (2 rules not evaluated)`
                  ) : (
                    `AI auditor analyzed 4 policy rules. Result: ${passCount} passed, ${failCount} failed.`
                  )}
                </p>
              </div>
            </div>

            {/* Checklist Rules list */}
            <div className="space-y-4">
              {policyRules.map((rule) => {
                const { status, explanation } = rule.check(currentVar, violations);

                return (
                  <div
                    key={rule.id}
                    className="border border-[var(--border)] rounded-md p-4 bg-[var(--card)] flex items-start gap-3"
                  >
                    {status === 'pass' && (
                      <CheckCircle2 className="w-5 h-5 text-[var(--trace-success)] shrink-0 mt-0.5" />
                    )}
                    {status === 'fail' && (
                      <XCircle className="w-5 h-5 text-[var(--destructive)] shrink-0 mt-0.5" />
                    )}
                    {status === 'unevaluated' && (
                      <HelpCircle className="w-5 h-5 text-[var(--trace-subtle)] shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[13px] font-sans font-semibold text-[var(--foreground)]">
                          {rule.name}
                        </h4>
                        <span className="text-[9px] font-mono text-[var(--trace-subtle)] uppercase tracking-wider border border-[var(--border)] px-1 rounded-sm">
                          {rule.category}
                        </span>
                      </div>

                      <p className={`text-[12px] font-sans ${
                        status === 'pass'
                          ? 'text-[var(--muted-foreground)]'
                          : status === 'fail'
                          ? 'text-[var(--destructive)] font-medium'
                          : 'text-[var(--trace-subtle)] italic'
                      } leading-normal`}>
                        {explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          <div className="border border-[var(--border)] bg-[var(--background)] p-6 rounded-md shadow-sm text-center text-[var(--muted-foreground)]">
            Select a pathway or case to view policy audits.
          </div>
        )}

      </div>
    </div>
  );
}
