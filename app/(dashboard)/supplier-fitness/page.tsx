'use client';

import React, { useState } from 'react';
import { Truck, AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { Column } from '@/components/shared/DataTable';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { mockSupplierFitness } from '@/lib/mockData';
import { SupplierFitness } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAnalysis } from '@/lib/AnalysisContext';
import { postAuditLog } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function SupplierFitnessPage() {
  const { analysis } = useAnalysis();
  const [actionSupplier, setActionSupplier] = useState<SupplierFitness | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const suppliers = (analysis && analysis.supplierFitness && analysis.supplierFitness.length > 0)
    ? analysis.supplierFitness
    : mockSupplierFitness;

  const handleRequestAction = (supplier: SupplierFitness) => {
    setActionSupplier(supplier);
    setIsAlertOpen(true);
  };

  const confirmActionRequest = () => {
    if (!actionSupplier) return;
    setIsAlertOpen(false);
    setFeedbackMsg(`Corrective action request sent to ${actionSupplier.supplier} successfully.`);
    setTimeout(() => setFeedbackMsg(''), 4000); // clear feedback message after 4s

    // Fire-and-forget persistence call
    postAuditLog(
      'REQUEST_CORRECTIVE_ACTION',
      actionSupplier.supplier,
      `Corrective action requested for ${actionSupplier.supplier} — CFS ${actionSupplier.avgCfsScore.toFixed(1)}%, ${actionSupplier.violationCount} violations`
    ).catch((err) => {
      console.error('Failed to persist audit log:', err);
    });
  };

  // Helper for color-coded CFS pills
  const getCfsPill = (cfs: number) => {
    let bg = 'bg-[var(--trace-success-light)]';
    let text = 'text-[var(--trace-success)]';
    let border = 'border-[var(--trace-success)]/10';

    if (cfs < 50) {
      bg = 'bg-[var(--trace-danger-light)]';
      text = 'text-[var(--destructive)]';
      border = 'border-[var(--destructive)]/10';
    } else if (cfs < 80) {
      bg = 'bg-[var(--trace-warning-light)]';
      text = 'text-[var(--trace-warning)]';
      border = 'border-[var(--trace-warning)]/10';
    }

    return (
      <span className={`inline-flex items-center justify-center px-2 py-0.5 border text-[11px] font-mono font-medium rounded-full ${bg} ${text} ${border} w-[54px]`}>
        {cfs.toFixed(1)}%
      </span>
    );
  };

  const columns: Column<SupplierFitness>[] = [
    {
      header: 'Supplier Name',
      accessorKey: 'supplier',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[var(--muted-foreground)]" />
            <span className="font-medium text-[var(--foreground)]">{row.supplier}</span>
          </div>
          {row.isResourceFallback && (
            <span className="text-[10px] text-[var(--trace-subtle)] ml-6 font-sans italic">
              (via resource column)
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Total Carbon (kg)',
      accessorKey: 'totalCarbonKg',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.totalCarbonKg.toLocaleString()} kg</span>
    },
    {
      header: 'Cases Handled',
      accessorKey: 'caseCount',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.caseCount}</span>
    },
    {
      header: 'Violations Count',
      accessorKey: 'violationCount',
      isNumeric: true,
      sortable: true,
      cell: (row) => <span>{row.violationCount}</span>
    },
    {
      header: 'Average CFS',
      accessorKey: 'avgCfsScore',
      isNumeric: true,
      sortable: true,
      cell: (row) => getCfsPill(row.avgCfsScore)
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRequestAction(row)}
          className="h-[28px] text-[11px] font-sans border-[var(--border)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] flex items-center gap-1 rounded-md"
        >
          <Mail className="w-3 h-3" />
          <span>Request Corrective Action</span>
        </Button>
      )
    }
  ];

  const lowCfsSuppliers = suppliers.filter(s => s.avgCfsScore < 50);

  return (
    <div className="flex flex-col flex-1 space-y-6">
      <PageHeader
        title="Supplier ESG Fitness Index"
        subtitle="Benchmark external cargo carriers, transport providers, and Scope 3 vendors by carbon efficiency."
      />

      <DemoDataBanner show={!analysis || !analysis.supplierFitness || analysis.supplierFitness.length === 0} />

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-[var(--trace-success-light)] border border-[var(--trace-success)]/10 text-[var(--trace-success)] text-[13px] rounded-md font-sans flex items-center gap-2 select-none">
          <CheckCircle className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Warning Banner */}
      {lowCfsSuppliers.length > 0 && (
        <div className="flex items-start gap-3 bg-[var(--trace-danger-light)] border border-[var(--destructive)]/10 p-4 rounded-md select-none">
          <AlertTriangle className="w-5 h-5 text-[var(--destructive)] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[13px] font-sans font-semibold text-[var(--destructive)]">
              Action Required
            </h4>
            <p className="text-[12px] text-[var(--muted-foreground)] font-sans mt-0.5">
              {lowCfsSuppliers.length} supplier{lowCfsSuppliers.length > 1 ? 's' : ''} below threshold (CFS &lt; 50). Dispatched freight is causing active carbon ledger deficits. Corrective actions are recommended.
            </p>
          </div>
        </div>
      )}

      {/* Supplier Index Table */}
      <div className="space-y-3">
        <h3 className="text-[13px] font-sans font-medium text-[var(--foreground)] uppercase tracking-wider">
          Carrier Performance Ledger
        </h3>
        <DataTable columns={columns} data={suppliers} />
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="max-w-[400px] bg-[var(--background)] border border-[var(--border)] rounded-md shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-sans font-medium text-[var(--foreground)]">
              Confirm Corrective Action Request
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[var(--muted-foreground)] pt-1">
              Are you sure you want to dispatch a formal carbon-compliance warning and request corrective action plans from {actionSupplier?.supplier}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsAlertOpen(false)}
              className="h-[32px] text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--card)] rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmActionRequest}
              className="h-[32px] text-[12px] bg-[var(--destructive)] hover:bg-[#9B2C21] text-white rounded-md"
            >
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
