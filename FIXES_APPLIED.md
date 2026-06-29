# TRACE Platform — Fixes Applied

Generated: 2026-06-29

All changes listed below were made as part of the complete A-to-Z forensic audit.

---

## Part 1 — Hardcoded Value Fixes

### `app/(dashboard)/dashboard/page.tsx` — FULL REWRITE
Full page rewritten. Specific removals:

| Fix | Before | After |
|-----|--------|-------|
| Scope pie chart | Hardcoded 55%/35%/10% splits of totalCarbonKg | Replaced with real `activityCarbonBreakdown` bar chart (top 8 activities) |
| YoY trend badges | `18% YoY`, `12% YoY` hardcoded strings | Replaced with `—` (no prior-year data available) |
| Net Zero progress | `15%` hardcoded | Replaced with `—` |
| Energy Use trend | `3%` hardcoded | Replaced with `—` |
| Year badge | `2025` hardcoded | Derived from `analysis.carbonBudget` month strings dynamically |
| Reduction Targets | 64% / 28% progress bars, `w-[64%]` CSS | Entire widget removed (no target schema in event log) |
| Date label | `(Oct 2023)` static label | Removed entirely |
| Recent Emissions table | `10/25` date, Scope `2`, `↓ 2.1%` / `↑ 1.4%` delta columns | All fake columns removed; only `activity`, `category`, `totalCarbon` remain |
| Empty state | No empty state when no analysis loaded | Added graceful empty state with `<Database>` icon and prompt |
| Dropped rows banner | No warning for missing data | Added yellow `<AlertTriangle>` banner when `dataQuality.droppedRows > 0` |

### `app/page.tsx` — Line 91
- **Before:** `"trace_demo_dataset.csv in repo root. 800 cases, 4,231 events, Jan–Dec 2025. 368 violations baseline."`
- **After:** `"A sample OCEL 2.0 CSV is included in the repository root for quick evaluation. Upload any event log with case ID, activity, and timestamp columns to run a live analysis."`

---

## Part 2 — CSV Upload Pipeline Fixes

### `backend/main.py` — Upload endpoint

| Fix | Change |
|-----|--------|
| File size guard | Added 50 MB check before reading contents into memory. Returns HTTP 413 with descriptive message if exceeded. |
| Dropped rows count | `dropped_rows_count = int(parsed_ts.isna().sum())` computed after timestamp parsing. Returned in both `metadata.droppedRows` and `dataQuality.droppedRows + dropReason` fields. |

### `lib/AnalysisContext.tsx`
- Added `dataQuality?: DataQuality` field to `UploadResponse` interface so the dropped-rows count propagates through the frontend context to the dashboard banner.

### `lib/types.ts`
- Added `DataQuality` interface: `{ droppedRows: number; dropReason: string | null; }`

---

## Part 3 — Benchmarking Engine

### `backend/requirements.txt`
- Added `pm4py>=2.7.0` and `numpy>=1.26.0`

### `backend/benchmarking/__init__.py` — NEW
- Empty package init file.

### `backend/benchmarking/engine.py` — NEW
Full 6-model benchmarking engine. Models implemented:

| # | Model | Method | Metrics |
|---|-------|--------|---------|
| 1 | Token Replay | `pm4py.conformance_diagnostics_token_based_replay` on IM-discovered net | fitness, precision, F1, CFS |
| 2 | Alignments | `pm4py.conformance_diagnostics_alignments`, cost-normalised fitness | fitness, precision, F1, CFS |
| 3 | Footprint | `pm4py.footprints.algorithm` similarity | fitness, precision, F1, CFS |
| 4 | Inductive Miner | IMf variant discovery + token replay | fitness, precision, F1, CFS |
| 5 | Heuristics Miner | `pm4py.discover_petri_net_heuristics` + token replay | fitness, precision, F1, CFS |
| 6 | DECLARE | `pm4py.discover_declare_model` + `pm4py.conformance_declare` | fitness only (precision N/A) |

Additional features:
- CFS computed once from the raw event log using TRACE's existing formula and applied to all models
- Per-model error isolation: if one model fails, others continue
- 120s global timeout: remaining models skipped with `error: "Skipped: global timeout reached."`
- Winner selection: highest F1 → highest fitness → highest CFS as tiebreaker

### `backend/main.py` — New endpoints
- `GET /api/settings/carbon-budget` — returns current monthly budget limit
- `PATCH /api/settings/carbon-budget` — persists new limit to `carbon_budget_settings` table
- `POST /api/benchmarking/run` — accepts CSV upload, runs 6-model benchmark, returns `BenchmarkReport`

### `backend/models.py`
- Added `CarbonBudgetSetting` SQLAlchemy model (table: `carbon_budget_settings`)

### `app/(dashboard)/forecasting/page.tsx` — FULL REPLACEMENT
Old forecasting UI replaced with "Process Conformance Benchmark" page:
- Drag-drop CSV upload with live file size display
- Column mapping fallback UI (shown when auto-detect confidence < 0.5 for any required field)
- Elapsed timer during run (updates every 500ms)
- Results table: Model | Fitness | Precision | F1 | ★ CFS | Time (ms)
  - CFS column: accent-green background + "NOVEL" badge + tooltip explanation
  - Per-column colour coding: highest value = green, lowest = red
  - DECLARE rows show "N/A" in Precision and F1 cells
  - Winner row: accent tint + Trophy icon
- Radar chart: 5 axes (Fitness, Precision, F1, CFS, Speed), 6 model polygons, recharts RadarChart
- Winner card: model name, all scores, `winner_justification` text, "Recommended" badge
- Export CSV button: client-side generation, no backend call
- Timeout/error banners

### `backend/forecasting.py` — ARCHIVED
- Renamed to `forecasting.py.bak` — not deleted, preserved for reference.

### `backend/main.py` — forecasting call removed
- The `from forecasting import benchmark_forecasts` call in the upload handler replaced with `forecasting_result = None`. The `forecasting` field in the upload response is retained for schema backward compatibility.

### `lib/types.ts`
- Added `ModelResult`, `BenchmarkDatasetSummary`, `BenchmarkReport` interfaces.

---

## Part 4 — Dead Feature Fixes

### `app/(dashboard)/simulation/page.tsx`

| Fix | Change |
|-----|--------|
| Mock scenario clearing | `useState(isReal ? [] : mockSimulationScenarios)` — mock scenarios only pre-populated when no real analysis exists. Cleared when real analysis transitions in via `setScenarios([])`. |
| Approximation disclaimer | Added `<p>⚠ Simulation uses statistical approximations, not a process execution model.</p>` under Run Simulation button. |
| Empty state for scenarios table | `scenarios.length > 0 ? <DataTable> : <div>Run a simulation to see results here.</div>` |

---

## Verification

```
✅ python3 -c "from benchmarking.engine import run_benchmark; print('OK')"
   → OK — benchmarking.engine imports successfully

✅ python3 -c "import main; print('OK')"
   → OK — main.py imports cleanly
   (pydantic orm_mode UserWarning is pre-existing, not introduced by this change)
```

---

## Files Changed Summary

| File | Action |
|------|--------|
| `backend/requirements.txt` | MODIFIED — added pm4py, numpy |
| `backend/benchmarking/__init__.py` | NEW |
| `backend/benchmarking/engine.py` | NEW |
| `backend/main.py` | MODIFIED — 4 changes: 50MB guard, dropped_rows, carbon-budget endpoints, benchmarking endpoint, removed forecasting call |
| `backend/models.py` | MODIFIED — added CarbonBudgetSetting model |
| `backend/forecasting.py` | ARCHIVED as forecasting.py.bak |
| `app/(dashboard)/dashboard/page.tsx` | FULL REWRITE |
| `app/(dashboard)/forecasting/page.tsx` | FULL REPLACEMENT (benchmarking UI) |
| `app/(dashboard)/simulation/page.tsx` | MODIFIED — mock clearing, disclaimer, empty state |
| `app/page.tsx` | MODIFIED — line 91 description |
| `lib/AnalysisContext.tsx` | MODIFIED — added DataQuality field |
| `lib/types.ts` | MODIFIED — added BenchmarkReport, ModelResult, DataQuality |
