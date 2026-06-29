<div class="cover">
  <div class="cover-uni">MANIPAL UNIVERSITY JAIPUR</div>
  <div class="cover-prog">Indo-Swiss Joint Research Programme — MJRP Round 2</div>
  <div class="cover-spacer"></div>
  <div class="cover-logo">[ TRACE ]</div>
  <div class="cover-platform">Enterprise Process Mining &amp; Carbon Intelligence Platform</div>
  <div class="cover-spacer-sm"></div>
  <div class="cover-by">Submitted by:</div>
  <div class="cover-names">
    <div>Rudra Pratap Singh</div>
    <div>Divayom Sengar</div>
    <div>Swastik Anurag Vyas</div>
  </div>
  <div class="cover-dept">B.Tech Information Technology | 3rd Year</div>
  <div class="cover-event">Hackathon: HackCulture | June 2026</div>
</div>

## Executive Summary

TRACE is a next-generation enterprise platform that unifies Object-Centric Event Log (OCEL 2.0) process mining with real-time carbon footprint intelligence. Built for the Indo-Swiss Joint Research Programme (MJRP Round 2) at Manipal University Jaipur, TRACE enables organizations to discover, monitor, and optimize their supply chain and logistics processes — not just for operational efficiency, but for measurable environmental compliance and ESG reporting.

Unlike traditional process mining tools that operate on flat, single-case event logs, TRACE natively handles multi-object process data — enabling analysis of how multiple entities (orders, shipments, trucks, suppliers) interact across a single process simultaneously.

**Key Differentiators:**

- First open-source platform combining OCEL 2.0 conformance checking with carbon budget fitness scoring
- Novel dual-objective conformance engine: Sequence Fitness + Carbon Fitness Score (CFS)
- Explicit academic differentiation from Celonis and RWTH Aachen's OCEAn (2025)
- End-to-end: event log ingestion → violation detection → ESG report generation → LLM copilot insights

---

## Problem Statement

### 2.1 The Process Mining Gap

Traditional process mining tools like Celonis analyze business processes using flat XES logs — one case, one object. In reality, modern supply chains are multi-object: a single shipment involves orders, drivers, warehouses, and suppliers — all interacting simultaneously. Existing tools cannot model this complexity.

### 2.2 The Carbon Accountability Gap

Enterprises face increasing regulatory and ESG pressure to track and report Scope 1, 2, and 3 emissions across their operations. However, no existing process mining platform natively integrates carbon footprint analysis into its conformance checking engine. Carbon data exists in silos — disconnected from process execution data.

### 2.3 The Reporting Gap

ESG reports (like India's BRSR framework) require structured, auditable data on emissions, resource consumption, and process deviations. Today, this is done manually — error-prone, time-consuming, and not linked to actual process behavior.

> **TRACE solves all three.**

---

## Solution Overview

### 3.1 Platform Architecture

TRACE is a full-stack web platform with three integrated layers:

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16, TailwindCSS | Dashboard, ESG Reports, Copilot UI |
| Backend | FastAPI (Python) | Process mining engine, API routes |
| Intelligence | pm4py, Ollama LLM | OCEL parsing, conformance, AI insights |
| Database | PostgreSQL | Event log storage, audit trails |

### 3.2 Core Engine: Dual-Objective Conformance Checking

TRACE introduces a novel conformance checking methodology that evaluates process executions against two independent objectives simultaneously.

**Objective 1 — Sequence Fitness:** Measures how closely the actual execution trace follows the normative process model (BPMN/Petri Net). Score range: 0.0–1.0.

**Objective 2 — Carbon Fitness Score (CFS):** Measures how well the process execution stays within its allocated carbon budget. Computed as:

```
CFS = 1 - (actual_emissions / carbon_budget_threshold)
Clamped to [0.0, 1.0]
```

**Combined Compliance Score:**

```
Compliance = α × Sequence_Fitness + (1−α) × CFS
Default: α = 0.6
```

### 3.3 OCEL 2.0 Support

TRACE natively ingests OCEL 2.0 format event logs — the latest standard from IEEE for object-centric process mining. This allows simultaneous tracking of multiple object types (orders, shipments, vehicles, suppliers) within a single unified event log.

---

## Key Features

### 4.1 Process Discovery & Visualization

- Automatic discovery of process variants from uploaded event logs
- Object-centric directly-follows graph (OC-DFG) generation
- Variant clustering using K-Means (grouping similar execution patterns)
- Interactive process flow visualization on the dashboard

### 4.2 Carbon Intelligence Engine

- Per-activity emission factor mapping (configurable by transport mode, supplier, region)
- Automatic Scope 1 / Scope 2 / Scope 3 emissions categorization
- Carbon budget threshold configuration per process type
- Real-time violation flagging when carbon budgets are breached

### 4.3 ESG Reporting Module

- Automated BRSR (Business Responsibility and Sustainability Report) generation
- PDF export with branded report layout
- Metrics: total emissions, emission intensity, compliance rate, hotspot identification
- Historical trend comparison across reporting periods

### 4.4 AI Copilot (Ollama LLM)

- Local LLM integration via Ollama — no cloud API dependency, fully privacy-preserving
- Natural language querying of process mining results
- Automated root cause analysis for violations
- Recommendation generation for process optimization and emission reduction

### 4.5 Violation Management

- Complete violation log with case ID, activity, violation type, and severity
- Separate tabs for Sequence Violations vs Carbon Violations
- Exportable violation reports for audit trails

---

## Research Contribution & Novelty

### 5.1 Academic Positioning

TRACE builds on and explicitly extends the state-of-the-art:

| Dimension | Celonis | RWTH OCEAn (2025) | **TRACE** |
|---|---|---|---|
| Log Format | XES (flat) | OCEL 2.0 | **OCEL 2.0** |
| Carbon Analysis | None | None | **Native CFS engine** |
| Dual-objective conformance | No | No | **Yes** |
| LLM Copilot | Paid add-on | No | **Local Ollama** |
| ESG/BRSR Reports | No | No | **Automated** |
| Open Source | No | Research only | **Yes** |

### 5.2 Novel Contributions

**1. Carbon Fitness Score (CFS):** First formalized metric combining process conformance with carbon budget adherence in a single unified score.

**2. Dual-Objective Conformance Engine:** Extension of classical fitness metrics to include environmental objectives — enabling truly sustainable process mining.

**3. OCEL 2.0 + Carbon Integration:** First platform to natively bridge the OCEL 2.0 standard with per-activity carbon emission modeling.

**4. Local LLM Copilot for Process Intelligence:** Privacy-preserving AI layer that operates entirely on-premises via Ollama, making it deployable in enterprise environments with data sovereignty requirements.

---

## Technology Stack

| Component | Technology |
|---|---|
| Frontend Framework | Next.js 16 (React) |
| Styling | TailwindCSS |
| Backend Framework | FastAPI (Python 3.11) |
| Process Mining Engine | pm4py (OCEL 2.0) |
| Database | PostgreSQL |
| LLM Runtime | Ollama (local) |
| PDF Generation | WeasyPrint / ReportLab |
| Charting | Recharts |
| Deployment | Docker Compose |
| Version Control | Git / GitHub |

---

## System Workflow

**Step 1 — Data Ingestion**
Users upload OCEL 2.0 compliant CSV/JSON event logs. The backend parses object types, activities, timestamps, and resource attributes.

**Step 2 — Process Discovery**
pm4py discovers the process model (directly-follows graph) and identifies process variants. K-Means clustering groups similar variants for pattern analysis.

**Step 3 — Conformance Checking**
The dual-objective engine computes Sequence Fitness against the normative model and Carbon Fitness Score against configured carbon budgets. Violations are logged with case ID, severity, and type.

**Step 4 — ESG Intelligence**
Emissions are aggregated by Scope 1/2/3, mapped to organizational units, and structured into BRSR-compliant report format.

**Step 5 — AI Copilot Analysis**
The Ollama LLM receives summarized process metrics and generates natural language insights, root cause hypotheses, and optimization recommendations.

**Step 6 — Report Export**
Users export PDF reports (ESG summary, BRSR annex, violation audit log) for submission to regulators, auditors, or internal stakeholders.

---

## Impact & Applications

**Target Industries:**

- Logistics & Supply Chain (Scope 3 emissions from freight)
- Manufacturing (production process carbon tracking)
- Healthcare (supply chain compliance + sustainability)
- Financial Services (ESG reporting for portfolio companies)

**Regulatory Alignment:**

- India BRSR (Business Responsibility and Sustainability Reporting) — SEBI mandated for top 1000 listed companies
- EU CSRD (Corporate Sustainability Reporting Directive)
- ISO 14064 (Greenhouse Gas Quantification)

**Estimated Impact at Scale:**

- 40–60% reduction in time spent on ESG report preparation
- Real-time carbon violation alerts (vs quarterly manual audits)
- Enables data-driven process redesign for net-zero targets

---

## Team

| | Rudra Pratap Singh | Divayom Sengar | Swastik Anurag Vyas |
|---|---|---|---|
| **Role** | Full-Stack Development, Process Mining Engine, Carbon Intelligence, LLM Integration, ESG Reports | Frontend Architecture, UI/UX Design, Dashboard, Data Visualization | Backend Development, Database Design, API Engineering, Conformance Engine |
| **Programme** | B.Tech IT, 3rd Year | B.Tech IT, 3rd Year | B.Tech IT, 3rd Year |
| **Institution** | Manipal University Jaipur | Manipal University Jaipur | Manipal University Jaipur |

---

## Conclusion

TRACE represents a significant step forward in making process mining practically useful for sustainability — bridging the gap between operational process intelligence and environmental accountability. By combining OCEL 2.0's expressive power with a novel dual-objective conformance engine and automated ESG reporting, TRACE delivers a platform that is simultaneously academically rigorous and enterprise-ready.

The platform is designed for real-world deployment: it runs locally (no cloud dependency), supports privacy-preserving LLM inference, and generates audit-ready ESG reports aligned with India's BRSR mandate.

We believe TRACE has the potential to be the open-source foundation for sustainable process mining research globally.

<div class="report-footer">TRACE | HackCulture 2026 | Manipal University Jaipur</div>
