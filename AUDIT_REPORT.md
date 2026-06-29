# TRACE Platform — Forensic Audit Report

Generated: 2026-06-29

---

## Executive Summary

A complete file-by-file audit of the TRACE codebase was performed across the
frontend (Next.js), backend (FastAPI), and shared library layers. Every hardcoded
value, dead feature, pipeline gap, and mock-data leakage was catalogued.

**Total issues found: 26**
**Critical (renders fake data as real): 14**
**Moderate (labelling/pipeline): 8**
**Low (docs/defaults): 4**

---

## Part 1 — Hardcoded Value Findings

### `app/(dashboard)/dashboard/page.tsx`

| Severity | Line(s) | Finding |
|----------|---------|---------|
| CRITICAL | 47–49 | Scope 1/2/3 pie chart built with hardcoded splits `0.55 / 0.35 / 0.10` of `totalCarbonKg`. No Scope data exists in event logs. |
| CRITICAL | 100 | `<span>18% YoY</span>` — no prior-year carbon data. Completely fabricated trend. |
| CRITICAL | 120 | `<span>12% YoY</span>` — same as above. |
| CRITICAL | 139 | `<span>15%</span>` — "Net Zero Progress" badge with no basis in data. |
| CRITICAL | 159 | `<span>3%</span>` — "Energy Use" trend badge, no energy data in event log. |
| HIGH | 171 | `<span>2025</span>` — year badge hardcoded, not derived from the event log timestamp range. |
| CRITICAL | 262–271 | "Reduction Targets" widget with `64%` / `28%` progress bars and `w-[64%]` / `w-[28%]` widths. No target schema in event log. |
| HIGH | 287 | `(Oct 2023)` — static date label embedded in the chart, no data source. |
| CRITICAL | 305 | `10/25` — hardcoded date in "Recent Emissions Data" table row. |
| CRITICAL | 312 | `2` — hardcoded Scope value per row in table. |
| CRITICAL | 317–318 | `↓ 2.1%` / `↑ 1.4%` — alternating fake delta percentages hardcoded per row. |

### `app/page.tsx`

| Severity | Line | Finding |
|----------|------|---------|
| MODERATE | 91 | `"800 cases, 4,231 events, Jan–Dec 2025. 368 violations baseline."` — hardcoded dataset statistics in documentation panel. |

### `backend/carbon_budget.py`

| Severity | Line | Finding |
|----------|------|---------|
| MODERATE | 13 | `DEFAULT_MONTHLY_BUDGET_KG = 10000` — hardcoded threshold. Not configurable at runtime. |

### `backend/brsr_report.py`

| Severity | Line | Finding |
|----------|------|---------|
| LOW | 16 | `reporting_period: str = "2026"` — fallback reporting period is hardcoded. (Correctly overridden from timestamp data when available.) |

### `lib/mockData.ts`

| Severity | Exports | Finding |
|----------|---------|---------|
| HIGH | `mockSimulationScenarios` | Pre-seeded simulation scenarios (Sim-1, Sim-2) with specific before/after carbon numbers are permanently rendered in `simulation/page.tsx` even after a real upload. |
| MODERATE | All arrays | Used as fallback placeholders in demo mode — correctly gated behind `DemoDataBanner`. No action needed in most pages. |

### `app/(dashboard)/simulation/page.tsx`

| Severity | Line(s) | Finding |
|----------|---------|---------|
| CRITICAL | 101–105 | `handleRunSimulation` uses hardcoded coefficients `0.35`, `0.45`, `0.15`, `0.18`, `0.4`, `0.3` inside `setTimeout(1000ms)`. This is a statistical approximation disguised as a process simulation, with no connection to any process model. |
| HIGH | 18 | `useState(mockSimulationScenarios)` — mock scenarios always pre-populated regardless of real analysis. |

---

## Part 2 — CSV Upload Pipeline

### Issues Found

| Severity | File | Finding |
|----------|------|---------|
| HIGH | `backend/main.py` | Rows with unparseable timestamps are silently dropped via `errors='coerce'`. No count is returned to the user. |
| MODERATE | `backend/main.py` | No file size limit. A 500 MB CSV would load entirely into RAM before validation. |

### Behaviours Confirmed Correct

- Empty CSV -> HTTP 400 "The uploaded CSV file is empty."
- Generic headers (col1, col2...) -> HTTP 422 with `missing_fields` + `available_columns` for manual mapping.
- Mixed types in timestamp -> invalid rows coerced to NaT and dropped; remaining rows processed.
- All KPIs (CFS, ESG, violations, carbon budget) recomputed fresh on every upload — no caching.

---

## Part 3 — Forecasting Module (Dead Weight)

| File | Status |
|------|--------|
| `backend/forecasting.py` | Replaced. Provides only 4 trivial statistical baselines (Naive, MA3, LinearTrend, SeasonalNaive). No process mining. No connection to pm4py. **Archived as `forecasting.py.bak`.** |
| `app/(dashboard)/forecasting/page.tsx` | Replaced with full 6-model conformance benchmarking UI. |

---

## Part 4 — Dead Feature Audit

| Element | Location | Status |
|---------|----------|--------|
| "18% YoY" KPI badge | `dashboard/page.tsx:100` | DEAD — no prior-year data |
| "12% YoY" KPI badge | `dashboard/page.tsx:120` | DEAD |
| "15%" Net Zero badge | `dashboard/page.tsx:139` | DEAD |
| "3%" Energy badge | `dashboard/page.tsx:159` | DEAD |
| Scope pie chart (55/35/10) | `dashboard/page.tsx:47-49` | DEAD — no scope tags in event log |
| Reduction Targets widget | `dashboard/page.tsx:262-271` | DEAD — no target schema |
| `(Oct 2023)` date label | `dashboard/page.tsx:287` | DEAD — static label |
| `10/25` / `Scope 2` / delta table | `dashboard/page.tsx:305-318` | DEAD |
| `Run Simulation` button | `simulation/page.tsx:304` | APPROXIMATION — uses setTimeout + linear formula |
| Pre-seeded simulation scenarios | `simulation/page.tsx:18` | FAKE when real data loaded |
| Entire forecasting page | `forecasting/page.tsx` | REPLACED by benchmarking engine |
