# TRACE — Full Context Handoff (A to Z)

> For a NEW Claude instance (or any AI) picking up this project. Read this fully before responding to anything. This file supersedes any older handoff version — if a `PLAN.md` exists in the repo root with a build checklist, treat it as a companion, not a replacement. **Keep this file updated after each major session, keep it lean — trim resolved/superseded detail, don't just append forever.**

---

## 1. What This Project Is

**TRACE** — OCEL 2.0 process mining + carbon/ESG intelligence platform for supply chain audits. **Hackathon submission.**

- Repo: `/Users/rudrapratapsingh/Desktop/TRACE` — GitHub: `bug1857/TRACE.git`
- Frontend: Next.js 16, React 19, TypeScript (strict), Tailwind v4, shadcn/ui, React Flow
- Backend: FastAPI, Python 3.14, SQLite + SQLAlchemy, pandas
- Structure: frontend at repo **root**, backend in `/backend` subfolder — intentional, do not restructure
- Theme: corporate off-white, bg `#FAFAF8`, borders `#E2E0D8`, Inter + JetBrains Mono

---

## 2. Working Style (IMPORTANT — do not drift from this)

- User speaks Hinglish, wants **very terse responses**. No over-explaining.
- User wants Claude to **make all decisions** ("tu manager hai"). Don't ask unless a decision genuinely needs user input — and when you do ask, keep it to one tight question, not a list.
- **Claude never writes code for the user to paste.** Claude writes prompts → user pastes into **Antigravity** (a separate coding agent) → Antigravity executes, returns walkthrough/output → user pastes back → Claude **verifies against contract**, flags gaps, gives small fix-prompts.
- **Big tasks split: Step A (standalone logic+test) → Step B (wire into API+pytest) → Step C (wire into frontend+browser test).**
- Hackathon: working demo > perfect engineering. BUT never show fake numbers next to real ones — prefer honest "—" placeholders. The project's whole ethos this session has been **"no dummies"** — every feature that looks functional must actually be functional, or it gets removed, not faked.
- Code delivered as plain markdown code fences in chat, not artifacts.
- **Risk**: a SEPARATE parallel Claude chat may build/refactor against the same repo without this session's review. Always re-establish current file state via git diff/file reads before trusting prior assumptions.
- **Verification discipline (critical, repeatedly enforced this session)**:
  - When Antigravity reports a fix, don't trust output-only confirmation if the output could look identical whether the fix landed or not (e.g. a `.sort()` on already-sorted data, or a "before/after" screenshot pair that doesn't actually isolate the variable being tested). Always ask for the actual diff or a properly isolated test in ambiguous cases.
  - **Always demand actual pasted screenshots, not just Antigravity's text summary**, before accepting any UI/visual claim as done. Text summaries have been wrong or incomplete multiple times this session (see Gotchas).
  - But don't over-fetch diffs/screenshots reflexively once a fix is genuinely confirmed — keep loops short, user is racing the clock.
- **Commit discipline (hard rule, violated once already — see Gotcha #17)**: Claude must explicitly say something like "approved, commit" in chat BEFORE Antigravity runs `git commit`. Verification and commit must NEVER happen in the same uninterrupted pass. This was violated once this session (commit `b2e0571` shipped before screenshot review completed) and was explicitly corrected — Antigravity has confirmed it will wait for explicit sign-off going forward. Do not let this regress.

---

## 3. Locked Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Database | SQLite + SQLAlchemy | Zero setup, local dev |
| Deployment | Local dev only | No deploy needed |
| Upload model | Single upload per workspace, shared via React Context (`lib/AnalysisContext.tsx`) | One CSV populates all pages for the active workspace |
| Backend state | **Now stateful when `workspace_id` provided** (see multi-tenancy below); fully stateless if `workspace_id` omitted | Originally pure stateless-per-request; upgraded this session to support real multi-tenancy. The stateless path is preserved as a regression gate — never break it. |
| CSV columns | Auto-detected via `column_mapper.py` | Fuzzy alias match + confidence-scored; supports water/electricity/cost as optional fields too |
| Response contract | Frozen, append-only | Never rename/remove existing fields |
| `metadata` object | Frozen as `{filename, rowCount, caseCount, activityCount, totalEvents}` — no timestamp range field | Shared across all pages; `brsrReport.reportingPeriod` defaults to hardcoded "2026" as accepted tradeoff |
| **Multi-tenancy** | **Real SQL-backed**: Organization → Project → Workspace → AnalysisSnapshot. Built this session, replacing a cosmetic-only sidebar shell. | User explicitly requested "no dummies" — every settings/org feature must be genuinely functional or removed entirely, not faked. |
| Conformance rules | Table-driven (`CONFORMANCE_RULES` in `conformance.py`), generalized from originally-hardcoded single scenario | Built this session (see Section 6); legacy `VIOLATION_RULES` array still dynamically constructed for backward compat with `carbon_fitness.py` |
| Settings → Integrations tab | **Removed entirely**, not stubbed | Can't be made genuinely functional without real SAP/AWS credentials — a fake "Configure" UI was judged worse than no UI at all (false capability claims mislead more than honest absence) |
| Copilot | Real local Ollama LLM integration, model-switching verified to actually forward the selected model to Ollama (not just cosmetic dropdown) | See Gotcha #16, and Section 8 verification this session |

---

## 4. The Procedure

1. **Decide** scope/key decisions
2. **Spec** — exact contract as a prompt
3. **Build** — Antigravity implements, Step A→B→C
4. **Verify** — checked against contract, gaps flagged tersely, **actual screenshots demanded, not just text summaries**
5. **Fix-loop** — small targeted prompt, not a redo
6. **Sign-off** — Claude explicitly says "approved, commit" in chat
7. **Commit** — only after step 6, never bundled into the same pass as verification
8. **Repeat** until clean, update this handoff doc, move to next module

Roles: User = relay only. Claude = architect/reviewer, owns every decision. Antigravity = implementer.

---

## 5. API Response Contract (`POST /api/ocel/upload`)

**Status: contract stable and fully verified end-to-end (code-level, not just output) against real 30K-event CSV + canonical demo dataset.**

```ts
{
  metadata: { filename, rowCount, caseCount, activityCount, totalEvents },
  nodes: { id, label, frequency, avgDuration }[],
  edges: { id, source, target, frequency, avgDelay }[],

  columnMapping: {
    case_id: { column: string|null, confidence: number },
    activity: { column, confidence },
    timestamp: { column, confidence },
    resource: { column, confidence },
    supplier: { column, confidence, isResourceFallback: boolean },
    water: { column, confidence },        // optional field, added this session
    electricity: { column, confidence },  // optional field, added this session
    cost: { column, confidence },         // optional field, added this session
    mappingSource: 'auto' | 'manual'
  },

  carbonBudget: { month, budget, actual, delta, status: 'critical'|'warning'|'pass' }[],
  totalCarbonKg: number,
  activityCarbonBreakdown: { activity, category, estimated: boolean, frequency, totalCarbon }[],
  totalOperationalCostUSD?: number,  // only present if cost column was mapped

  violations: { id, caseId, activity, mandatedAlternative, category, severity, carbonDeltaKg, estimated, timestamp }[],
  cfsScores: { caseId, actualCarbonKg, idealCarbonKg, cfsScore, violationCount }[],
  supplierFitness: { supplier, totalCarbonKg, violationCount, avgCfsScore, caseCount, isResourceFallback }[],

  // present ONLY when violations is empty — honest disclosure of rule scope, see Section 6
  conformanceRuleScope?: { disallowedActivities: string[], mandatedAlternative: string, category: string }[],

  processOptimization: {
    bottlenecks: { activity, avgWaitHours, occurrences, status: 'critical'|'moderate'|'optimized' }[],
    rework: { activity, reworkCount, reworkPercentage, carbonImpactKg }[],
    caseDurationDistribution: { bucket, count, percentage }[],
    totalCasesAnalyzed: number
  },

  brsrReport: {
    header: { orgName, workspaceContext, projectContext, reportingPeriod, reportVersion, auditReadiness, reportHash },
    executiveSummary: string,
    kpiStrip: { processComplianceScore, carbonFitnessScore, esgOverallScore, totalActualEmissions },
    sectionA: { orgName, workspaceContext, projectContext, reportingPeriod, reportVersion, auditReadiness },
    sectionB: { conformanceMethodology, totalEvaluatedTraces, nonConformingTraces, bottlenecks, conformanceRuleScopeNote? },
    sectionC: {
      resourceDraw: { energyKwh: number|null, waterLiters: number|null, wasteKg: null, carbonBudgetLimitKg, carbonBudgetStatus: 'EXCEEDED'|'WITHIN_LIMIT' },
      carbonHotspots: (activityCarbonBreakdown item + contributionPercent)[]  // sorted descending
    },
    sectionD_traceabilityMatrix: { metric, engine, sourceTable, referenceField }[],
    recommendations: { title, priority: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL', narrative, estEmissionReductionKg? }[]
  },

  esgReport: {
    environmental: { score: number, totalCarbonKg: number, carbonBudgetStatus, topHotspots: (item)[3], dataCompleteness: 'full' },
    social: { score: null, supplierCount: number, atRiskSupplierCount: number, note: string, dataCompleteness: 'partial' },  // score always null by design — no labor/community data exists
    governance: { score: number, violationCount: number, auditReadiness, note: string, dataCompleteness: 'partial', conformanceRuleScopeNote? },
    overallScore: number  // mean of environmental + governance only, social excluded
  }
}
```

`POST /api/ocel/upload` now also accepts an **optional `workspace_id` form field**. When provided: validates the workspace exists, persists the full response as `json.dumps()`'d text in a new `AnalysisSnapshot` row tied to that workspace. When omitted: behaves exactly as before (pure stateless, in-memory only, nothing persisted) — **this is a hard regression gate, never break it**.

422 error: `{ "detail": { "error", "missing_fields", "detected_mapping", "available_columns" } }` — FastAPI wraps in `"detail"`.

**New multi-tenancy endpoints** (all built and verified this session):
- `GET/POST /api/organizations` — flat list / create. Response: `{id, name, created_at}`
- `GET/POST /api/organizations/{org_id}/projects` — Response: `{id, org_id, name, created_at}`
- `GET/POST /api/projects/{project_id}/workspaces` — Response: `{id, project_id, name, created_at}`
- `DELETE` for each of the above — **cascades**: deleting an org deletes its projects → their workspaces → their snapshots
- `GET /api/workspaces/{workspace_id}/latest-analysis` — returns the most recent `AnalysisSnapshot` for that workspace (deserialized via `json.loads()`), or 404 if none

`POST /api/audit-logs` and `GET /api/audit-logs` — backed by SQLite, separate from the multi-tenancy tables.

`GET /health` → `{"status": "ok"}`

`GET /api/copilot/status` → pings Ollama's `/api/tags`, returns connection health + available models.
`POST /api/copilot/query` → takes `{query, model, style, context}`, forwards to local Ollama with the **exact selected model** (verified this session — see Section 8), returns generated answer. `503` if Ollama unreachable.

---

## 6. Current State — What's Actually Done (verified, not just claimed)

### Backend — fully built and verified
- [x] `column_mapper.py` — verified, includes water/electricity/cost optional field detection
- [x] `process_mining.py` — verified
- [x] `carbon_budget.py` — verified. Known cosmetic issue (not a bug): demo CSV's monthly budget (130,000 total) is oversized vs actual emissions (~3,000 kg), so `carbonBudgetStatus` always reads "WITHIN_LIMIT". Low priority, hasn't been fixed.
- [x] `conformance.py` — **refactored this session** from one hardcoded violation scenario into a table-driven `CONFORMANCE_RULES` structure (list of `{disallowed_activities, mandated_alternative, category, reduction_factors}` entries). Legacy `VIOLATION_RULES` array still dynamically built for backward compat. Regression-verified: demo CSV still produces exactly **368 violations**, byte-for-byte unchanged behavior. Also added a `get_rule_scope_summary()` helper that surfaces the policed activity list when violations are empty (see "Honest Zero-Violation Disclosure" below).
- [x] `carbon_fitness.py` — verified. `cfsScore = (idealCarbonKg/actualCarbonKg)×100`, capped at 100, 0/0→100.
- [x] `process_optimization.py` — verified
- [x] `brsr_report.py` — fully verified, code-level
- [x] `esg_report.py` — fully verified, code-level + real-data screenshot
- [x] **`models.py`** — **NEW this session**: `Organization`, `Project`, `Workspace`, `AnalysisSnapshot` SQLAlchemy models with `cascade="all, delete-orphan"` relationships
- [x] **Multi-tenancy endpoints in `main.py`** — full CRUD, cascade delete, seed-on-startup (`Organization: "Louis India Pvt. Ltd."`, `Project: "Q3 Supply Chain Audit 2024"`, `Workspace: "proj-1"`), workspace-scoped upload/retrieval
- [x] Honest Zero-Violation Disclosure — when `detect_violations()` returns empty, `conformanceRuleScope` is added to the response (ONLY in that case, keeping the contract otherwise unchanged), surfaced on `/conformance`, `/brsr-report`, `/esg-report`, and injected into the Copilot's LLM context string

**Pytest: 36/36 passing** as of last commit (`9883cf0` → `9883cf0`-onward chain → most recent `b2e0571` + cleanup commit). Run `backend/venv/bin/pytest backend/` to reconfirm.

### Frontend — fully built and verified
- [x] `/ocel`, `/carbon-budget`, `/conformance`, `/carbon-fitness`, `/supplier-fitness`, `/process-optimization`, `/esg-report`, `/brsr-report` — all verified with real data
- [x] Export buttons (ESG + BRSR) — browser-native `window.print()` + print CSS, verified
- [x] **Always-accessible manual column mapping** — "Adjust Column Mapping" link on the success card (not just on 422 failure), pre-fills all 8 fields (including water/electricity/cost) from `analysis.columnMapping`, re-uploads same file on confirm
- [x] **Manual mapping extended to water/electricity/cost** — 3 new optional dropdown fields, `Operational Cost` StatCard added to `/ocel`, values flow into BRSR Section C resourceDraw
- [x] Conformance fallback disclosure — all 4 pages (`/conformance`, `/brsr-report`, `/esg-report`, `/copilot`) show an honest "0 violations — rules currently check for: [...]" message instead of a misleading clean 100% when the rule table finds no matches. Demo CSV (368 violations) unaffected.
- [x] Copilot — real Ollama integration, model dropdown genuinely forwards the selected model to the backend (verified via network interception: gemma3:4b and qwen2.5:1.5b both produced distinctly different request payloads AND different real latencies — 10.7s vs 3.0s — proving genuine model switching, not cosmetic)
- [x] **`lib/WorkspaceContext.tsx`** — **NEW this session**. Holds organizations/projects/workspaces lists + active IDs, persists active selection in sessionStorage, chain-fetches (org→projects→workspaces) on change, and on `activeWorkspaceId` change fetches that workspace's latest analysis and pushes it into `AnalysisContext` directly (or `null` on 404).
  - **Architecture note (important, was explicitly corrected mid-session)**: this sync logic lives in `WorkspaceContext` via a `useEffect` keyed on `activeWorkspaceId` — NOT inside `/ocel/page.tsx`. This is intentional. `/ocel/page.tsx` itself uses zero sync effects; it derives `isAnalyzed`, `displayedFileName` etc. purely from render-time comparisons against a stored "previous" value (React's official "adjust state when props change" pattern — conditionally calling `setState` during render, not in an effect). Two independent render-time guards exist in `/ocel/page.tsx`: one keyed on `activeWorkspaceId` changes (wipes local upload-staging state on workspace switch) and one keyed on `analysis` changes (populates `selectedFile` from snapshot metadata when present, but does NOT touch it when `analysis` is cleared without metadata — this was specifically traced through to confirm it doesn't wipe an in-flight upload). **Do not reintroduce a `useEffect` watching `analysis` inside `/ocel/page.tsx` — this was the original wrong approach and was deliberately corrected.**
- [x] **Topbar** — real breadcrumb (`activeOrg.name > activeProject.name > current page`) and a real workspace-switcher dropdown, replacing the old static "Louis India Pvt. Ltd. > Q3 Supply Chain Audit 2024 > proj-1" hardcoded text
- [x] **`/organizations`, `/projects`, `/workspaces`** — real CRUD pages (create/list/delete), cascade-delete confirmation dialogs warning about wiping sub-entities
- [x] **Settings → General tab, Team Access tab** — confirmed scoped for real-ification but **NOT YET DONE** (see Section 9, queued)
- [x] **Settings → Integrations tab** — **removed entirely** per explicit "no dummies" instruction (SAP/AWS connectors can't be made genuinely functional without real third-party accounts)
- [ ] **Settings → Normative Model (PNML upload)** — still cosmetic, queued (see Section 9) — intended to eventually feed into `CONFORMANCE_RULES` as user-uploaded rules, replacing the hardcoded 4-entry table
- [ ] **Landing page at `/`** — currently being built (see Section 9, this is the LIVE in-progress task)

### Known low-priority, not blocking
- `/ocel` StatCards "Process Variants" / "Avg Case Duration" intentionally show "—" (not computed)
- `EMISSION_CATEGORIES` keyword classifier has minor collisions — acceptable for hackathon scope
- `carbonBudgetLimitKg` oversized vs actual emissions in demo data (cosmetic, not a bug)

---

## 7. Canonical Demo Dataset

`trace_demo_dataset.csv` — 800 cases, ~4,232 events, columns `case_id,activity,timestamp,resource,supplier_name`. Activity mix: 65% Road Transport (compliant) / 20% Air Freight (violation) / 15% Truck Delivery (violation); 30% of cases also get a waste leg (18% Recycling compliant / 7% Incineration violation / 5% Landfill violation). Standard Order Received → Warehouse Pick & Pack → Customs Clearance → ... → Last Mile Delivery on every case. **Produces exactly 368 violations** under the conformance rule table — this is the standard regression-check number used throughout this project; if any change to `conformance.py` or the upload pipeline changes this count, that's a red flag requiring investigation before proceeding.

---

## 8. Gotchas Learned (full list, read before debugging anything)

1. FastAPI `HTTPException` wraps error body in `"detail"`
2. Next.js needs a restart after editing `.env.local`
3. Backend (`uvicorn`) and frontend (`next dev`) are separate processes, both must run — `npm run dev:all` starts both
4. Run backend with `uvicorn main:app --reload` from inside `backend/`
5. Standalone Python test scripts (`backend/test_*.py`) must run from REPO ROOT: `backend/venv/bin/python backend/test_X.py`
6. `set-state-in-effect` — fix is deriving values during render, not reordering hooks. This was a major theme this session — see Gotcha #18.
7. A parallel Claude session can introduce breaking changes silently — always re-check `git diff`/file state
8. `conformance.py` ORIGINALLY only detected violations for ONE hardcoded scenario — **this was fixed this session** via the table-driven refactor (Section 6). The honest zero-violation disclosure (also built this session) is a separate, complementary fix: even with the generalized table, an unfamiliar CSV could still find 0 matches, and the UI now discloses that instead of showing a misleading clean 100%.
9. The 422 → manual-mapping-dropdown flow on `/ocel` works as designed, and was extended this session to be always-accessible (not just on 422) and to include water/electricity/cost fields
10. "Page renders without crashing" ≠ "page is wired to real data" — always check numbers against active dataset
11. macOS Gatekeeper/Full Disk Access can fully lock out Antigravity — fix via System Settings → Privacy & Security → Full Disk Access → toggle off/on → Quit & reopen Antigravity. Resolved, was a one-time issue.
12. `trace_demo_dataset.csv` — sandbox-generated files do NOT persist into the user's real project folder, must be explicitly handed off/saved.
13. Antigravity working around a permission lockout via a scratch dir OUTSIDE the project risks the real repo file silently NOT getting the same fix — always diff/re-view the REAL repo file after a scratch-dir workaround.
14. Backend was once almost entirely untracked in git — periodically check `git status`, don't assume "tested and working" means "safe from data loss."
15. When verifying a fix that could be a no-op against already-favorable data (e.g. a re-upload test where the "after" screenshot happens to look identical to "before" for reasons unrelated to whether the fix worked), output alone can't confirm the fix landed — must check the actual diff, or re-run with a change that would VISIBLY differ if the fix is real (this exact issue came up with the "Adjust Column Mapping" re-upload test — the first attempt used Supplier, which doesn't affect OCEL page stats; the fix was to change Activity→Resource instead, which visibly changed Unique Activities from 10→5).
16. A page can make a false technical claim in its own UI copy (e.g. "Powered by Ollama (local)") while being entirely decorative underneath — worse than silent mock data, since it actively misleads. Found on `/copilot` early this session — full LLM integration was originally fake despite the label. **Fixed this session** with real Ollama integration, and the model-selection-actually-forwards-correctly claim was independently re-verified via network interception (Section 6) rather than trusted on text alone.
17. **Commit-before-review violation**: Antigravity once ran verification AND `git commit` in the same uninterrupted pass (commit `b2e0571`), without waiting for explicit chat sign-off. The actual verification results turned out to be correct on review, but the process violated the intended checkpoint. Also resulted in `trace.db` (the live runtime SQLite file) getting accidentally committed — this was cleaned up via `git rm --cached trace.db` + a confirmed `.gitignore` rule, committed separately. **Going forward: Antigravity has explicitly confirmed it will wait for an explicit "approved, commit" message in chat before running any `git commit`.** Do not let this regress; if Antigravity ever auto-commits again, flag it immediately.
18. **The `/ocel/page.tsx` render-time-reset pattern is subtle and was revised twice this session** — first version used a single `useEffect` keyed on `analysis`, which risked wiping `selectedFile` mid-upload (since `analysis` changes both when an upload succeeds AND when a workspace switch fetches a new/null snapshot — a single effect can't distinguish these). This was caught BEFORE building (correctly identified in spec review) and built correctly the first time using two independent render-time guards (keyed on `activeWorkspaceId` and `analysis` separately) rather than effects. It was traced step-by-step through multiple real transition scenarios (normal upload, workspace switch to empty, workspace switch with both guards firing in the same two-render sequence) to confirm correctness before screenshots were accepted. **If touching this file again, read this guard logic carefully before modifying — it is intentionally NOT using effects, and that absence is load-bearing, not an oversight.**

---

## 9. Active Fix Queue / Next Steps (in order)

**Just finished (this session, fully closed):**
1. Manual mapping extension to water/electricity/cost (backend + frontend) — done, committed
2. Always-accessible "Adjust Column Mapping" — done, committed
3. `conformance.py` table-driven refactor (Option B) — done, committed, 368-count regression-verified
4. Honest zero-violation disclosure (Option A) — done, committed, verified across all 4 surfaces
5. **Full real multi-tenancy** (Organizations/Projects/Workspaces, backend + frontend) — done, committed (`b2e0571`, plus the `trace.db` cleanup commit). 7-step E2E verified including a corrected cascade-deletion re-verification (direct DB row count + 404 check, not just UI list length) and Copilot model-switching forwarding re-verified via network interception.
6. Settings → Integrations tab — removed entirely per "no dummies" instruction

**LIVE / IN PROGRESS right now:**
7. **Landing page at `/`** — spec already sent to Antigravity, NOT YET BUILT/VERIFIED as of this handoff. Full spec:
   - Root `/` becomes a standalone landing page (no dashboard sidebar/topbar chrome), dashboard moves cleanly to its existing `/ocel` etc. routes (already structured this way, just confirm root is now distinct)
   - Hero section + 3 actions: "Go to Dashboard" (→ `/ocel`), "Documentation" (in-page section), "Upload CSV" (real inline upload)
   - Documentation section content must be pulled from real `PLAN.md`/`HANDOFF.md` content — NOT invented marketing copy
   - Real upload widget reusing `uploadOcelFile` from `lib/api.ts` (no forking the logic) — requires lifting `WorkspaceContext`/`AnalysisContext` providers to wrap the landing page too (currently only wraps the `(dashboard)` layout group), confirmed this doesn't break existing dashboard pages
   - On success: redirect to `/ocel` showing results. On 422/500: don't fail silently, redirect to `/ocel`'s existing error-handling flow
   - **Full spec text is in the conversation history of this session** — if picking this up fresh, the next AI should ask the user to re-paste the original landing-page prompt if needed, or reconstruct it from this summary plus the general patterns in this doc (terse prompt → Antigravity builds → screenshots demanded → explicit "approved, commit" before any commit)

**Queued after landing page closes:**
8. **Settings → General tab** — real persist/reload to SQLite (org name, country, fiscal year), scoped to the active organization
9. **Settings → Team Access tab** — real CRUD roster (invite/remove), scoped to the active organization, persisted to SQLite (no real email sending — just real roster state)
10. **Settings → Normative Model (PNML upload)** — real file upload that parses into `CONFORMANCE_RULES`, letting a user's own ruleset extend/replace the hardcoded 4-entry table. This is genuinely new conformance functionality, not just a settings tweak — do this LAST among the settings items since it has the most real scope (parsing logic, not just a CRUD form).

**Final step once all of the above closes:** tell the user the project is demo-ready, suggest one final full click-through of every page with `trace_demo_dataset.csv` as a sanity pass before submission, and stop there. Do not invent additional scope beyond what's listed above unless the user explicitly asks for it.

---

## 10. Carry-Forward Working Norms (don't relitigate, just continue)

- User wants Claude to decide, not ask — only stop for genuine architecture-level calls. Multi-tenancy WAS one of these (explicitly asked, explicitly answered "build it fully") — that decision is now locked, don't second-guess it.
- **Verify with actual pasted screenshots, not Antigravity's text summaries alone.** This caught multiple real bugs this session (stale mock data, a fully-fake LLM claim, a hardcoded constant, a missing StatCard that text claimed was working, an incomplete cascade-delete verification that only checked the UI list length instead of the actual DB row count). Don't relax this under time pressure.
- **Wait for explicit "approved, commit" before any git commit** — this is now a hard rule after one violation this session (Gotcha #17).
- Cut scope creep decisively where it doesn't serve the demo, but this session's explicit direction was the opposite for Settings/multi-tenancy specifically — the user wants those genuinely real, "no dummies." Don't reflexively cut those; the earlier "scope creep" judgment on org/project/workspace was explicitly overridden by the user later in the session.
- Keep responses terse, Hinglish-friendly, decide don't ask.
- When sending prompts to Antigravity, always include explicit test/screenshot requirements and an explicit "do not commit until Claude confirms" line.
