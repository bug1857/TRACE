import asyncio
from playwright.async_api import async_playwright
import os

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TRACE Auditing & Forecasting Blueprint</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4;
            margin: 20mm 20mm 20mm 20mm;
        }
        body {
            font-family: 'Inter', sans-serif;
            color: #2D2C2A;
            background-color: #FAF9F6;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            -webkit-print-color-adjust: exact;
        }
        
        /* Typography */
        h1, h2, h3 {
            font-family: 'Outfit', sans-serif;
            color: #163A24;
            margin-top: 0;
        }
        
        /* Document Header */
        .doc-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid #E6E4DD;
            padding-bottom: 15px;
            margin-bottom: 35px;
        }
        .doc-title-container {
            display: flex;
            flex-direction: column;
        }
        .doc-tag {
            font-family: 'Outfit', sans-serif;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            color: #2D6A4F;
            letter-spacing: 2px;
            margin-bottom: 4px;
        }
        .doc-title {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #163A24;
            margin: 0;
            line-height: 1.1;
        }
        .doc-subtitle {
            font-size: 14px;
            color: #5C5B57;
            margin: 4px 0 0 0;
            font-weight: 400;
        }
        .doc-meta {
            text-align: right;
            font-size: 11px;
            color: #7A7874;
            font-family: 'Outfit', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.4;
        }
        
        /* Layout Elements */
        .page-container {
            page-break-after: always;
            padding-top: 5px;
        }
        .page-container:last-child {
            page-break-after: avoid;
        }
        
        .section-info {
            font-family: 'Outfit', sans-serif;
            font-size: 13px;
            color: #7A7874;
            margin-bottom: 25px;
            font-style: italic;
        }
        
        .section-headline {
            font-size: 20px;
            font-weight: 600;
            color: #163A24;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-left: 3px solid #2D6A4F;
            padding-left: 10px;
        }
        
        /* Content Card */
        .card {
            background: #FAFAF8;
            border: 1px solid #E6E4DD;
            border-radius: 6px;
            padding: 22px;
            margin-bottom: 22px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.015);
        }
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            border-bottom: 1px solid #F0EDE6;
            padding-bottom: 8px;
        }
        .card-number {
            font-family: 'Outfit', sans-serif;
            font-size: 12px;
            font-weight: 700;
            color: #FFFFFF;
            background: #2D6A4F;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
        }
        .card-title {
            font-family: 'Outfit', sans-serif;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            color: #2D6A4F;
            letter-spacing: 1px;
            margin: 0;
        }
        .card-body {
            font-size: 13px;
            color: #2D2C2A;
            margin: 0;
            text-align: justify;
            text-justify: inter-word;
            line-height: 1.6;
        }
        
        /* Page Footer styling */
        .page-footer {
            margin-top: 40px;
            border-top: 1px solid #E6E4DD;
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #7A7874;
            font-family: 'Outfit', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>

    <!-- PAGE 1: SECTION A -->
    <div class="page-container">
        <div class="doc-header">
            <div class="doc-title-container">
                <span class="doc-tag">Strategy & Compliance</span>
                <h1 class="doc-title">TRACE</h1>
                <span class="doc-subtitle">Compliance Auditing and Emissions Forecasting Framework</span>
            </div>
            <div class="doc-meta">
                Document: TRACE-V1<br>
                Scope: Product Design
            </div>
        </div>
        
        <h2 class="section-headline">Section A: Initial Idea</h2>
        <div class="section-info">
            Conceptual foundation for process level carbon governance and audit logs.
        </div>
        
        <div class="card">
            <div class="card-header">
                <div class="card-number">1</div>
                <h3 class="card-title">Problem Formulation</h3>
            </div>
            <div class="card-body">
                Supply chain teams make most of their operational decisions based on gut feel or single model forecasts that nobody really trusts. When a logistics manager wants to know how much carbon their supply chain will emit next month, the honest answer is usually that they ran it through one model and hoped for the best. The problem is not that people lack data. Most companies running ERP or warehouse management systems have years of operational event logs sitting around. The problem is that nobody has built a way to systematically compare multiple forecasting approaches against that data, figure out which one actually works for their specific supply chain, and then use that winner to drive real planning decisions around carbon budgets. This matters a lot more now than it did five years ago. SEBIs BRSR mandate requires Indian listed companies to disclose supply chain emissions. The EUs CSRD does the same for European companies. These are not voluntary reports anymore. But the emissions forecasts inside these disclosures are almost always built on a single methodology, with no validation against historical actuals, and no acknowledgment of how uncertain those predictions really are. A company could be significantly over or underreporting its projected Scope 3 footprint and have no systematic way to know. What is missing is a multi baseline benchmarking layer that sits on top of real supply chain event data, runs several forecasting approaches in parallel, validates each one against held out historical data, and picks the best performer for that specific dataset rather than assuming one method fits everyone. Without this, companies are essentially filing regulatory disclosures built on forecasts they have no way to validate.
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <div class="card-number">2</div>
                <h3 class="card-title">Proposed Solution</h3>
            </div>
            <div class="card-body">
                We built TRACE, a supply chain intelligence platform that processes object centric event logs and runs a complete analysis pipeline including a multi baseline carbon forecasting engine. The platform ingests business log files containing purchase orders, warehousing tasks, and shipment dispatches to compute exact carbon actuals for each month. The forecasting module takes these calculated actuals and benchmarks four baseline models: Naive where last month repeats, Moving Average over three months, Linear Trend, and Seasonal Naive. To evaluate these baselines, the engine automatically splits the historical carbon ledger into a training set and a three month holdout set. It runs backtesting where predictions are generated for the holdout months and compares them to actual historical figures. The system calculates the Mean Absolute Error for each model and automatically selects the baseline with the lowest error rate as the best fit model for the next month forecast. This provides logistics planners and sustainability officers with a transparent, validated carbon projection that explains exactly which methodology was used and why it won. The resulting forecast integrates directly with monthly budget goals and compliance disclosures, turning what used to be a single model guess into a defensible and benchmarked projection that teams can trust for operational planning.
            </div>
        </div>
        
        <div class="page-footer">
            <span>TRACE // Confidential Draft</span>
            <span>Page 1 of 3</span>
        </div>
    </div>

    <!-- PAGE 2: SECTION B -->
    <div class="page-container">
        <div class="doc-header">
            <div class="doc-title-container">
                <span class="doc-tag">Strategy & Compliance</span>
                <h1 class="doc-title">TRACE</h1>
                <span class="doc-subtitle">Compliance Auditing and Emissions Forecasting Framework</span>
            </div>
            <div class="doc-meta">
                Document: TRACE-V1<br>
                Scope: Product Design
            </div>
        </div>
        
        <h2 class="section-headline">Section B: Post-Feedback Idea</h2>
        <div class="section-info">
            Refinement through evaluation, addressing data availability and dynamic environments.
        </div>
        
        <div class="card">
            <div class="card-header">
                <div class="card-number">1</div>
                <h3 class="card-title">Refined Problem Formulation</h3>
            </div>
            <div class="card-body">
                After running the initial idea through AI evaluation, the core problem held up well but needed sharpening in two areas. The first gap was about who actually has this problem. The initial framing talked about companies broadly but the real pain point is mid size supply chain operators, roughly 100 to 5000 employees, who have enough operational data to make forecasting worthwhile but no dedicated data science team to actually do it. They are also the ones facing the most regulatory pressure right now since many of them are suppliers to large enterprises that are now legally required to report their full supply chain footprint. The second gap was about what forecasting actually needs to do in this context. AI feedback pushed back on treating emission forecasting as a pure statistical problem. The real challenge is that supply chain event patterns shift frequently due to seasonal demand, supplier changes, and route decisions. A model that performs well on previous data may be completely wrong for next quarter. The solution needed to account for this changing behavior rather than assuming a single model would stay valid over time. The system also needs to be easy for logistics planners to configure without needing deep statistical knowledge.
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <div class="card-number">2</div>
                <h3 class="card-title">Improved Solution</h3>
            </div>
            <div class="card-body">
                Two concrete changes came out of AI feedback. First, the forecasting module was designed from the start to run multiple baselines rather than committing to one. Each baseline is independently backtested on held out data, so the system can detect when, for example, a Seasonal Naive approach outperforms a Linear Trend on a particular dataset. This is especially important for supply chains with irregular seasonality where simple trend extrapolation falls apart. AI feedback was direct here, noting that a forecast with no validation against historical data is just a guess with extra steps. Second, the system was built to be honest about when it cannot forecast reliably. If insufficient data is available, the forecasting module flags this explicitly and returns an insufficient data note instead of producing a low confidence prediction. Early prototypes would generate a forecast anyway. AI feedback flagged this as dangerous for a regulatory disclosure context since a wrong number presented confidently is worse than no number at all. The broader influence of AI feedback was around the idea of earned credibility. Every number the platform produces needs a clear origin: where it came from, how it was validated, and what its limitations are. That principle shaped the entire design of the forecasting output, including the per baseline error reporting and the explicit best baseline selection logic.
            </div>
        </div>
        
        <div class="page-footer">
            <span>TRACE // Confidential Draft</span>
            <span>Page 2 of 3</span>
        </div>
    </div>

    <!-- PAGE 3: SECTION C -->
    <div class="page-container">
        <div class="doc-header">
            <div class="doc-title-container">
                <span class="doc-tag">Strategy & Compliance</span>
                <h1 class="doc-title">TRACE</h1>
                <span class="doc-subtitle">Compliance Auditing and Emissions Forecasting Framework</span>
            </div>
            <div class="doc-meta">
                Document: TRACE-V1<br>
                Scope: Product Design
            </div>
        </div>
        
        <h2 class="section-headline">Section C: Prototype Idea</h2>
        <div class="section-info">
            Final implementation plan, technical implementation, and expected impacts.
        </div>
        
        <div class="card">
            <div class="card-header">
                <div class="card-number">1</div>
                <h3 class="card-title">Final Problem Formulation</h3>
            </div>
            <div class="card-body">
                Mid market supply chain companies are now legally required to forecast and disclose their Scope 3 carbon emissions under frameworks including SEBI BRSR and EU CSRD. Most of them are doing this with a single forecasting method, no validation against historical data, and no systematic way to know whether their projection is actually reliable for their specific supply chain. The underlying data exists. ERP systems, warehouse platforms, and logistics software generate detailed event logs for every shipment, warehouse transfer, and transport leg. But there is no tool that connects those event level operational records to a multi baseline carbon forecasting engine that validates itself against historical actuals and selects the best approach for each dataset automatically. The result is that carbon disclosures are built on forecasts that nobody has really pressure tested. For a regulatory submission, that is a significant credibility and compliance risk. When public disclosures contain errors, organizations face potential fines, loss of investor confidence, and accusations of greenwashing. Without a tool that bridges the gap between raw logistics files and mathematical forecasting models, mid market companies will continue to rely on manual spreadsheets that are prone to calculation mistakes and lack audit trails.
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <div class="card-number">2</div>
                <h3 class="card-title">Final Proposed Solution</h3>
            </div>
            <div class="card-body">
                TRACE is a locally run supply chain audit and forecasting platform. It processes object based event log CSV files and produces a complete carbon intelligence pipeline including conformance checking, ESG scoring, BRSR report generation, and a validated multi baseline emissions forecast.<br><br>
                <strong>Technical Approach:</strong> The stack uses Next.js 16 for the frontend and FastAPI plus Python on the backend with SQLite for persistence. The forecasting module computes monthly carbon actuals from the event log, runs four baseline models, holds out the last few months of data for validation, computes Mean Absolute Error for each applicable baseline, selects the best performer automatically, and returns a next month forecast alongside error metrics. The module also handles edge cases where seasonal models require at least thirteen months of data and flags themselves as not applicable if that threshold is not met. All outputs surface directly in the dashboard alongside process mining and conformance results, giving teams a single platform for both historical audit and forward looking carbon planning.<br><br>
                <strong>Feasibility:</strong> The platform is fully built and verified against an eight hundred case, four thousand event dataset spanning exactly twelve full months. The forecasting module is fully tested including a hand verified check of error math. Forty backend tests pass successfully. The full frontend has been verified with real data across all pages. Everything runs locally with two terminal commands and zero ongoing hosting costs.<br><br>
                <strong>Expected Impact:</strong> A supply chain auditor can go from raw event log to a validated, multi baseline carbon forecast in under five minutes. The forecast is self documenting, showing which baseline won, what its error was on held out data, and what it predicts for the next period. For regulatory submissions this means a defensible, transparent carbon projection rather than a single model guess. Workspaces allow one team to manage several client engagements simultaneously. The BRSR report includes a full traceability matrix mapping every disclosed number back to the computation that produced it, making the disclosure fully auditable.
            </div>
        </div>
        
        <div class="page-footer">
            <span>TRACE // Confidential Draft</span>
            <span>Page 3 of 3</span>
        </div>
    </div>

</body>
</html>
"""

async def main():
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.set_content(html_content)
            # Ensure custom styling is fully rendered
            await page.wait_for_timeout(1000)
            
            output_pdf = "/Users/rudrapratapsingh/Desktop/TRACE/trace_emissions_forecasting_blueprint.pdf"
            await page.pdf(
                path=output_pdf,
                format="A4",
                margin={"top": "20mm", "bottom": "20mm", "left": "20mm", "right": "20mm"},
                display_header_footer=False,
                print_background=True
            )
            await browser.close()
        print(f"SUCCESS: {output_pdf}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(main())
