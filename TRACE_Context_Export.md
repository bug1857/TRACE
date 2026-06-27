# TRACE: Comprehensive Context Export (A to Z)

## 1. Product Overview
**Name:** TRACE
**Tagline:** Supply Chain Audits That Actually Compute. (OCEL 2.0 · SCOPE 3 EMISSIONS · BRSR COMPLIANCE)
**Purpose:** An enterprise-grade Process Mining and Carbon Intelligence Platform designed to automate supply chain sustainability compliance. It eliminates manual spreadsheet accounting by natively ingesting Object-Centric Event Logs (OCEL 2.0) to reconstruct supply networks in real-time.
**Target Audience:** ESG Directors, Supply Chain Managers, and Procurement Officers.
**Primary Use Case:** Upload a logistics event log (CSV) -> instantly get carbon emissions, process bottlenecks, supplier risk scores, and audit-ready BRSR compliance reports.

## 2. Technology Stack
**Frontend:**
- Framework: Next.js 16 (App Router), React 19
- Styling: Tailwind CSS v4, shadcn/ui
- Visualizations: Recharts (data charts), React Flow (process mining directed graphs)
- Languages: TypeScript (Strict mode)

**Backend:**
- Framework: FastAPI (Python 3.11)
- Data Processing: Pandas (vectorized for high performance)
- ORM: SQLAlchemy
- AI Integration: Local Ollama LLM inference (zero cloud data leakage)
- Testing: pytest (40/40 passing test suite)

**Database & Deployment:**
- Local/Dev DB: SQLite
- Production DB: PostgreSQL (hosted on Render)
- Frontend Hosting: Vercel
- Backend Hosting: Render Web Services

## 3. Architecture & Data Model (Multi-Tenancy)
TRACE uses a strict hierarchical multi-tenant architecture designed for large enterprises. All data enforces strict cascade deletes at the database level.
1. **Organization:** Top-level tenant (e.g., "Acme Corp").
2. **Project:** Sub-division or business unit (e.g., "European Logistics").
3. **Workspace:** Specific analytical environment (e.g., "Q3 2025 Audit"). Holds configurations like Conformance Rules, Emission Factors, and Team Members.
4. **AnalysisSnapshot:** Immutable record of a processed event log (contains process nodes, edges, carbon calculations, and violations).

## 4. The 8 Analytical Engines
1. **CSV Ingestion:** Accepts arbitrary schemas and OCEL 2.0 standards.
2. **Column Mapper:** Fuzzy matching to automatically identify Case ID, Activity, Timestamp, Supplier, etc.
3. **Process Mining:** Extracts Directed Follower Graphs (DFGs) and visualizes the actual vs. intended supply chain routes.
4. **Carbon Calculator:** Attributes Scope 3 emissions down to the individual event/activity level using customizable emission factors.
5. **Conformance Engine:** Checks actual paths against a strict ruleset (e.g., "Air Freight cannot follow Quality Hold"). Flags violations and calculates excess carbon (Carbon Delta).
6. **Fitness Scoring:** 
   - *Carbon Fitness Score (CFS):* Ranks the efficiency of routes and cases.
   - *Supplier Fitness:* Identifies at-risk suppliers whose average CFS drops below 90%.
7. **Forecasting Engine:** Evaluates 4 baseline models (LinearTrend, MovingAverage3, Naive, SeasonalNaive) and automatically selects the one with the lowest Mean Absolute Error (MAE) to predict next month's emissions.
8. **ESG/BRSR Reporting:** Generates regulatory compliance reports mapping OCEL data to BRSR sections (A-D). Secures reports with a tamper-evident SHA-256 hash.

## 5. Design System & Aesthetics
**Vibe:** "McKinsey meets Celonis." Premium, dense, data-forward, enterprise. Zero "startup fluff" or generic AI glowing elements.
**Themes Supported:** Light, Dark, and Green (Nature).
**Dark Theme Implementation:**
- Backgrounds: Deep Zinc/Graphite (`#0D0E12`, `#16181D`).
- Text: Off-white (`#EAEBEE`) for high readability.
- Accents: Desaturated, sophisticated functional colors (No neon). 
  - Accent: Steel Blue (`#8B9BB4`)
  - Success: Sage Green (`#6D9F71`)
  - Warning: Ochre/Gold (`#B48C5F`)
  - Danger: Dusty Rose (`#BA6A6A`)
- UI Elements: Glassmorphism (`backdrop-blur`), 3px left-border status cards, monospaced badges (`JetBrains Mono`), and `Inter` for body typography.

## 6. Core Pages / Views (14+ Live Pages)
- **`/` (Landing Page):** Cinematic hero, dynamic background, feature breakdown, documentation cards.
- **`/ocel` (Upload):** Drag-and-drop ingestion and column mapping.
- **`/executive` (Command Center):** High-level KPIs (Total Carbon, Violations, ESG Score), Supplier Risk breakdown, Top Violations table.
- **`/dashboard` (Analytics):** Deep dive charts (Emissions Trend over time, Scope breakdowns).
- **`/conformance` & `/process-optimization`:** Violation ledgers and bottleneck detection.
- **`/simulation` (What-If):** Sliders to simulate shifting freight methods and recalculating carbon.
- **`/copilot` (AI):** Natural language queries against supply chain data using local LLMs.
- **`/brsr-report` & `/esg-report`:** Exportable, audit-ready compliance matrices.

## 7. Known Demo Data Status
The primary demo dataset (`trace_demo_dataset.csv` or `trace_large_test.csv`) yields the following baseline metrics when processed:
- 800 Cases Processed
- 368 Violations Detected
- ~3,931.6 kg CO2e Attributed
- Carbon Fitness Score: ~88.4%
- Process Compliance Score: ~57.9%

## 8. Deployment Configuration
- **Vercel (Frontend):** Configured via `NEXT_PUBLIC_API_URL` pointing to the Render backend domain.
- **Render (Backend):** Configured via `.env` with `DATABASE_URL` pointing to the managed PostgreSQL instance.
- **Code State:** The local repository is fully synced with `origin/main` on GitHub as of June 2026. All local tests pass. All placeholder data has been removed in favor of real, computed data.
