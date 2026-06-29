# TRACE Application - Complete Logic & Mapping Summary

This document extracts the essential data mapping, state management, and mathematical logic for *every* page in the TRACE application, excluding boilerplate UI components.

---

## 1. Executive Dashboard (`app/(dashboard)/executive/page.tsx`)
**Summary**: Aggregates high-level metrics across all domains for a C-suite view.
**Math / Logic**:
- **Average Carbon Fitness Score (CFS)**:
  ```tsx
  const avgCFS = (
    analysis.cfsScores.reduce((acc, curr) => acc + curr.cfsScore, 0) / 
    analysis.cfsScores.length
  ).toFixed(1);
  ```
- **At-Risk Suppliers Count**:
  ```tsx
  const atRiskSuppliers = suppliers.filter(s => (s.avgCfsScore ?? 0) < 90).length;
  ```

---

## 2. What-If Operational Simulator (`app/(dashboard)/simulation/page.tsx`)
**Summary**: Simulates the impact of logistical changes.
**Math / Logic**:
- **Carbon Reduction Factor**: 
  ```tsx
  const carbonReduction = (airFreightRed * 0.35) + (supplierShift * 0.45) + (activityRemoval !== 'None' ? 8 : 0);
  ```
- **Simulated Outcomes**:
  ```tsx
  const simulatedAfterCarbon = Math.round(baselineCarbon * (1 - carbonReduction / 100));
  const simulatedAfterCfs = Math.min(100, Math.round(baselineCfs + (airFreightRed * 0.15 + supplierShift * 0.18)));
  const simulatedAfterBudget = totalBudgetLimit - simulatedAfterCarbon;
  const simulatedAfterViolations = Math.max(2, Math.round(baselineViolations * (1 - (airFreightRed * 0.4 + supplierShift * 0.3) / 100)));
  ```

---

## 3. Carbon Budget Ledger (`app/(dashboard)/carbon-budget/page.tsx`)
**Summary**: Predicts budget breaches.
**Math / Logic**:
- **Average Monthly Burn Rate & Prediction**:
  ```tsx
  const avgMonthlyBurn = actualMonths.reduce((sum, m) => sum + m.actual, 0) / (actualMonths.length || 1);
  const predictedBreachDays = Math.round((budgetLimit - totalUsed) / (avgMonthlyBurn / 30 || 1));
  ```

---

## 4. Sustainability Conformance (`app/(dashboard)/sustainability-conformance/page.tsx`)
**Summary**: Evaluates variants against ESG policy rules.
**Math / Logic**:
- **Rule Engine Evaluation**:
  ```tsx
  const getPassCount = (v: CarbonFitnessItem) => {
    return policyRules.filter(r => r.check(v, violations).status === 'pass').length;
  };
  ```

---

## 5. Forecasting (`app/(dashboard)/forecasting/page.tsx`)
**Summary**: Forecasts emissions using linear benchmarking.
**Math / Logic**:
- **SVG Chart Normalization**:
  ```tsx
  const valRange = maxVal - minVal || 1;
  const y = 180 - ((m.actual - minVal) / valRange) * 160;
  ```

---

## 6. Green Routes (`app/(dashboard)/green-routes/page.tsx`)
**Summary**: Quantifies carbon savings.
**Math / Logic**:
- **Total Savings Aggregation**:
  ```tsx
  const totalCarbonSavingKg = recommendations.reduce((sum, r) => sum + r.carbonSaving, 0);
  const totalCostDelta = recommendations.reduce((sum, r) => sum + r.costDelta, 0);
  ```

---

## 7. OCEL Graph Plotting (`app/(dashboard)/ocel/page.tsx`)
**Summary**: Parses logs to maps.
**Math / Logic**:
- **Node Grid Positioning (ReactFlow)**:
  ```tsx
  const xCoord = 50 + index * 200;
  const yCoord = 100 + (index % 2) * 90; // Staggered y-axis
  ```

---

## 8. Conformance Violations (`app/(dashboard)/conformance/page.tsx`)
**Math / Logic**:
- **Excess Emissions Calculation**:
  ```tsx
  const totalExcessCarbon = violations.reduce((sum, v) => sum + v.carbonDeltaKg, 0);
  ```

---

## 9. AI Copilot Engine (`app/(dashboard)/copilot/page.tsx`)
**Summary**: Manages contextual state passing to local Ollama LLMs.
**Math / Logic**:
- **Dynamic Context Generation**: Calculates average CFS scores and maps violations dynamically to build a context prompt for the AI.
  ```tsx
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  if (avg < 50) statusStr = 'Critical';
  else if (avg < 80) statusStr = 'Warning';
  
  const totalViolations = analysis.violations.length;
  const criticalViolations = analysis.violations.filter(v => v.severity?.toLowerCase() === 'critical').length;
  ```

---

## 10. Process Optimization (`app/(dashboard)/process-optimization/page.tsx`)
**Summary**: Identifies rework loops and maps bottleneck statuses.
**Math / Logic**:
- **Status Mapping**: Maps numerical API metrics into threshold-based status badges.
  ```tsx
  const bottlenecks = analysis.processOptimization.bottlenecks.map((b) => ({
    activity: b.activity,
    avgWaitTime: b.avgWaitHours,
    occurrences: b.occurrences,
    status: b.status === 'moderate' ? 'warning' : b.status === 'optimized' ? 'pass' : 'critical',
  }));
  ```

---

## 11. ESG Report (`app/(dashboard)/esg-report/page.tsx`)
**Summary**: Displays the overall corporate ESG proxy scores.
**Math / Logic**:
- **State Selection**: Directly consumes the `analysis.esgReport` object evaluated by the backend, formatting decimal outputs to fixed precisions (`toFixed(1)`).
- *Note*: Core ESG composite scores (Env 40%, Soc 30%, Gov 30%) are executed strictly on the backend API layer.

---

## 12. Carbon Fitness & Supplier Fitness (`app/(dashboard)/carbon-fitness/page.tsx`, `supplier-fitness/page.tsx`)
**Summary**: Ranks variants and suppliers based on Carbon Fitness Score.
**Math / Logic**:
- **Sorting Logic**: Ranks variants dynamically.
  ```tsx
  const sortedVariants = [...analysis.cfsScores].sort((a, b) => a.cfsScore - b.cfsScore);
  ```

---

## 13. Dashboard Overview (`app/(dashboard)/dashboard/page.tsx`)
**Summary**: High level KPI entry point.
**Math / Logic**:
- **Log Aggregation**: Calculates summary totals from the parsed event logs.
  ```tsx
  const totalCases = analysis.processOptimization.totalCasesAnalyzed;
  const totalNodes = analysis.processModel.nodes.length;
  const totalEdges = analysis.processModel.edges.length;
  ```

---

## 14. BRSR Report, Audit Logs, Settings, Organizations (`app/(dashboard)/*`)
**Summary**: Administrative and reporting configurations.
**Logic**: 
- These pages utilize standard Next.js / React functional state (`useState`, `useEffect`) to map backend arrays (e.g. `auditLogs.map()`) directly into data tables or static PDF generators (using `window.print()`). They do not contain frontend mathematical derivations or proxy algorithms.
