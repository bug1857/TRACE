import {
  Organization,
  Project,
  Workspace,
  OcelMetadata,
  OcelNode,
  OcelEdge,
  Violation,
  BottleneckActivity,
  ReworkActivity,
  CarbonBudgetMonth,
  CarbonFitnessItem,
  SupplierFitness,
  RouteRecommendation,
  CopilotMessage,
  SimulationScenario,
  AuditLog,
  EmissionFactor,
  TeamMember,
  CfsScore
} from './types';

export const mockOrganizations: Organization[] = [
  { id: 'org-1', name: 'Louis India Pvt. Ltd.', country: 'India', projectsCount: 3, createdAt: '2024-01-15' },
  { id: 'org-2', name: 'Mudra Cargo Logistics', country: 'India', projectsCount: 1, createdAt: '2024-03-10' },
  { id: 'org-3', name: 'Tata Supply Solutions', country: 'India', projectsCount: 5, createdAt: '2023-08-20' },
  { id: 'org-4', name: 'Bharat Freight Enterprise', country: 'India', projectsCount: 2, createdAt: '2024-02-05' },
  { id: 'org-5', name: 'Hindustan Logistics Group', country: 'India', projectsCount: 4, createdAt: '2023-11-12' }
];

export const mockProjects: Project[] = [
  { id: 'proj-1', organizationId: 'org-1', name: 'Q3 Supply Chain Audit 2024', description: 'Comprehensive audit of logistics pathways, supplier emissions, and process conformance for Q3.', eventLogsCount: 1, lastUpdated: '2024-06-18' },
  { id: 'proj-2', organizationId: 'org-1', name: 'Decarbonization Initiative 2024', description: 'Monitoring alternative fuel route mappings and electric fleet integration targets.', eventLogsCount: 2, lastUpdated: '2024-05-24' },
  { id: 'proj-3', organizationId: 'org-1', name: 'Warehouse Process Optimization', description: 'Process mining of intake, storage, and retrieval workflows in Chennai and Mumbai hubs.', eventLogsCount: 1, lastUpdated: '2024-04-12' }
];

export const mockWorkspaces: Workspace[] = [
  { id: 'work-1', projectId: 'proj-1', name: 'Primary SC Logs', lastModified: '2024-06-18 14:32', configSummary: 'OCEL 2.0 Log • 1,247 events • 89 cases' },
  { id: 'work-2', projectId: 'proj-1', name: 'Supplier ESG Metrics', lastModified: '2024-06-15 09:12', configSummary: 'BRSR Principle 6 Template • 18 active suppliers' },
  { id: 'work-3', projectId: 'proj-1', name: 'Simulation Playground', lastModified: '2024-06-20 18:22', configSummary: '3 active scenarios • Air freight shift config' }
];

export const mockOcelMetadata: OcelMetadata = {
  filename: 'louis_india_q3_sc.csv',
  rowCount: 1247,
  caseCount: 89,
  activityCount: 12,
  totalEvents: 1247
};

export const mockOcelNodes: OcelNode[] = [
  { id: '1', label: 'Order Received', frequency: 89, avgDuration: '0.0h' },
  { id: '2', label: 'Warehouse Pick & Pack', frequency: 89, avgDuration: '4.2h' },
  { id: '3', label: 'Customs Clearance', frequency: 78, avgDuration: '12.8h' },
  { id: '4', label: 'Air Freight Dispatch', frequency: 32, avgDuration: '24.5h' },
  { id: '5', label: 'Road Transport Dispatch', frequency: 57, avgDuration: '48.1h' },
  { id: '6', label: 'Last Mile Delivery', frequency: 89, avgDuration: '6.4h' }
];

export const mockOcelEdges: OcelEdge[] = [
  { id: 'e1-2', source: '1', target: '2', frequency: 89, avgDelay: '1.2h' },
  { id: 'e2-3', source: '2', target: '3', frequency: 78, avgDelay: '3.5h' },
  { id: 'e3-4', source: '3', target: '4', frequency: 32, avgDelay: '6.8h' },
  { id: 'e3-5', source: '3', target: '5', frequency: 46, avgDelay: '14.2h' },
  { id: 'e2-5', source: '2', target: '5', frequency: 11, avgDelay: '8.4h' },
  { id: 'e4-6', source: '4', target: '6', frequency: 32, avgDelay: '2.1h' },
  { id: 'e5-6', source: '5', target: '6', frequency: 57, avgDelay: '5.6h' }
];

export const mockViolations: Violation[] = [
  {
    id: 'v-CASE-7289-AirFreightDispatch-4',
    caseId: 'CASE-7289',
    activity: 'Air Freight Dispatch',
    mandatedAlternative: 'rail freight',
    category: 'transport',
    severity: 'critical',
    carbonDeltaKg: 2450.5,
    estimated: true,
    timestamp: '2024-06-18T10:22:00Z'
  },
  {
    id: 'v-CASE-8390-TruckDelivery-2',
    caseId: 'CASE-8390',
    activity: 'Truck Delivery Transport',
    mandatedAlternative: 'rail delivery',
    category: 'transport',
    severity: 'warning',
    carbonDeltaKg: 890.2,
    estimated: true,
    timestamp: '2024-06-18T08:15:00Z'
  },
  {
    id: 'v-CASE-6112-IncinerationDisposal-3',
    caseId: 'CASE-6112',
    activity: 'Incineration Disposal',
    mandatedAlternative: 'recycling',
    category: 'waste',
    severity: 'info',
    carbonDeltaKg: 150.8,
    estimated: true,
    timestamp: '2024-06-17T16:45:00Z'
  },
  {
    id: 'v-CASE-9021-LandfillDisposal-5',
    caseId: 'CASE-9021',
    activity: 'Landfill Disposal',
    mandatedAlternative: 'recycling',
    category: 'waste',
    severity: 'info',
    carbonDeltaKg: 120.5,
    estimated: true,
    timestamp: '2024-06-17T11:30:00Z'
  },
  {
    id: 'v-CASE-5541-AirFreight-1',
    caseId: 'CASE-5541',
    activity: 'Express Air Freight',
    mandatedAlternative: 'rail freight',
    category: 'transport',
    severity: 'critical',
    carbonDeltaKg: 1105.4,
    estimated: true,
    timestamp: '2024-06-16T15:10:00Z'
  }
];


export const mockBottlenecks: BottleneckActivity[] = [
  { activity: 'Customs Clearance', avgWaitTime: 28.4, status: 'critical' },
  { activity: 'Road Transport Dispatch', avgWaitTime: 16.2, status: 'warning' },
  { activity: 'Warehouse Pick & Pack', avgWaitTime: 6.8, status: 'pass' },
  { activity: 'Air Freight Dispatch', avgWaitTime: 4.1, status: 'pass' },
  { activity: 'Last Mile Delivery', avgWaitTime: 3.5, status: 'pass' }
];

export const mockReworks: ReworkActivity[] = [
  { activity: 'Warehouse Pick & Pack', reworkCount: 24, reworkPercent: 26.9, carbonImpact: 452.8 },
  { activity: 'Customs Clearance', reworkCount: 14, reworkPercent: 17.9, carbonImpact: 1240.2 },
  { activity: 'Road Transport Dispatch', reworkCount: 8, reworkPercent: 8.9, carbonImpact: 680.5 },
  { activity: 'Order Received', reworkCount: 3, reworkPercent: 3.3, carbonImpact: 45.0 },
  { activity: 'Last Mile Delivery', reworkCount: 2, reworkPercent: 2.2, carbonImpact: 90.4 }
];

export const mockCarbonBudgetMonths: CarbonBudgetMonth[] = [
  { month: 'Jan 2024', budget: 10000, actual: 8900, delta: -1100, status: 'pass' },
  { month: 'Feb 2024', budget: 10000, actual: 9800, delta: -200, status: 'pass' },
  { month: 'Mar 2024', budget: 10000, actual: 11200, delta: 1200, status: 'warning' },
  { month: 'Apr 2024', budget: 10000, actual: 12500, delta: 2500, status: 'critical' },
  { month: 'May 2024', budget: 10000, actual: 16800, delta: 6800, status: 'critical' },
  { month: 'Jun 2024', budget: 10000, actual: 19230, delta: 9230, status: 'critical' },
  { month: 'Jul 2024', budget: 10000, actual: 0, delta: 0, status: 'pass' },
  { month: 'Aug 2024', budget: 10000, actual: 0, delta: 0, status: 'pass' },
  { month: 'Sep 2024', budget: 10000, actual: 0, delta: 0, status: 'pass' },
  { month: 'Oct 2024', budget: 10000, actual: 0, delta: 0, status: 'pass' },
  { month: 'Nov 2024', budget: 10000, actual: 0, delta: 0, status: 'pass' },
  { month: 'Dec 2024', budget: 10000, actual: 0, delta: 0, status: 'pass' }
];

export const mockCarbonFitnessCases: CarbonFitnessItem[] = [
  { id: 'CASE-7289', name: 'Air Freight Bypass - Berlin', cfs: 28, carbonEmitted: 4120.5 },
  { id: 'CASE-8390', name: 'Refrigerated Storage - Mumbai', cfs: 52, carbonEmitted: 1890.2 },
  { id: 'CASE-6112', name: 'Euro V Delivery Truck - Delhi', cfs: 45, carbonEmitted: 2600.0 },
  { id: 'CASE-9021', name: 'Standard Packing Cycle - Chennai', cfs: 68, carbonEmitted: 450.8 },
  { id: 'CASE-5541', name: 'Eco Route Last Mile - Bengaluru', cfs: 86, carbonEmitted: 120.4 }
];

export const mockCarbonFitnessVariants: CarbonFitnessItem[] = [
  { id: 'VAR-1', name: 'Recv → Pick → Customs → Road → Last Mile', cfs: 82, carbonEmitted: 1120.0, volume: 46 },
  { id: 'VAR-2', name: 'Recv → Pick → Customs → Air → Last Mile', cfs: 38, carbonEmitted: 4890.5, volume: 22 },
  { id: 'VAR-3', name: 'Recv → Pick → Road → Last Mile (Local Bypass)', cfs: 89, carbonEmitted: 780.0, volume: 11 },
  { id: 'VAR-4', name: 'Recv → Pick → Customs → Road (Rework) → Last Mile', cfs: 64, carbonEmitted: 1850.2, volume: 8 },
  { id: 'VAR-5', name: 'Recv → Pick (Rework) → Customs → Air → Last Mile', cfs: 32, carbonEmitted: 5210.4, volume: 2 }
];

export const mockCarbonFitnessActivities: CarbonFitnessItem[] = [
  { id: 'ACT-4', name: 'Air Freight Dispatch', cfs: 34, carbonEmitted: 4890.5 },
  { id: 'ACT-5', name: 'Road Transport Dispatch', cfs: 72, carbonEmitted: 1350.2 },
  { id: 'ACT-3', name: 'Customs Clearance', cfs: 58, carbonEmitted: 890.4 },
  { id: 'ACT-2', name: 'Warehouse Pick & Pack', cfs: 80, carbonEmitted: 410.8 },
  { id: 'ACT-6', name: 'Last Mile Delivery', cfs: 88, carbonEmitted: 180.2 }
];

export const mockSupplierFitness: SupplierFitness[] = [
  { supplier: 'Supplier E — EcoLink Carriers', totalCarbonKg: 890.4, violationCount: 0, avgCfsScore: 94.00, caseCount: 7, isResourceFallback: false },
  { supplier: 'Supplier A — GreenFreight Ltd.', totalCarbonKg: 1450.2, violationCount: 1, avgCfsScore: 91.00, caseCount: 10, isResourceFallback: false },
  { supplier: 'Supplier C — Deecan Roadlines', totalCarbonKg: 2350.2, violationCount: 4, avgCfsScore: 71.00, caseCount: 8, isResourceFallback: false },
  { supplier: 'Supplier D — SpeedJet Air Cargo', totalCarbonKg: 3890.4, violationCount: 6, avgCfsScore: 45.00, caseCount: 9, isResourceFallback: false },
  { supplier: 'Supplier B — FastCargo Ltd.', totalCarbonKg: 4890.5, violationCount: 8, avgCfsScore: 34.00, caseCount: 12, isResourceFallback: false }
];

export const mockCfsScores: CfsScore[] = [
  { caseId: 'CASE-6112', actualCarbonKg: 890.4, idealCarbonKg: 890.4, cfsScore: 100.0, violationCount: 0 },
  { caseId: 'CASE-9021', actualCarbonKg: 410.8, idealCarbonKg: 410.8, cfsScore: 100.0, violationCount: 0 },
  { caseId: 'CASE-5541', actualCarbonKg: 2450.5, idealCarbonKg: 1345.1, cfsScore: 54.89, violationCount: 2 },
  { caseId: 'CASE-8390', actualCarbonKg: 1250.2, idealCarbonKg: 360.0, cfsScore: 28.80, violationCount: 1 },
  { caseId: 'CASE-7289', actualCarbonKg: 3120.5, idealCarbonKg: 670.0, cfsScore: 21.47, violationCount: 1 }
];

export const mockRouteRecommendations: RouteRecommendation[] = [
  { id: 'r-1', currentRoute: 'Mumbai Hub to Delhi NCR via Air Freight', recommendedRoute: 'Mumbai Hub to Delhi NCR via Express Electric Rail', carbonSaving: 18200, costDelta: -450, confidence: 0.95 },
  { id: 'r-2', currentRoute: 'Chennai Port to Bengaluru Warehouse via Heavy Diesel Truck', recommendedRoute: 'Chennai Port to Bengaluru Warehouse via LNG Carrier Fleet', carbonSaving: 9400, costDelta: 120, confidence: 0.88 },
  { id: 'r-3', currentRoute: 'Kolkata Depot to Siliguri Hub via Unoptimized State Route', recommendedRoute: 'Kolkata Depot to Siliguri Hub via National Highway Corridor E4', carbonSaving: 4800, costDelta: -80, confidence: 0.92 },
  { id: 'r-4', currentRoute: 'Hyderabad Packing Hub to Pune Depot via Air cargo', recommendedRoute: 'Hyderabad Packing Hub to Pune Depot via Intermodal Freight Rail', carbonSaving: 12300, costDelta: -210, confidence: 0.90 },
  { id: 'r-5', currentRoute: 'Delhi Distribution to Noida Last Mile via Diesel Vans', recommendedRoute: 'Delhi Distribution to Noida Last Mile via Tata Ace EV Electric Fleet', carbonSaving: 2100, costDelta: -150, confidence: 0.98 }
];

export const mockCopilotMessages: CopilotMessage[] = [
  {
    id: 'm-1',
    role: 'assistant',
    content: 'Welcome to TRACE. Copilot. I can analyze process mining data, carbon performance, conformance gaps, and ESG supply chain metrics. Select a prompt or type your query below.',
    timestamp: '2024-06-20 18:00'
  }
];

export const mockSimulationScenarios: SimulationScenario[] = [
  {
    id: 'sim-1',
    name: '50% Air Freight Shift',
    airFreightReduction: 50,
    supplierVolumeShift: 20,
    activityRemoval: 'Customs Yard Re-inspection',
    results: {
      beforeCarbon: 78430,
      afterCarbon: 62500,
      beforeCfs: 72,
      afterCfs: 79,
      beforeBudgetRemaining: 41570,
      afterBudgetRemaining: 57500,
      beforeViolations: 23,
      afterViolations: 12
    },
    createdAt: '2024-06-19 11:22'
  },
  {
    id: 'sim-2',
    name: 'Targeted Green Supplier Sourcing',
    airFreightReduction: 10,
    supplierVolumeShift: 80,
    activityRemoval: 'None',
    results: {
      beforeCarbon: 78430,
      afterCarbon: 54100,
      beforeCfs: 72,
      afterCfs: 85,
      beforeBudgetRemaining: 41570,
      afterBudgetRemaining: 65900,
      beforeViolations: 23,
      afterViolations: 6
    },
    createdAt: '2024-06-20 15:45'
  }
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'a-1', timestamp: '2024-06-20 18:22:45', user: 'rajesh.sharma@louisindia.com', action: 'RUN_SIMULATION', target: 'Scenario: 50% Air Freight Shift', ip: '103.44.221.18', status: 'success' },
  { id: 'a-2', timestamp: '2024-06-20 17:15:30', user: 'priya.nair@louisindia.com', action: 'UPLOAD_OCEL_LOG', target: 'louis_india_q3_sc.csv', ip: '103.44.221.19', status: 'success' },
  { id: 'a-3', timestamp: '2024-06-20 15:10:12', user: 'priya.nair@louisindia.com', action: 'UPDATE_EMISSION_FACTOR', target: 'Air Freight Factor: 2.45 -> 2.62 kg/CO2e', ip: '103.44.221.19', status: 'success' },
  { id: 'a-4', timestamp: '2024-06-20 14:02:50', user: 'amit.patel@louisindia.com', action: 'REQUEST_CORRECTIVE_ACTION', target: 'Supplier: Supplier B — FastCargo Ltd.', ip: '192.168.1.105', status: 'success' },
  { id: 'a-5', timestamp: '2024-06-20 11:22:15', user: 'rajesh.sharma@louisindia.com', action: 'EXPORTS_PDF_REPORT', target: 'BRSR Principle 6 Report 2024', ip: '103.44.221.18', status: 'success' }
];

export const mockEmissionFactors: EmissionFactor[] = [
  { id: 'ef-1', activity: 'Air Freight Dispatch', factor: 2.62, source: 'GHG Protocol Transport Tool v3', unit: 'kg CO2e / t-km' },
  { id: 'ef-2', activity: 'Road Transport Dispatch', factor: 0.85, source: 'DEFRA Carbon Factors 2023', unit: 'kg CO2e / v-km' },
  { id: 'ef-3', activity: 'Warehouse Pick & Pack', factor: 0.12, source: 'Louis Corporate ESG Audit 2023', unit: 'kg CO2e / order' },
  { id: 'ef-4', activity: 'Customs Clearance Yard', factor: 1.45, source: 'IPCC Mobile Refrigeration Benchmarks', unit: 'kg CO2e / container-hr' },
  { id: 'ef-5', activity: 'Last Mile Delivery', factor: 0.38, source: 'Ecotransit Emission Calculator v4', unit: 'kg CO2e / delivery' }
];

export const mockTeamMembers: TeamMember[] = [
  { id: 't-1', name: 'Rajesh Sharma', email: 'rajesh.sharma@louisindia.com', role: 'admin' },
  { id: 't-2', name: 'Priya Nair', email: 'priya.nair@louisindia.com', role: 'editor' },
  { id: 't-3', name: 'Amit Patel', email: 'amit.patel@louisindia.com', role: 'editor' },
  { id: 't-4', name: 'Ananya Sen', email: 'ananya.sen@louisindia.com', role: 'viewer' },
  { id: 't-5', name: 'Vikram Rao', email: 'vikram.rao@louisindia.com', role: 'viewer' }
];

export const mockForecastingData = {
  dataAvailable: true,
  insufficientDataNote: null,
  trainMonths: 12,
  holdoutMonths: 3,
  baselines: [
    { name: 'Naive', applicable: true, predictions: [10000, 11000, 12000], mae: 1500, mape: 12.5 },
    { name: 'Moving Average', applicable: true, predictions: [10500, 11200, 11800], mae: 1200, mape: 10.2 },
    { name: 'Linear Trend', applicable: true, predictions: [10800, 11500, 12200], mae: 800, mape: 6.5 },
    { name: 'Seasonal Naive', applicable: true, predictions: [9500, 10200, 10800], mae: 1800, mape: 15.0 }
  ],
  bestBaseline: 'Linear Trend',
  forecastNextMonth: {
    usingBaseline: 'Linear Trend',
    predictedActualKg: 12500
  }
};
