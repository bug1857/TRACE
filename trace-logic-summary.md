# TRACE Application - Important Logic & Math Formulas

This document outlines the critical business logic and mathematical formulas used across the TRACE application dashboards. It excludes boilerplate UI code and focuses solely on the analytical core of each page.

---

## 1. Executive Dashboard (`app/(dashboard)/executive/page.tsx`)
**Summary**: Aggregates high-level metrics across all domains for a C-suite view.
**Math / Logic**:
- **Average Carbon Fitness Score (CFS)**:
  Calculates the mean CFS across all processed cases.
  ```tsx
  const avgCFS = (
    analysis.cfsScores.reduce((acc, curr) => acc + curr.cfsScore, 0) / 
    analysis.cfsScores.length
  ).toFixed(1);
  ```
- **At-Risk Suppliers Count**:
  Filters suppliers based on a CFS threshold (< 90).
  ```tsx
  const atRiskSuppliers = suppliers.filter(s => (s.avgCfsScore ?? 0) < 90).length;
  ```

---

## 2. What-If Operational Simulator (`app/(dashboard)/simulation/page.tsx`)
**Summary**: Simulates the impact of logistical changes (like reducing air freight or shifting suppliers) on total carbon and budget.
**Math / Logic**:
- **Carbon Reduction Factor**: 
  Weighted impact of air freight reduction, supplier shifts, and activity removals.
  ```tsx
  const carbonReduction = (airFreightRed * 0.35) + (supplierShift * 0.45) + (activityRemoval !== 'None' ? 8 : 0);
  ```
- **Simulated Outcomes**:
  Projects the new Carbon, CFS, Budget, and Violation counts based on the reduction factor.
  ```tsx
  const simulatedAfterCarbon = Math.round(baselineCarbon * (1 - carbonReduction / 100));
  const simulatedAfterCfs = Math.min(100, Math.round(baselineCfs + (airFreightRed * 0.15 + supplierShift * 0.18)));
  const simulatedAfterBudget = totalBudgetLimit - simulatedAfterCarbon;
  const simulatedAfterViolations = Math.max(2, Math.round(baselineViolations * (1 - (airFreightRed * 0.4 + supplierShift * 0.3) / 100)));
  ```

---

## 3. Carbon Budget Ledger (`app/(dashboard)/carbon-budget/page.tsx`)
**Summary**: Tracks monthly emissions against an annual budget and predicts budget breaches.
**Math / Logic**:
- **Average Monthly Burn Rate**:
  ```tsx
  const actualMonths = months.filter(m => m.actual > 0);
  const avgMonthlyBurn = actualMonths.reduce((sum, m) => sum + m.actual, 0) / (actualMonths.length || 1);
  ```
- **Predicted Breach Days**:
  Estimates how many days until the remaining budget is exhausted at the current burn rate.
  ```tsx
  const predictedBreachDays = Math.round((budgetLimit - totalUsed) / (avgMonthlyBurn / 30 || 1));
  ```
- **Chart Plotting Logic**:
  Scales actual values to SVG coordinates relative to the monthly limit.
  ```tsx
  const monthlyLimit = budgetLimit / 12;
  const y = Math.max(10, Math.min(190, 100 - ((m.actual - monthlyLimit) / (monthlyLimit || 1)) * 50));
  ```

---

## 4. Sustainability Conformance (`app/(dashboard)/sustainability-conformance/page.tsx`)
**Summary**: Evaluates process variants against predefined ESG policy rules.
**Math / Logic**:
- **Rule Engine Evaluation**:
  Runs variants through rules and calculates passed/failed rules per variant.
  ```tsx
  const getPassCount = (v: CarbonFitnessItem) => {
    return policyRules.filter(r => r.check(v, violations).status === 'pass').length;
  };
  ```
- **Example Rule Logic (No Air Freight)**:
  Checks if a specific variant path bypassed low-carbon options.
  ```tsx
  check: (v, violations) => {
    const airV = violations.find(vl => vl.caseId === v.id && vl.activity.toLowerCase().includes('air'));
    if (airV) {
      return { status: 'fail', explanation: `Logistics bypass: Air Freight dispatch... causing ${airV.carbonDeltaKg} kg excess.` };
    }
    return { status: 'pass' };
  }
  ```

---

## 5. Forecasting (`app/(dashboard)/forecasting/page.tsx`)
**Summary**: Displays forecasted carbon emissions using multi-baseline benchmarking.
**Math / Logic**:
- **Chart Normalization**:
  Normalizes historical and forecasted values to fit within an SVG viewBox.
  ```tsx
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(...allValues);
  const valRange = maxVal - minVal || 1;
  const y = 180 - ((m.actual - minVal) / valRange) * 160;
  ```
*(Note: Core forecasting algorithms like MAE/MAPE calculations, Linear Trend, and ARIMA are handled by the backend API and passed to the frontend as `analysis.forecasting`)*

---

## 6. Green Routes (`app/(dashboard)/green-routes/page.tsx`)
**Summary**: Quantifies carbon savings and cost deltas for alternative transport routes.
**Math / Logic**:
- **Total Savings Aggregation**:
  ```tsx
  const totalCarbonSavingKg = recommendations.reduce((sum, r) => sum + r.carbonSaving, 0);
  const totalCarbonSavingT = (totalCarbonSavingKg / 1000).toFixed(1); // Converts to metric tonnes
  
  const totalCostDelta = recommendations.reduce((sum, r) => sum + r.costDelta, 0);
  const absCostDelta = Math.abs(totalCostDelta);
  ```

---

## 7. OCEL Graph Plotting (`app/(dashboard)/ocel/page.tsx`)
**Summary**: Dynamically generates process maps from Object-Centric Event Logs.
**Math / Logic**:
- **Node Coordinate Generation**:
  Automatically positions process nodes in a staggered grid layout for ReactFlow.
  ```tsx
  const reactFlowNodes = nodes.map((node, index) => {
    const xCoord = 50 + index * 200;
    const yCoord = 100 + (index % 2) * 90; // Staggers nodes vertically
    return {
      id: node.id,
      position: { x: xCoord, y: yCoord },
      // ...
    };
  });
  ```

---

## 8. Conformance Violations (`app/(dashboard)/conformance/page.tsx`)
**Summary**: Aggregates the total impact of process conformance violations.
**Math / Logic**:
- **Excess Emissions Calculation**:
  Sums the extra carbon footprint caused specifically by policy deviations.
  ```tsx
  const totalExcessCarbon = violations.reduce((sum, v) => sum + v.carbonDeltaKg, 0);
  const criticalCount = violations.filter(v => v.severity === 'critical').length;
  ```
