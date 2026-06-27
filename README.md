# TRACE — Carbon Intelligence Platform

**Process Mining × Carbon Accounting for Enterprise Supply Chains**

TRACE is an enterprise-grade platform that reconstructs supply chain operations from Object-Centric Event Logs (OCEL) and computes precise Scope 3 carbon emissions in real-time. Built under the **Indo-Swiss Joint Research Programme** at Manipal University Jaipur.

> We don't estimate. We compute.

---

## 🔬 What It Does

| Module | Description |
|--------|-------------|
| **OCEL Upload Engine** | Drag-and-drop CSV ingestion with intelligent column mapping and fuzzy schema detection |
| **Executive Command Center** | Real-time KPIs — total emissions, process violations, Carbon Fitness Score |
| **Process Mining Graph** | Directed graph visualization of actual vs. intended freight routes with Carbon Delta annotations |
| **Supplier Fitness** | Per-vendor carbon efficiency scoring and risk flagging |
| **Carbon Budget Tracker** | Set and monitor emission limits across operational scopes |
| **Conformance Ledger** | Immutable, timestamped audit log of every process violation |
| **Forecasting Engine** | Predictive emissions modeling using ARIMA and linear trend analysis |
| **What-If Simulator** | Run modal shift scenarios (Air → Ocean) with sub-100ms recalculation |
| **AI Copilot** | Natural language querying over supply chain data using privacy-preserving local LLMs |
| **BRSR Report Generator** | One-click, audit-ready BRSR compliance reports with SHA-256 cryptographic sealing |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS, Recharts, React Flow |
| Backend | Python, FastAPI, SQLite |
| AI | Local LLM integration via privacy-preserving inference |
| Design | Dark glassmorphism UI with light/dark theme support |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### 1. Clone the repo
```bash
git clone https://github.com/bug1857/TRACE.git
cd TRACE
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 4. Run everything
```bash
npm run dev:all
```

This starts both the Next.js frontend on `http://localhost:3000` and the FastAPI backend on `http://localhost:8000`.

### 5. Upload the demo dataset
Open the app, navigate to the Upload page, and drag in `trace_demo_dataset.csv`.

---

## 📂 Project Structure

```
TRACE/
├── app/                  # Next.js pages and routes
├── backend/              # FastAPI server, carbon computation engine
├── components/           # Reusable React UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and helpers
├── public/               # Static assets
├── trace_demo_dataset.csv # Sample logistics event log (800 cases)
├── package.json
└── README.md
```

---

## 📊 Demo Dataset

The included `trace_demo_dataset.csv` contains **800 logistics cases** with columns for Case ID, Activity, Timestamp, Supplier, Transport Mode, and more. Upload it to instantly populate all dashboards and reports.

---

## 🏛️ Research Context

TRACE was developed as part of the **Indo-Swiss Joint Research Programme** investigating the application of process mining techniques to environmental sustainability in global supply chains. The platform bridges the gap between operational process data and regulatory carbon reporting frameworks (BRSR, CSRD).

---

## 📜 License

This project is part of an academic research initiative at Manipal University Jaipur.

---

**Built with 🌍 by the TRACE Team**
