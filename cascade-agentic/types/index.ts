// CASCADE Type Definitions
// All shared TypeScript interfaces for the agentic system

export interface GeoPoint {
  lat: number;
  lon: number;
  city: string;
}

export interface Shipment {
  id?: string;
  shipmentId: string;
  origin: GeoPoint;
  destination: GeoPoint;
  plannedDeparture: unknown; // Firestore Timestamp
  plannedArrival: unknown;   // Firestore Timestamp
  durationHours: number;
  carrier: string;
  customerPriority: 'critical' | 'high' | 'normal';
  status: 'active' | 'at_risk' | 'rerouted' | 'completed';
  currentRoute: string;
  valueUsd: number;
  driverEmail?: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface Prediction {
  id?: string;
  predictionId: string;
  shipmentId: string;
  predictionTime: unknown;
  horizonHours: number;
  disruptionProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedDelayMinutes: number;
  weatherSeverity: number;
  confidenceScore: number;
  factors: {
    weather: number;
    traffic: number;
    historical: number;
    other: number;
  };
}

export interface DecisionDetails {
  oldRoute?: string;
  newRoute?: string;
  costImpact?: number;
  savedPenalty?: number;
  newETA?: unknown;
  reason?: string;
}

export interface McpActions {
  gmailSent: boolean;
  calendarUpdated: boolean;
  sheetLogged: boolean;
  gmailSimulated?: boolean;
  calendarSimulated?: boolean;
  sheetSimulated?: boolean;
}

export interface Decision {
  id?: string;
  decisionId: string;
  predictionId: string;
  shipmentId: string;
  decisionType: 'auto_execute' | 'escalate_human' | 'monitor';
  action: 'reroute' | 'expedite' | 'accept_delay' | 'escalate' | 'monitor';
  executedAt: unknown;
  executedBy: 'agent' | string;
  details: DecisionDetails;
  mcpActions: McpActions;
  reasoning?: string;
}

export interface ActionLog {
  id?: string;
  actionId: string;
  shipmentId: string;
  timestamp: unknown;
  actionType: string;
  mcpUsed: 'gmail' | 'calendar' | 'sheets' | 'maps' | 'gemini' | 'none';
  result: 'success' | 'simulated' | 'failed';
  details: Record<string, unknown>;
}

export interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  atRiskShipments: number;
  reroutedShipments: number;
  avgDisruptionProbability: number;
  totalValueAtRisk: number;
  autonomousActionsToday: number;
}

export interface AgentDecisionResult {
  action: 'reroute_shipment' | 'notify_driver' | 'escalate_to_human' | 'monitor_and_wait';
  args: Record<string, unknown>;
  reasoning: string;
}

export interface RouteResult {
  newRoute: string;
  eta: Date;
  distanceKm: number;
  durationMinutes: number;
  additionalCost: number;
}
