'use client';

import React, { useState, useMemo } from 'react';
import { Play, Sliders, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { mockSimulationScenarios } from '@/lib/mockData';
import { SimulationScenario } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectionDivider from '@/components/shared/SectionDivider';
import { useAnalysis } from '@/lib/AnalysisContext';

export default function SimulationPage() {
  const { analysis } = useAnalysis();
  const isReal = !!(analysis && analysis.cfsScores && analysis.cfsScores.length > 0);

  // When real analysis loads, start with an empty scenario list.
  // Only pre-populate mock scenarios when no real data exists.
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(
    isReal ? [] : mockSimulationScenarios
  );
  const [scenarioName, setScenarioName] = useState('Freight Route Optimization');
  const [airFreightRed, setAirFreightRed] = useState(40);
  const [supplierShift, setSupplierShift] = useState(30);
  const [activityRemoval, setActivityRemoval] = useState('None');
  const [isSimulating, setIsSimulating] = useState(false);

  // isReal tracks whether a real analysis is in context

  // Compute baselines dynamically
  const totalBudgetLimit = (analysis && analysis.carbonBudget && analysis.carbonBudget.length > 0)
    ? analysis.carbonBudget.reduce((sum, item) => sum + item.budget, 0)
    : 120000;

  const baselineCarbon = isReal ? analysis.totalCarbonKg : 78430;
  const baselineCfs = isReal
    ? Math.round(analysis.cfsScores.reduce((sum, item) => sum + item.cfsScore, 0) / analysis.cfsScores.length)
    : 72;
  const baselineBudget = totalBudgetLimit - baselineCarbon;
  const baselineViolations = isReal ? analysis.violations.length : 23;

  // Active comparison state - stores only simulated overrides, defaults to null (falls back to baselines)
  const [simulatedResults, setSimulatedResults] = useState<{
    afterCarbon: number;
    afterCfs: number;
    afterBudget: number;
    afterViolations: number;
  } | null>(null);

  // Reset simulated results and activity removal if baselines/analysis changes
  const [prevBaselines, setPrevBaselines] = useState({
    baselineCarbon,
    baselineCfs,
    baselineBudget,
    baselineViolations
  });

  const [prevAnalysis, setPrevAnalysis] = useState(analysis);

  if (prevBaselines.baselineCarbon !== baselineCarbon ||
      prevBaselines.baselineCfs !== baselineCfs ||
      prevBaselines.baselineBudget !== baselineBudget ||
      prevBaselines.baselineViolations !== baselineViolations ||
      prevAnalysis !== analysis) {
    setPrevBaselines({
      baselineCarbon,
      baselineCfs,
      baselineBudget,
      baselineViolations
    });
    setPrevAnalysis(analysis);
    setSimulatedResults(null);
    setActivityRemoval('None');
    // When real analysis becomes available, clear any pre-seeded mock scenarios
    if (analysis !== prevAnalysis && isReal) {
      setScenarios([]);
    }
  }

  // Derive comparison metrics dynamically for render
  const currentComparison = {
    beforeCarbon: baselineCarbon,
    afterCarbon: simulatedResults ? simulatedResults.afterCarbon : baselineCarbon,
    beforeCfs: baselineCfs,
    afterCfs: simulatedResults ? simulatedResults.afterCfs : baselineCfs,
    beforeBudget: baselineBudget,
    afterBudget: simulatedResults ? simulatedResults.afterBudget : baselineBudget,
    beforeViolations: baselineViolations,
    afterViolations: simulatedResults ? simulatedResults.afterViolations : baselineViolations,
  };

  // Compute dynamic options for Remove Activity Node
  const activityOptions = useMemo(() => {
    if (isReal && analysis && analysis.nodes) {
      return analysis.nodes
        .map(n => n.label)
        .filter((label, index, self) => label && self.indexOf(label) === index);
    }
    return ["Customs Yard Re-inspection", "Quality Inspection Loop"];
  }, [isReal, analysis]);

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    setTimeout(() => {
      // Calculate simulated outcomes based on configuration inputs
      const carbonReduction = (airFreightRed * 0.35 + supplierShift * 0.45 + (activityRemoval !== 'None' ? 8 : 0));
      const simulatedAfterCarbon = Math.round(baselineCarbon * (1 - carbonReduction / 100));
      const simulatedAfterCfs = Math.min(100, Math.round(baselineCfs + (airFreightRed * 0.15 + supplierShift * 0.18)));
      const simulatedAfterBudget = totalBudgetLimit - simulatedAfterCarbon;
      const simulatedAfterViolations = Math.max(2, Math.round(baselineViolations * (1 - (airFreightRed * 0.4 + supplierShift * 0.3) / 100)));

      const newScenario: SimulationScenario = {
        id: `sim-${Date.now()}`,
        name: scenarioName || 'Unnamed Scenario',
        airFreightReduction: airFreightRed,
        supplierVolumeShift: supplierShift,
        activityRemoval: activityRemoval,
        results: {
          beforeCarbon: baselineCarbon,
          afterCarbon: simulatedAfterCarbon,
          beforeCfs: baselineCfs,
          afterCfs: simulatedAfterCfs,
          beforeBudgetRemaining: baselineBudget,
          afterBudgetRemaining: simulatedAfterBudget,
          beforeViolations: baselineViolations,
          afterViolations: simulatedAfterViolations
        },
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setScenarios([newScenario, ...scenarios]);
      setSimulatedResults({
        afterCarbon: simulatedAfterCarbon,
        afterCfs: simulatedAfterCfs,
        afterBudget: simulatedAfterBudget,
        afterViolations: simulatedAfterViolations
      });
      
      setIsSimulating(false);
    }, 1000); // 1s simulation delay
  };

  const handleDeleteScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const savedColumns: Column<SimulationScenario>[] = [
    {
      header: 'Scenario Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => <span className="font-medium text-[var(--foreground)]">{row.name}</span>
    },
    {
      header: 'Air Red. %',
      accessorKey: 'airFreightReduction',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.airFreightReduction}%</span>
    },
    {
      header: 'Supplier Shift %',
      accessorKey: 'supplierVolumeShift',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.supplierVolumeShift}%</span>
    },
    {
      header: 'Activity Removed',
      accessorKey: 'activityRemoval',
      sortable: true
    },
    {
      header: 'Carbon Delta',
      accessorKey: 'carbonDelta',
      isNumeric: true,
      cell: (row) => {
        const delta = row.results.afterCarbon - row.results.beforeCarbon;
        const color = delta <= 0 ? 'text-[var(--trace-success)]' : 'text-[var(--destructive)]';
        const sign = delta > 0 ? '+' : '';
        return <span className={`${color} font-mono`}>{sign}{delta.toLocaleString()} kg</span>;
      }
    },
    {
      header: 'CFS Delta',
      accessorKey: 'cfsDelta',
      isNumeric: true,
      cell: (row) => {
        const delta = row.results.afterCfs - row.results.beforeCfs;
        const color = delta >= 0 ? 'text-[var(--trace-success)]' : 'text-[var(--destructive)]';
        const sign = delta > 0 ? '+' : '';
        return <span className={`${color} font-mono`}>{sign}{delta}</span>;
      }
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSimulatedResults({
                afterCarbon: row.results.afterCarbon,
                afterCfs: row.results.afterCfs,
                afterBudget: row.results.afterBudgetRemaining,
                afterViolations: row.results.afterViolations
              });
            }}
            className="h-[28px] text-[11px] font-sans border-[var(--border)] hover:bg-[var(--card)] rounded-md"
          >
            Load
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleDeleteScenario(row.id, e)}
            className="h-[28px] w-[28px] p-0 text-[var(--destructive)] hover:bg-[var(--trace-danger-light)] hover:text-[var(--destructive)] rounded-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="What-If Operational Simulator"
        subtitle="Simulate structural changes, supplier volume shifts, and check projected carbon compliance outcomes."
      />

      <DemoDataBanner show={!isReal} />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        {/* Left Column: Config Panel */}
        <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm select-none">
          <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[var(--primary)]" />
            <span>Scenario Parameters</span>
          </h3>

          <form onSubmit={handleRunSimulation} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                Scenario Name
              </label>
              <Input
                placeholder="e.g. Electric Last Mile Shift"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="h-[34px] text-[13px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:border-[var(--primary)]"
              />
            </div>

            {/* Slider 1: Air Freight Reduction */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-[11px] font-sans">
                <label className="font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Air Freight Reduction</label>
                <span className="font-mono text-[var(--foreground)] font-semibold">{airFreightRed}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={airFreightRed}
                onChange={(e) => setAirFreightRed(parseInt(e.target.value))}
                className="w-full accent-[var(--primary)] h-1 bg-[var(--border)] rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Supplier Shift */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-[11px] font-sans">
                <label className="font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Supplier Volume Shift</label>
                <span className="font-mono text-[var(--foreground)] font-semibold">{supplierShift}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={supplierShift}
                onChange={(e) => setSupplierShift(parseInt(e.target.value))}
                className="w-full accent-[var(--primary)] h-1 bg-[var(--border)] rounded-lg cursor-pointer"
              />
            </div>

            {/* Dropdown 3: Activity Removal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider block">
                Remove Activity Node
              </label>
              <Select value={activityRemoval} onValueChange={(val) => setActivityRemoval(val || 'None')}>
                <SelectTrigger className="h-[32px] text-[12px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-md focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--background)] border-[var(--border)] rounded-md">
                  <SelectItem value="None" className="text-[12px]">None</SelectItem>
                  {activityOptions.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-[12px]">{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isSimulating}
              className="w-full h-[36px] bg-[var(--primary)] hover:bg-[var(--trace-success)] disabled:bg-[var(--primary)]/60 text-white font-sans text-[13px] font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors pt-1"
            >
              <Play className="w-4 h-4" />
              <span>{isSimulating ? 'Running Model...' : 'Run Simulation'}</span>
            </Button>
            <p className="text-[10px] text-[var(--trace-subtle)] font-sans text-center mt-1">
              ⚠ Simulation uses statistical approximations, not a process execution model.
            </p>
          </form>
        </div>

        {/* Right Column: Results Grid */}
        <div className="border border-[var(--border)] bg-[var(--background)] p-5 rounded-md shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
            <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
              Operational Impact Analysis
            </h3>
            <span className="text-[10px] text-[var(--trace-subtle)] font-sans italic">
              Projections use estimated efficiency coefficients, not measured outcomes — actual results may vary.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Carbon Emissions Card */}
            <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--card)] space-y-2 select-all">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold block">Total Carbon Footprint (kg)</span>
              <div className="grid grid-cols-3 gap-2 items-baseline text-center">
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Before</span>
                  <span className="font-mono text-[14px] font-medium text-[var(--foreground)]">{currentComparison.beforeCarbon.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">After</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">{currentComparison.afterCarbon.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Delta</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">
                    {currentComparison.afterCarbon - currentComparison.beforeCarbon > 0 ? '+' : ''}
                    {(currentComparison.afterCarbon - currentComparison.beforeCarbon).toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>

            {/* CFS Score Card */}
            <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--card)] space-y-2 select-all">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold block">Carbon Fitness Score (CFS)</span>
              <div className="grid grid-cols-3 gap-2 items-baseline text-center">
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Before</span>
                  <span className="font-mono text-[14px] font-medium text-[var(--foreground)]">{currentComparison.beforeCfs}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">After</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">{currentComparison.afterCfs}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Delta</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">
                    {currentComparison.afterCfs - currentComparison.beforeCfs >= 0 ? '+' : ''}
                    {currentComparison.afterCfs - currentComparison.beforeCfs}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Remaining Card */}
            <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--card)] space-y-2 select-all">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold block">Remaining Carbon Credits (kg)</span>
              <div className="grid grid-cols-3 gap-2 items-baseline text-center">
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Before</span>
                  <span className="font-mono text-[14px] font-medium text-[var(--foreground)]">{currentComparison.beforeBudget.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">After</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">{currentComparison.afterBudget.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Delta</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">
                    {currentComparison.afterBudget - currentComparison.beforeBudget > 0 ? '+' : ''}
                    {(currentComparison.afterBudget - currentComparison.beforeBudget).toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Violations Count Card */}
            <div className="border border-[var(--border)] rounded-md p-4 bg-[var(--card)] space-y-2 select-all">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold block">Conformance Violations</span>
              <div className="grid grid-cols-3 gap-2 items-baseline text-center">
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Before</span>
                  <span className="font-mono text-[14px] font-medium text-[var(--foreground)]">{currentComparison.beforeViolations}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">After</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">{currentComparison.afterViolations}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[var(--trace-subtle)] block">Delta</span>
                  <span className="font-mono text-[14px] font-bold text-[var(--trace-success)]">
                    {currentComparison.afterViolations - currentComparison.beforeViolations >= 0 ? '+' : ''}
                    {currentComparison.afterViolations - currentComparison.beforeViolations}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Saved Scenarios Table */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
          Saved Simulation Scenarios Ledger
        </h3>
        {scenarios.length > 0 ? (
          <DataTable columns={savedColumns} data={scenarios} />
        ) : (
          <div className="border border-[var(--border)] rounded-md py-10 text-center text-[12px] text-[var(--trace-subtle)] font-sans">
            Run a simulation to see results here.
          </div>
        )}
      </div>
    </div>
  );
}
