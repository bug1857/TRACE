'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OcelMetadata, OcelNode, OcelEdge, CarbonBudgetMonth, Violation, CfsScore, SupplierFitness, ColumnMapping, ActivityCarbonBreakdownItem, ProcessOptimization, BrsrReport, EsgReport, RouteRecommendation } from './types';

export interface UploadResponse {
  metadata: OcelMetadata;
  nodes: OcelNode[];
  edges: OcelEdge[];
  columnMapping: ColumnMapping;
  carbonBudget: CarbonBudgetMonth[];
  totalCarbonKg: number;
  activityCarbonBreakdown: ActivityCarbonBreakdownItem[];
  violations: Violation[];
  cfsScores: CfsScore[];
  supplierFitness: SupplierFitness[];
  processOptimization: ProcessOptimization;
  brsrReport?: BrsrReport;
  esgReport?: EsgReport;
  greenRoutes?: RouteRecommendation[];
  totalOperationalCostUSD?: number;
  conformanceRuleScope?: {
    disallowed_activities: string[];
    mandated_alternative: string;
  }[];
}

interface AnalysisContextType {
  analysis: UploadResponse | null;
  setAnalysis: (data: UploadResponse | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<UploadResponse | null>(null);

  return (
    <AnalysisContext.Provider value={{ analysis, setAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
