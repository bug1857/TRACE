'use client';

import React, { useState } from 'react';
import { CheckCircle, Leaf, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import { mockRouteRecommendations } from '@/lib/mockData';
import { RouteRecommendation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAnalysis } from '@/lib/AnalysisContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function GreenRoutesPage() {
  const { analysis } = useAnalysis();
  
  // Use real backend recommendations when analysis is present, else fall back to mock data
  const recommendations = analysis?.greenRoutes || mockRouteRecommendations;

  const [activeRec, setActiveRec] = useState<RouteRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleApplyRec = (rec: RouteRecommendation) => {
    setActiveRec(rec);
    setIsModalOpen(true);
  };

  const confirmApplyRec = () => {
    if (!activeRec) return;
    setIsModalOpen(false);

    // (Simulated real-time impact skipped since recommendations are derived from context)
    setFeedbackMsg(`Route Optimization Applied: Changed path to "${activeRec.recommendedRoute}". Saved ${activeRec.carbonSaving.toLocaleString()} kg CO₂e.`);
    
    setTimeout(() => {
      setFeedbackMsg('');
    }, 4500); // clear feedback msg after 4.5s
  };

  // Dynamically calculate emissions savings (in tCO2e) and cost delta from active list
  const totalCarbonSavingKg = recommendations.reduce((sum, r) => sum + r.carbonSaving, 0);
  const totalCarbonSavingT = (totalCarbonSavingKg / 1000).toFixed(1);
  const totalCostDelta = recommendations.reduce((sum, r) => sum + r.costDelta, 0);
  const absCostDelta = Math.abs(totalCostDelta);
  const costText = totalCostDelta <= 0
    ? `reduced by $${absCostDelta.toLocaleString()}`
    : `increased by $${absCostDelta.toLocaleString()}`;

  const columns: Column<RouteRecommendation>[] = [
    {
      header: 'Current Route',
      accessorKey: 'currentRoute',
      sortable: true,
      cell: (row) => <span className="text-[var(--destructive)] font-medium">{row.currentRoute}</span>
    },
    {
      header: 'Recommended Route',
      accessorKey: 'recommendedRoute',
      sortable: true,
      cell: (row) => <span className="text-[var(--trace-success)] font-medium">{row.recommendedRoute}</span>
    },
    {
      header: 'Carbon Saving',
      accessorKey: 'carbonSaving',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span className="font-mono text-[var(--trace-success)] font-bold">-{row.carbonSaving.toLocaleString()} kg</span>
    },
    {
      header: 'Cost Delta',
      accessorKey: 'costDelta',
      isNumeric: true,
      sortable: true,
      cell: (row) => {
        const isSaving = row.costDelta <= 0;
        return (
          <span className={`font-mono ${isSaving ? 'text-[var(--trace-success)]' : 'text-[var(--trace-warning)]'}`}>
            {isSaving ? '-' : '+'}${Math.abs(row.costDelta).toLocaleString()}
          </span>
        );
      }
    },
    {
      header: 'Confidence',
      accessorKey: 'confidence',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span className="font-mono">{(row.confidence * 100).toFixed(0)}%</span>
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleApplyRec(row)}
          className="h-[28px] text-[11px] font-sans border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
        >
          <span>Apply</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Green Route Recommendations"
        subtitle="Transport rerouting scenarios computed from real shipment volumes, using industry-typical carbon reduction estimates."
      />

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-[var(--trace-success-light)] border border-[var(--trace-success)]/10 text-[var(--trace-success)] text-[13px] rounded-md font-sans flex items-center gap-2 select-none">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Summary Banner */}
      <div className="flex items-start gap-3 bg-[var(--trace-success-light)] border border-[var(--trace-success)]/10 p-4 rounded-md select-none">
        <Leaf className="w-5 h-5 text-[var(--trace-success)] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[13px] font-sans font-semibold text-[var(--trace-success)]">
            Emissions Optimization Potential
          </h4>
          <p className="text-[12px] text-[var(--muted-foreground)] font-sans mt-0.5">
            Applying all recommendations saves <span className="font-mono font-bold text-[var(--trace-success)]">{totalCarbonSavingT} tCO₂e</span> this quarter. Cumulative shipping costs are <span className="font-mono font-bold text-[var(--trace-success)]">{costText}</span>.
          </p>
        </div>
      </div>

      {/* Recommendations Ledger */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
          Alternative Pathway Recommendations
        </h3>
        <DataTable columns={columns} data={recommendations} />
      </div>

      {/* Apply Confirmation Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[400px] bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[var(--foreground)]">
              Apply Route Recommendation
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[var(--muted-foreground)] pt-1">
              Confirm applying the route optimization plan. This changes active logistics templates to use the recommended route:
              <span className="block mt-2 font-semibold text-[var(--trace-success)]">&quot;{activeRec?.recommendedRoute}&quot;</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="h-[32px] text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApplyRec}
              className="h-[32px] text-[12px] bg-[var(--primary)] hover:bg-[var(--trace-success)] text-white rounded-md"
            >
              Confirm Optimization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
