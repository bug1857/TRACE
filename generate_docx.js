/**
 * TRACE — Enterprise Process Mining & Carbon Intelligence Platform
 * Professional Hackathon Jury Report Generator
 * Uses: docx v9.x
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, PageBreak, SectionType,
  WidthType, BorderStyle, ShadingType, TableLayoutType,
  Footer, TabStopType, TabStopPosition,
  LevelFormat, convertInchesToTwip,
  PageNumberElement, VerticalAlign,
  Header,
} = require('docx');
const fs = require('fs');

// ── Color Palette ──────────────────────────────────────────────
const NAVY    = '1a1a2e';
const TEAL    = '00D4AA';
const BODY    = '222222';
const GRAY    = '555555';
const WHITE   = 'FFFFFF';
const TEAL_BG = 'f0fdfa';

// ── Unit helpers ───────────────────────────────────────────────
const pt  = n => n * 20;           // half-points (docx size unit)
const dxa = n => n;                // DXA passthrough for clarity

// ── Text Run factory ───────────────────────────────────────────
function txt(text, opts = {}) {
  return new TextRun({ text, font: 'Calibri', size: pt(11), color: BODY, ...opts });
}

// ── Paragraph helpers ──────────────────────────────────────────
function gap(after = 120) {
  return new Paragraph({ children: [], spacing: { after: dxa(after) } });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [txt(text, { color: BODY, ...opts })],
    spacing: { after: dxa(120), line: 276, lineRule: 'auto' },
  });
}

function bodyPara(runs, opts = {}) {
  return new Paragraph({
    children: runs,
    spacing: { after: dxa(120), line: 276, lineRule: 'auto' },
    ...opts,
  });
}

function bullet(text) {
  return new Paragraph({
    children: [txt(text, { color: BODY })],
    numbering: { reference: 'bullet-list', level: 0 },
    spacing: { after: dxa(80) },
    keepLines: true,
  });
}

// ── Heading helpers ────────────────────────────────────────────
// Heading 1: Page break before (except first), navy, bottom border teal
function heading1(text, withBreak = true) {
  return new Paragraph({
    children: [
      ...(withBreak ? [new PageBreak()] : []),
      txt(text, { bold: true, size: pt(18), color: NAVY }),
    ],
    spacing: { before: dxa(0), after: dxa(180) },
    keepNext: true,
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: TEAL, space: 4 },
    },
  });
}

// Heading 2: teal, no page break
function heading2(text) {
  return new Paragraph({
    children: [txt(text, { bold: true, size: pt(14), color: TEAL })],
    spacing: { before: dxa(240), after: dxa(120) },
    keepNext: true,
  });
}

// ── Cover page paragraph helper ────────────────────────────────
function coverPara(runs, after = 120) {
  return new Paragraph({
    children: runs,
    alignment: AlignmentType.CENTER,
    spacing: { after: dxa(after) },
  });
}

// ── Table cell helpers ─────────────────────────────────────────
// Header cell: navy background, white bold text
function hCell(text, w) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [txt(text, { bold: true, color: WHITE, size: pt(10) })],
        spacing: { after: 0 },
        alignment: AlignmentType.LEFT,
      }),
    ],
    shading: { type: ShadingType.SOLID, fill: NAVY, color: NAVY },
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });
}

// Data cell: optional alternating row teal background
function dCell(text, w, shade = false) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [txt(text, { size: pt(10), color: BODY })],
        spacing: { after: 0 },
      }),
    ],
    shading: shade
      ? { type: ShadingType.CLEAR, fill: TEAL_BG, color: 'auto' }
      : { type: ShadingType.CLEAR, fill: 'FFFFFF', color: 'auto' },
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });
}

// ── Generic table builder ──────────────────────────────────────
function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    rows: [
      new TableRow({
        children: headers.map((h, i) => hCell(h, colWidths[i])),
        tableHeader: true,
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((c, ci) => dCell(c, colWidths[ci], ri % 2 === 1)),
        })
      ),
    ],
    width: { size: total, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    margins: { top: 0, bottom: 0 },
  });
}

// ── Monospace/formula paragraph ────────────────────────────────
function formula(text) {
  return new Paragraph({
    children: [
      txt(text, { size: pt(10), color: NAVY, bold: true, font: 'Courier New' }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: dxa(80), after: dxa(140) },
  });
}

// ── Footer (all pages except cover) ───────────────────────────
const pageFooter = new Footer({
  children: [
    new Paragraph({
      children: [
        txt('TRACE | Enterprise Process Mining & Carbon Intelligence Platform', {
          size: pt(8),
          color: GRAY,
        }),
        new TextRun({ text: '\t', size: pt(8) }),
        txt('Page ', { size: pt(8), color: GRAY }),
        new PageNumberElement(),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { after: 0 },
    }),
  ],
});

// ═══════════════════════════════════════════════════════════════
// COVER PAGE CONTENT
// ═══════════════════════════════════════════════════════════════
const cover = [
  // University name
  coverPara(
    [txt('MANIPAL UNIVERSITY JAIPUR', { bold: true, size: pt(14), color: NAVY })],
    60
  ),
  // Programme subtitle
  coverPara(
    [txt('Indo-Swiss Joint Research Programme — MJRP Round 2', {
      size: pt(12),
      color: GRAY,
    })],
    600  // large gap before logo
  ),
  // TRACE logo text
  coverPara(
    [txt('[ TRACE ]', { bold: true, size: pt(48), color: TEAL })],
    60
  ),
  // Platform subtitle
  coverPara(
    [txt('Enterprise Process Mining & Carbon Intelligence Platform', {
      size: pt(16),
      color: NAVY,
    })],
    400
  ),
  // Submitted by label
  coverPara(
    [txt('Submitted by:', { size: pt(11), color: GRAY })],
    80
  ),
  // Team member 1
  coverPara(
    [txt('Rudra Pratap Singh', { bold: true, size: pt(12), color: NAVY })],
    40
  ),
  // Team member 2
  coverPara(
    [txt('Divayom Sengar', { bold: true, size: pt(12), color: NAVY })],
    40
  ),
  // Team member 3
  coverPara(
    [txt('Swastik Anurag Vyas', { bold: true, size: pt(12), color: NAVY })],
    120
  ),
  // Degree info
  coverPara(
    [txt('B.Tech Information Technology | 3rd Year', { size: pt(11), color: GRAY })],
    80
  ),
  // Event info
  coverPara(
    [txt('Hackathon: HackCulture | June 2026', { size: pt(10), color: GRAY })],
    0
  ),
];

// ═══════════════════════════════════════════════════════════════
// SECTION 1 — EXECUTIVE SUMMARY
// ═══════════════════════════════════════════════════════════════
const s1 = [
  heading1('Executive Summary', false), // first section, no page break

  body(
    'TRACE is a next-generation enterprise platform that unifies Object-Centric Event Log ' +
    '(OCEL 2.0) process mining with real-time carbon footprint intelligence. Built for the ' +
    'Indo-Swiss Joint Research Programme (MJRP Round 2) at Manipal University Jaipur, ' +
    'TRACE enables organizations to discover, monitor, and optimize their supply chain and ' +
    'logistics processes — not just for operational efficiency, but for measurable ' +
    'environmental compliance and ESG reporting.'
  ),

  body(
    'Unlike traditional process mining tools that operate on flat, single-case event logs, ' +
    'TRACE natively handles multi-object process data — enabling analysis of how multiple ' +
    'entities (orders, shipments, trucks, suppliers) interact across a single process simultaneously.'
  ),

  heading2('Key Differentiators'),
  bullet('First open-source platform combining OCEL 2.0 conformance checking with carbon budget fitness scoring'),
  bullet('Novel dual-objective conformance engine: Sequence Fitness + Carbon Fitness Score (CFS)'),
  bullet("Explicit academic differentiation from Celonis and RWTH Aachen's OCEAn (2025)"),
  bullet('End-to-end: event log ingestion \u2192 violation detection \u2192 ESG report generation \u2192 LLM copilot insights'),
  gap(160),
];

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — PROBLEM STATEMENT
// ═══════════════════════════════════════════════════════════════
const s2 = [
  heading1('Problem Statement'),

  heading2('2.1 The Process Mining Gap'),
  body(
    'Traditional process mining tools like Celonis analyze business processes using flat XES ' +
    'logs — one case, one object. In reality, modern supply chains are multi-object: a single ' +
    'shipment involves orders, drivers, warehouses, and suppliers — all interacting ' +
    'simultaneously. Existing tools cannot model this complexity.'
  ),

  heading2('2.2 The Carbon Accountability Gap'),
  body(
    'Enterprises face increasing regulatory and ESG pressure to track and report Scope 1, 2, ' +
    'and 3 emissions across their operations. However, no existing process mining platform ' +
    'natively integrates carbon footprint analysis into its conformance checking engine. Carbon ' +
    'data exists in silos — disconnected from process execution data.'
  ),

  heading2('2.3 The Reporting Gap'),
  body(
    "ESG reports (like India's BRSR framework) require structured, auditable data on emissions, " +
    'resource consumption, and process deviations. Today, this is done manually — error-prone, ' +
    'time-consuming, and not linked to actual process behavior.'
  ),

  bodyPara([txt('TRACE solves all three.', { bold: true, color: NAVY, size: pt(12) })]),
  gap(160),
];

// ═══════════════════════════════════════════════════════════════
// SECTION 3 — SOLUTION OVERVIEW
// ═══════════════════════════════════════════════════════════════
const s3 = [
  heading1('Solution Overview'),

  heading2('3.1 Platform Architecture'),
  body('TRACE is a full-stack web platform with three integrated layers:'),

  makeTable(
    ['Layer', 'Technology', 'Purpose'],
    [
      ['Frontend',     'Next.js 16, TailwindCSS', 'Dashboard, ESG Reports, Copilot UI'],
      ['Backend',      'FastAPI (Python)',         'Process mining engine, API routes'],
      ['Intelligence', 'pm4py, Ollama LLM',        'OCEL parsing, conformance, AI insights'],
      ['Database',     'PostgreSQL',               'Event log storage, audit trails'],
    ],
    [1700, 2300, 3700]
  ),

  gap(160),

  heading2('3.2 Core Engine: Dual-Objective Conformance Checking'),
  body(
    'TRACE introduces a novel conformance checking methodology that evaluates process executions ' +
    'against two independent objectives simultaneously:'
  ),

  bodyPara([
    txt('Objective 1 — Sequence Fitness: ', { bold: true, color: NAVY }),
    txt(
      'Measures how closely the actual execution trace follows the normative process model ' +
      '(BPMN/Petri Net). Score range: 0.0\u20131.0.',
      { color: BODY }
    ),
  ]),

  bodyPara([
    txt('Objective 2 — Carbon Fitness Score (CFS): ', { bold: true, color: NAVY }),
    txt(
      'Measures how well the process execution stays within its allocated carbon budget. ' +
      'Computed as:',
      { color: BODY }
    ),
  ]),

  formula('CFS = 1 - (actual_emissions / carbon_budget_threshold)     [Clamped to 0.0\u20131.0]'),

  bodyPara([
    txt('Combined Compliance Score:', { bold: true, color: NAVY }),
  ]),

  formula('Compliance = \u03B1 \u00D7 Sequence_Fitness + (1\u2212\u03B1) \u00D7 CFS     [Default: \u03B1 = 0.6]'),

  body('Processes that exceed their carbon budget are flagged as "Carbon Violations" — a concept not present in any existing open-source process mining tool.'),

  heading2('3.3 OCEL 2.0 Support'),
  body(
    'TRACE natively ingests OCEL 2.0 format event logs — the latest standard from IEEE for ' +
    'object-centric process mining. This allows simultaneous tracking of multiple object types ' +
    '(orders, shipments, vehicles, suppliers) within a single unified event log.'
  ),

  gap(160),
];

// ═══════════════════════════════════════════════════════════════
// SECTION 4 — KEY FEATURES
// ═══════════════════════════════════════════════════════════════
const s4 = [
  heading1('Key Features'),

  heading2('4.1 Process Discovery & Visualization'),
  bullet('Automatic discovery of process variants from uploaded event logs'),
  bullet('Object-centric directly-follows graph (OC-DFG) generation'),
  bullet('Variant clustering using K-Means (grouping similar execution patterns)'),
  bullet('Interactive process flow visualization on the dashboard'),
  gap(),

  heading2('4.2 Carbon Intelligence Engine'),
  bullet('Per-activity emission factor mapping (configurable by transport mode, supplier, region)'),
  bullet('Automatic Scope 1 / Scope 2 / Scope 3 emissions categorization'),
  bullet('Carbon budget threshold configuration per process type'),
  bullet('Real-time violation flagging when carbon budgets are breached'),
  gap(),

  heading2('4.3 ESG Reporting Module'),
  bullet('Automated BRSR (Business Responsibility and Sustainability Report) generation'),
  bullet('PDF export with branded report layout'),
  bullet('Metrics: total emissions, emission intensity, compliance rate, hotspot identification'),
  bullet('Historical trend comparison across reporting periods'),
  gap(),

  heading2('4.4 AI Copilot (Ollama LLM)'),
  bullet('Local LLM integration via Ollama (no cloud API dependency — privacy-preserving)'),
  bullet('Natural language querying of process mining results'),
  bullet('Automated root cause analysis for violations'),
  bullet('Recommendation generation for process optimization and emission reduction'),
  gap(),

  heading2('4.5 Violation Management'),
  bullet('Complete violation log with case ID, activity, violation type, severity'),
  bullet('Separate tabs for Sequence Violations vs Carbon Violations'),
  bullet('Exportable violation reports for audit trails'),
  gap(160),
];

// ═══════════════════════════════════════════════════════════════
// SECTION 5 — RESEARCH CONTRIBUTION & NOVELTY
// ═══════════════════════════════════════════════════════════════
const s5 = [
  heading1('Research Contribution & Novelty'),

  heading2('5.1 Academic Positioning'),
  body('TRACE builds on and explicitly extends the state-of-the-art:'),

  makeTable(
    ['Dimension', 'Celonis', 'RWTH OCEAn (2025)', 'TRACE'],
    [
      ['Log Format',                   'XES (flat)',    'OCEL 2.0',       'OCEL 2.0'],
      ['Carbon Analysis',              'None',          'None',           'Native CFS engine'],
      ['Dual-objective conformance',   'No',            'No',             'Yes'],
      ['LLM Copilot',                  'Paid add-on',   'No',             'Local Ollama'],
      ['ESG/BRSR Reports',             'No',            'No',             'Automated'],
      ['Open Source',                  'No',            'Research only',  'Yes'],
    ],
    [2300, 1800, 1900, 1700]
  ),

  gap(160),

  heading2('5.2 Novel Contributions'),

  bodyPara([
    txt('1.  Carbon Fitness Score (CFS): ', { bold: true, color: NAVY }),
    txt(
      'First formalized metric combining process conformance with carbon budget adherence in a single unified score.',
      { color: BODY }
    ),
  ]),

  bodyPara([
    txt('2.  Dual-Objective Conformance Engine: ', { bold: true, color: NAVY }),
    txt(
      'Extension of classical fitness metrics to include environmental objectives — enabling truly sustainable process mining.',
      { color: BODY }
    ),
  ]),

  bodyPara([
    txt('3.  OCEL 2.0 + Carbon Integration: ', { bold: true, color: NAVY }),
    txt(
      'First platform to natively bridge the OCEL 2.0 standard with per-activity carbon emission modeling.',
      { color: BODY }
    ),
  ]),

  bodyPara([
    txt('4.  Local LLM Copilot for Process Intelligence: ', { bold: true, color: NAVY }),
    txt(
      'Privacy-preserving AI layer that operates entirely on-premises via Ollama, making it deployable in enterprise environments with data sovereignty requirements.',
      { color: BODY }
    ),
  ]),

  gap(160),
];

// ═══════════════════════════════════════════════════════════════
// SECTION 6 — TECHNOLOGY STACK
// ═══════════════════════════════════════════════════════════════
const s6 = [
  heading1('Technology Stack'),

  makeTable(
    ['Component', 'Technology'],
    [
      ['Frontend Framework',    'Next.js 16 (React)'],
      ['Styling',               'TailwindCSS'],
      ['Backend Framework',     'FastAPI (Python 3.11)'],
      ['Process Mining Engine', 'pm4py (OCEL 2.0)'],
      ['Database',              'PostgreSQL'],
      ['LLM Runtime',           'Ollama (local)'],
      ['PDF Generation',        'WeasyPrint / ReportLab'],
      ['Charting',              'Recharts'],
      ['Deployment',            'Docker Compose'],
      ['Version Control',       'Git / GitHub'],
    ],
    [3500, 4200]
  ),

  gap(160),
];

// ═══════════════════════════════════════════════════════════════
// SECTION 7 — SYSTEM WORKFLOW
// ═══════════════════════════════════════════════════════════════
const s7 = [
  heading1('System Workflow'),

  bodyPara([txt('Step 1 \u2014 Data Ingestion', { bold: true, color: NAVY, size: pt(11) })]),
  body(
    'Users upload OCEL 2.0 compliant CSV/JSON event logs. The backend parses object types, ' +
    'activities, timestamps, and resource attributes.'
  ),

  bodyPara([txt('Step 2 \u2014 Process Discovery', { bold: true, color: NAVY, size: pt(11) })]),
  body(
    'pm4py discovers the process model (directly-follows graph) and identifies process variants. ' +
    'K-Means clustering groups similar variants for pattern analysis.'
  ),

  bodyPara([txt('Step 3 \u2014 Conformance Checking', { bold: true, color: NAVY, size: pt(11) })]),
  body(
    'The dual-objective engine computes Sequence Fitness against the normative model and ' +
    'Carbon Fitness Score against configured carbon budgets. Violations are logged with case ' +
    'ID, severity, and type.'
  ),

  bodyPara([txt('Step 4 \u2014 ESG Intelligence', { bold: true, color: NAVY, size: pt(11) })]),
  body(
    'Emissions are aggregated by Scope 1/2/3, mapped to organizational units, and structured ' +
    'into BRSR-compliant report format.'
  ),

  bodyPara([txt('Step 5 \u2014 AI Copilot Analysis', { bold: true, color: NAVY, size: pt(11) })]),
  body(
    'The Ollama LLM receives summarized process metrics and generates natural language insights, ' +
    'root cause hypotheses, and optimization recommendations.'
  ),

  bodyPara([txt('Step 6 \u2014 Report Export', { bold: true, color: NAVY, size: pt(11) })]),
  body(
    'Users export PDF reports (ESG summary, BRSR annex, violation audit log) for submission ' +
    'to regulators, auditors, or internal stakeholders.'
  ),

  gap(160),
];

// ═══════════════════════════════════════════════════════════════
// SECTION 8 — IMPACT & APPLICATIONS
// ═══════════════════════════════════════════════════════════════
const s8 = [
  heading1('Impact & Applications'),

  heading2('Target Industries'),
  bullet('Logistics & Supply Chain (Scope 3 emissions from freight)'),
  bullet('Manufacturing (production process carbon tracking)'),
  bullet('Healthcare (supply chain compliance + sustainability)'),
  bullet('Financial Services (ESG reporting for portfolio companies)'),
  gap(),

  heading2('Regulatory Alignment'),
  bullet('India BRSR (Business Responsibility and Sustainability Reporting) — SEBI mandated for top 1000 listed companies'),
  bullet('EU CSRD (Corporate Sustainability Reporting Directive)'),
  bullet('ISO 14064 (Greenhouse Gas Quantification)'),
  gap(),

  heading2('Estimated Impact at Scale'),
  bullet('40\u201360% reduction in time spent on ESG report preparation'),
  bullet('Real-time carbon violation alerts (vs quarterly manual audits)'),
  bullet('Enables data-driven process redesign for net-zero targets'),
  gap(160),
];

// ═══════════════════════════════════════════════════════════════
// SECTION 9 — TEAM
// ═══════════════════════════════════════════════════════════════
const COL_W = 2500; // DXA per column (3 equal columns = 7500 total)

const s9 = [
  heading1('Team'),

  new Table({
    rows: [
      // Header row — member names
      new TableRow({
        children: [
          hCell('Rudra Pratap Singh', COL_W),
          hCell('Divayom Sengar', COL_W),
          hCell('Swastik Anurag Vyas', COL_W),
        ],
        tableHeader: true,
      }),
      // Row 2 — roles
      new TableRow({
        children: [
          dCell(
            'Full-Stack Development, Process Mining Engine, Carbon Intelligence Module, LLM Integration, ESG Report Generation',
            COL_W, false
          ),
          dCell(
            'Frontend Architecture, UI/UX Design, Dashboard Development, Data Visualization',
            COL_W, true
          ),
          dCell(
            'Backend Development, Database Design, API Engineering, Conformance Engine',
            COL_W, false
          ),
        ],
      }),
      // Row 3 — programme
      new TableRow({
        children: [
          dCell('B.Tech Information Technology | 3rd Year', COL_W, true),
          dCell('B.Tech Information Technology | 3rd Year', COL_W, false),
          dCell('B.Tech Information Technology | 3rd Year', COL_W, true),
        ],
      }),
      // Row 4 — institution
      new TableRow({
        children: [
          dCell('Manipal University Jaipur', COL_W, false),
          dCell('Manipal University Jaipur', COL_W, true),
          dCell('Manipal University Jaipur', COL_W, false),
        ],
      }),
    ],
    width: { size: COL_W * 3, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  }),

  gap(160),
];

// ═══════════════════════════════════════════════════════════════
// SECTION 10 — CONCLUSION
// ═══════════════════════════════════════════════════════════════
const s10 = [
  heading1('Conclusion'),

  body(
    'TRACE represents a significant step forward in making process mining practically useful ' +
    'for sustainability — bridging the gap between operational process intelligence and ' +
    'environmental accountability. By combining OCEL 2.0\u2019s expressive power with a novel ' +
    'dual-objective conformance engine and automated ESG reporting, TRACE delivers a platform ' +
    'that is simultaneously academically rigorous and enterprise-ready.'
  ),

  body(
    'The platform is designed for real-world deployment: it runs locally (no cloud dependency), ' +
    'supports privacy-preserving LLM inference, and generates audit-ready ESG reports aligned ' +
    "with India's BRSR mandate."
  ),

  body(
    'We believe TRACE has the potential to be the open-source foundation for sustainable ' +
    'process mining research globally.'
  ),

  gap(360),

  // Closing signature line
  new Paragraph({
    children: [
      txt('TRACE | HackCulture 2026 | Manipal University Jaipur', {
        bold: true,
        size: pt(10),
        color: TEAL,
        italics: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 0 },
  }),
];

// ═══════════════════════════════════════════════════════════════
// DOCUMENT ASSEMBLY
// ═══════════════════════════════════════════════════════════════
const doc = new Document({
  // ── Styles: Word REQUIRES a Normal style — without it the file won't open ──
  styles: {
    paragraphStyles: [
      {
        // Base style — mandatory for Word to open the file
        id: 'Normal',
        name: 'Normal',
        run: {
          font: 'Calibri',
          size: pt(11),
          color: BODY,
        },
        paragraph: {
          spacing: { after: dxa(120), line: 276, lineRule: 'auto' },
        },
      },
      {
        // Required by bullet numbering paragraphs
        id: 'ListParagraph',
        name: 'List Paragraph',
        basedOn: 'Normal',
        run: {
          font: 'Calibri',
          size: pt(11),
          color: BODY,
        },
        paragraph: {
          indent: {
            left: convertInchesToTwip(0.4),
          },
          spacing: { after: dxa(80) },
        },
      },
    ],
  },

  // ── Bullet list numbering config ───────────────────────────────
  numbering: {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: {
                  left:    convertInchesToTwip(0.4),
                  hanging: convertInchesToTwip(0.2),
                },
              },
              run: { font: 'Calibri', size: pt(11) },
            },
          },
        ],
      },
    ],
  },

  sections: [
    // ── Section A: Cover page (no footer, vertically centered) ──
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        verticalAlign: VerticalAlign.CENTER,   // top-level, not under page
        page: {
          size:   { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      children: cover,
    },

    // ── Section B: Main content (all 10 sections, shared footer) ──
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size:   { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      footers: { default: pageFooter },
      children: [
        ...s1,
        ...s2,
        ...s3,
        ...s4,
        ...s5,
        ...s6,
        ...s7,
        ...s8,
        ...s9,
        ...s10,
      ],
    },
  ],
});

// ── Write output ───────────────────────────────────────────────
const OUTPUT = '/Users/rudrapratapsingh/Desktop/TRACE/TRACE_Project_Report.docx';

Packer.toBuffer(doc)
  .then(buf => {
    fs.writeFileSync(OUTPUT, buf);
    console.log(`\u2705  Saved: ${OUTPUT}`);
    console.log(`\u2139\uFE0F  Size: ${(buf.length / 1024).toFixed(1)} KB`);
  })
  .catch(err => {
    console.error('\u274C  Error:', err.message);
    process.exit(1);
  });
