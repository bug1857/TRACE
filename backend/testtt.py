from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

doc = SimpleDocTemplate(
    "/mnt/user-data/outputs/TRACE_Hackathon_Round1_Submission.pdf",
    pagesize=A4,
    rightMargin=2.5*cm,
    leftMargin=2.5*cm,
    topMargin=2.5*cm,
    bottomMargin=2.5*cm,
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Title'],
    fontSize=18,
    textColor=colors.HexColor('#1A1917'),
    spaceAfter=6,
    fontName='Helvetica-Bold',
    alignment=TA_CENTER,
)

subtitle_style = ParagraphStyle(
    'Subtitle',
    parent=styles['Normal'],
    fontSize=11,
    textColor=colors.HexColor('#4A4A4A'),
    spaceAfter=4,
    fontName='Helvetica',
    alignment=TA_CENTER,
)

section_header_style = ParagraphStyle(
    'SectionHeader',
    parent=styles['Heading1'],
    fontSize=13,
    textColor=colors.HexColor('#1A1917'),
    spaceBefore=18,
    spaceAfter=8,
    fontName='Helvetica-Bold',
    borderPad=4,
)

sub_header_style = ParagraphStyle(
    'SubHeader',
    parent=styles['Heading2'],
    fontSize=11,
    textColor=colors.HexColor('#2D6A4F'),
    spaceBefore=12,
    spaceAfter=6,
    fontName='Helvetica-Bold',
)

body_style = ParagraphStyle(
    'CustomBody',
    parent=styles['Normal'],
    fontSize=10,
    textColor=colors.HexColor('#2C2C2C'),
    spaceAfter=8,
    fontName='Helvetica',
    leading=16,
)

meta_style = ParagraphStyle(
    'Meta',
    parent=styles['Normal'],
    fontSize=9,
    textColor=colors.HexColor('#6B6963'),
    spaceAfter=4,
    fontName='Helvetica',
    alignment=TA_CENTER,
)

story = []

# Title block
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("TRACE", title_style))
story.append(Paragraph("Supply Chain Carbon Audit and Forecasting Platform", subtitle_style))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Hackathon Round 1 Text Submission", meta_style))
story.append(Paragraph("Problem Statement 1: Multi-Baseline Benchmarking Framework for Supply Chain Forecasting", meta_style))
story.append(Spacer(1, 0.3*cm))
story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2D6A4F')))
story.append(Spacer(1, 0.4*cm))

# ─── SECTION A ───
story.append(Paragraph("Section A: Initial Idea", section_header_style))
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E0D8')))
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Problem Formulation", sub_header_style))
story.append(Paragraph(
    "Supply chain teams make most of their operational decisions based on gut feel or single model forecasts "
    "that nobody really trusts. When a logistics manager wants to know how much carbon their supply chain will "
    "emit next month, the honest answer is usually that they ran it through one model and hoped for the best. "
    "The problem is not that people lack data. Most companies running ERP or warehouse management systems have "
    "years of operational event logs sitting around. The problem is that nobody has built a way to systematically "
    "compare multiple forecasting approaches against that data, figure out which one actually works for their "
    "specific supply chain, and then use that winner to drive real planning decisions around carbon budgets.",
    body_style
))
story.append(Paragraph(
    "This matters a lot more now than it did five years ago. SEBIs BRSR mandate requires Indian listed companies "
    "to disclose supply chain emissions. The EUs CSRD does the same for European companies. These are not voluntary "
    "reports anymore. But the emissions forecasts inside these disclosures are almost always built on a single "
    "methodology, with no validation against historical actuals, and no acknowledgment of how uncertain those "
    "predictions really are. A company could be significantly over or underreporting its projected Scope 3 footprint "
    "and have no systematic way to know.",
    body_style
))
story.append(Paragraph(
    "What is missing is a multi baseline benchmarking layer that sits on top of real supply chain event data, runs "
    "several forecasting approaches in parallel, validates each one against held out historical data, and picks the "
    "best performer for that specific dataset rather than assuming one method fits everyone. Without this, companies "
    "are essentially filing regulatory disclosures built on forecasts they have no way to validate.",
    body_style
))

story.append(Paragraph("Proposed Solution", sub_header_style))
story.append(Paragraph(
    "We built TRACE, a supply chain intelligence platform that processes object centric event logs and runs a "
    "complete analysis pipeline including a multi baseline carbon forecasting engine. The platform ingests business "
    "log files containing purchase orders, warehousing tasks, and shipment dispatches to compute exact carbon "
    "actuals for each month. The forecasting module takes these calculated actuals and benchmarks four baseline "
    "models: Naive where last month repeats, Moving Average over three months, Linear Trend, and Seasonal Naive.",
    body_style
))
story.append(Paragraph(
    "To evaluate these baselines, the engine automatically splits the historical carbon ledger into a training set "
    "and a three month holdout set. It runs backtesting where predictions are generated for the holdout months and "
    "compares them to actual historical figures. The system calculates the Mean Absolute Error for each model and "
    "automatically selects the baseline with the lowest error rate as the best fit model for the next month forecast.",
    body_style
))
story.append(Paragraph(
    "This provides logistics planners and sustainability officers with a transparent, validated carbon projection "
    "that explains exactly which methodology was used and why it won. The resulting forecast integrates directly "
    "with monthly budget goals and compliance disclosures, turning what used to be a single model guess into a "
    "defensible and benchmarked projection that teams can trust for operational planning.",
    body_style
))

# ─── SECTION B ───
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Section B: Post-Feedback Idea", section_header_style))
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E0D8')))
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Refined Problem Formulation", sub_header_style))
story.append(Paragraph(
    "After running the initial idea through AI evaluation, the core problem held up well but needed sharpening "
    "in two areas. The first gap was about who actually has this problem. The initial framing talked about companies "
    "broadly but the real pain point is mid size supply chain operators, roughly 100 to 5000 employees, who have "
    "enough operational data to make forecasting worthwhile but no dedicated data science team to actually do it. "
    "They are also the ones facing the most regulatory pressure right now since many of them are suppliers to large "
    "enterprises that are now legally required to report their full supply chain footprint.",
    body_style
))
story.append(Paragraph(
    "The second gap was about what forecasting actually needs to do in this context. AI feedback pushed back on "
    "treating emission forecasting as a pure statistical problem. The real challenge is that supply chain event "
    "patterns shift frequently due to seasonal demand, supplier changes, and route decisions. A model that performs "
    "well on previous data may be completely wrong for next quarter. The solution needed to account for this changing "
    "behavior rather than assuming a single model would stay valid over time. The system also needs to be easy for "
    "logistics planners to configure without needing deep statistical knowledge.",
    body_style
))

story.append(Paragraph("Improved Solution", sub_header_style))
story.append(Paragraph(
    "Two concrete changes came out of AI feedback. First, the forecasting module was designed from the start to run "
    "multiple baselines rather than committing to one. Each baseline is independently backtested on held out data, "
    "so the system can detect when, for example, a Seasonal Naive approach outperforms a Linear Trend on a particular "
    "dataset. This is especially important for supply chains with irregular seasonality where simple trend extrapolation "
    "falls apart. AI feedback was direct here, noting that a forecast with no validation against historical data is "
    "just a guess with extra steps.",
    body_style
))
story.append(Paragraph(
    "Second, the system was built to be honest about when it cannot forecast reliably. If insufficient data is "
    "available, the forecasting module flags this explicitly and returns an insufficient data note instead of "
    "producing a low confidence prediction. Early prototypes would generate a forecast anyway. AI feedback flagged "
    "this as dangerous for a regulatory disclosure context since a wrong number presented confidently is worse "
    "than no number at all.",
    body_style
))
story.append(Paragraph(
    "The broader influence of AI feedback was around the idea of earned credibility. Every number the platform "
    "produces needs a clear origin: where it came from, how it was validated, and what its limitations are. That "
    "principle shaped the entire design of the forecasting output, including the per baseline error reporting and "
    "the explicit best baseline selection logic.",
    body_style
))

# ─── SECTION C ───
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Section C: Prototype Idea", section_header_style))
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E0D8')))
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Final Problem Formulation", sub_header_style))
story.append(Paragraph(
    "Mid market supply chain companies are now legally required to forecast and disclose their Scope 3 carbon "
    "emissions under frameworks including SEBI BRSR and EU CSRD. Most of them are doing this with a single "
    "forecasting method, no validation against historical data, and no systematic way to know whether their "
    "projection is actually reliable for their specific supply chain.",
    body_style
))
story.append(Paragraph(
    "The underlying data exists. ERP systems, warehouse platforms, and logistics software generate detailed event "
    "logs for every shipment, warehouse transfer, and transport leg. But there is no tool that connects those event "
    "level operational records to a multi baseline carbon forecasting engine that validates itself against historical "
    "actuals and selects the best approach for each dataset automatically.",
    body_style
))
story.append(Paragraph(
    "The result is that carbon disclosures are built on forecasts that nobody has really pressure tested. For a "
    "regulatory submission, that is a significant credibility and compliance risk. When public disclosures contain "
    "errors, organizations face potential fines, loss of investor confidence, and accusations of greenwashing. "
    "Without a tool that bridges the gap between raw logistics files and mathematical forecasting models, mid market "
    "companies will continue to rely on manual spreadsheets that are prone to calculation mistakes and lack audit trails.",
    body_style
))

story.append(Paragraph("Final Proposed Solution", sub_header_style))
story.append(Paragraph(
    "TRACE is a locally run supply chain audit and forecasting platform. It processes object based event log CSV "
    "files and produces a complete carbon intelligence pipeline including conformance checking, ESG scoring, BRSR "
    "report generation, and a validated multi baseline emissions forecast.",
    body_style
))
story.append(Paragraph(
    "<b>Technical Approach:</b> The stack uses Next.js 16 for the frontend and FastAPI plus Python on the backend "
    "with SQLite for persistence. The forecasting module computes monthly carbon actuals from the event log, runs "
    "four baseline models, holds out the last few months of data for validation, computes Mean Absolute Error for "
    "each applicable baseline, selects the best performer automatically, and returns a next month forecast alongside "
    "error metrics. The module also handles edge cases where seasonal models require at least thirteen months of data "
    "and flags themselves as not applicable if that threshold is not met. All outputs surface directly in the dashboard "
    "alongside process mining and conformance results, giving teams a single platform for both historical audit and "
    "forward looking carbon planning.",
    body_style
))
story.append(Paragraph(
    "<b>Feasibility:</b> The platform is fully built and verified against an eight hundred case, four thousand event "
    "dataset spanning exactly twelve full months. The forecasting module is fully tested including a hand verified "
    "check of error math. Forty backend tests pass successfully. The full frontend has been verified with real data "
    "across all pages. Everything runs locally with two terminal commands and zero ongoing hosting costs.",
    body_style
))
story.append(Paragraph(
    "<b>Expected Impact:</b> A supply chain auditor can go from raw event log to a validated, multi baseline carbon "
    "forecast in under five minutes. The forecast is self documenting, showing which baseline won, what its error "
    "was on held out data, and what it predicts for the next period. For regulatory submissions this means a "
    "defensible, transparent carbon projection rather than a single model guess. Workspaces allow one team to manage "
    "several client engagements simultaneously. The BRSR report includes a full traceability matrix mapping every "
    "disclosed number back to the computation that produced it, making the disclosure fully auditable.",
    body_style
))

story.append(Spacer(1, 0.5*cm))
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E0D8')))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("TRACE Platform  |  bug1857/TRACE  |  Round 1 Submission", meta_style))

doc.build(story)
print("PDF generated successfully.")