export interface Organization {
  id: string;
  name: string;
  country: string;
  projectsCount: number;
  createdAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  eventLogsCount: number;
  lastUpdated: string;
}

export interface Workspace {
  id: string;
  projectId: string;
  name: string;
  lastModified: string;
  configSummary: string;
}

export interface OcelMetadata {
  filename: string;
  rowCount: number;
  caseCount: number;
  activityCount: number;
  totalEvents: number;
}

export interface OcelNode {
  id: string;
  label: string;
  frequency: number;
  avgDuration: string;
}

export interface OcelEdge {
  id: string;
  source: string;
  target: string;
  frequency: number;
  avgDelay: string;
}

export interface Violation {
  id: string;
  caseId: string;
  activity: string;
  mandatedAlternative: string;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  carbonDeltaKg: number;
  estimated: boolean;
  timestamp: string;
}

export interface BottleneckActivity {
  activity: string;
  avgWaitTime: number; // in hours
  status: 'critical' | 'warning' | 'pass';
  occurrences?: number;
}

export interface ReworkActivity {
  activity: string;
  reworkCount: number;
  reworkPercent: number;
  carbonImpact: number; // in kg CO2e
}

export interface CarbonBudgetMonth {
  month: string;
  budget: number; // in kg
  actual: number; // in kg
  delta: number; // in kg
  status: 'critical' | 'warning' | 'pass';
}

export interface CarbonFitnessItem {
  id: string;
  name: string; // Case ID, Variant name, or Activity name
  cfs: number;
  carbonEmitted: number; // in kg
  volume?: number;
}

export interface CfsScore {
  caseId: string;
  actualCarbonKg: number;
  idealCarbonKg: number;
  cfsScore: number;
  violationCount: number;
}

export interface SupplierFitness {
  supplier: string;
  totalCarbonKg: number;
  violationCount: number;
  avgCfsScore: number;
  caseCount: number;
  isResourceFallback: boolean;
}

export interface RouteRecommendation {
  id: string;
  currentRoute: string;
  recommendedRoute: string;
  carbonSaving: number; // in kg
  costDelta: number; // in USD (negative is savings)
  confidence: number; // percentage (0.0 to 1.0)
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structured?: {
    answer: string;
    why: string;
    evidence: { label: string; value: string | number }[];
    action?: { label: string; actionId: string };
  };
}

export interface SimulationScenario {
  id: string;
  name: string;
  airFreightReduction: number; // 0-100
  supplierVolumeShift: number; // 0-100
  activityRemoval: string; // activity name
  results: {
    beforeCarbon: number;
    afterCarbon: number;
    beforeCfs: number;
    afterCfs: number;
    beforeBudgetRemaining: number;
    afterBudgetRemaining: number;
    beforeViolations: number;
    afterViolations: number;
  };
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  ip: string;
  status: 'success' | 'failed';
  details?: string;
}

export interface EmissionFactor {
  id: string;
  activity: string;
  factor: number; // kg CO2e
  source: string;
  unit: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface MappingField {
  column: string | null;
  confidence: number;
}

export interface SupplierMappingField extends MappingField {
  isResourceFallback: boolean;
}

export interface ColumnMapping {
  case_id: MappingField;
  activity: MappingField;
  timestamp: MappingField;
  resource: MappingField;
  supplier: SupplierMappingField;
  mappingSource: 'auto' | 'manual';
}

export interface ActivityCarbonBreakdownItem {
  activity: string;
  category: string;
  estimated: boolean;
  frequency: number;
  totalCarbon: number;
}

export interface ProcessOptimization {
  bottlenecks: {
    activity: string;
    avgWaitHours: number;
    occurrences: number;
    status: 'critical' | 'moderate' | 'optimized';
  }[];
  rework: {
    activity: string;
    reworkCount: number;
    reworkPercentage: number;
    carbonImpactKg: number;
  }[];
  caseDurationDistribution: {
    bucket: string;
    count: number;
    percentage: number;
  }[];
  totalCasesAnalyzed: number;
}

export interface BrsrHeader {
  orgName: string;
  workspaceContext: string;
  projectContext: string;
  reportingPeriod: string;
  reportVersion: string;
  auditReadiness: string;
  reportHash: string;
}

export interface BrsrSectionA {
  orgName: string;
  workspaceContext: string;
  projectContext: string;
  reportingPeriod: string;
  reportVersion: string;
  auditReadiness: string;
}

export interface BrsrBottleneck {
  activity: string;
  avgWaitHours: number;
  occurrences: number;
  status: 'critical' | 'moderate' | 'optimized';
}

export interface BrsrSectionB {
  conformanceMethodology: string;
  totalEvaluatedTraces: number;
  nonConformingTraces: number;
  bottlenecks: BrsrBottleneck[];
}

export interface BrsrResourceDraw {
  energyKwh: number | null;
  waterLiters: number | null;
  wasteKg: number | null;
  carbonBudgetLimitKg: number;
  carbonBudgetStatus: 'EXCEEDED' | 'WITHIN_LIMIT';
}

export interface BrsrCarbonHotspot {
  activity: string;
  category: string;
  estimated: boolean;
  frequency: number;
  totalCarbon: number;
  contributionPercent: number;
}

export interface BrsrSectionC {
  resourceDraw: BrsrResourceDraw;
  carbonHotspots: BrsrCarbonHotspot[];
}

export interface BrsrTraceabilityItem {
  metric: string;
  engine: string;
  sourceTable: string;
  referenceField: string;
}

export interface BrsrRecommendation {
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  narrative: string;
  estEmissionReductionKg?: number;
}

export interface BrsrReport {
  header: BrsrHeader;
  executiveSummary: string;
  kpiStrip: {
    processComplianceScore: number;
    carbonFitnessScore: number;
    esgOverallScore: number;
    totalActualEmissions: number;
  };
  sectionA: BrsrSectionA;
  sectionB: BrsrSectionB;
  sectionC: BrsrSectionC;
  sectionD_traceabilityMatrix: BrsrTraceabilityItem[];
  recommendations: BrsrRecommendation[];
}
