export type EvidenceStatus =
  | "verified"
  | "delayed"
  | "missing"
  | "contradictory"
  | "unverified";

export type HypothesisStatus =
  | "leading"
  | "plausible"
  | "weak"
  | "contradicted";

export type AttackStepStatus =
  | "confirmed"
  | "supported"
  | "unverified"
  | "missing"
  | "contradicted";

export interface EvidenceEvent {
  id: string;
  timestamp: string;
  type: "AUTH" | "NETWORK" | "PROCESS" | "SYSTEM" | "ENGINE" | "DATA";
  source: string;
  destination?: string;
  description: string;
  status: EvidenceStatus;
  reliability: number; // 0.0 - 1.0
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details?: string;
}

export interface AttackStep {
  id: string;
  phase: "INITIAL_ACCESS" | "CREDENTIAL_ACCESS" | "LATERAL_MOVEMENT" | "PRIVILEGE_ESC" | "DATA_ACCESS";
  name: string;
  description: string;
  status: AttackStepStatus;
  evidenceIds: string[];
  missingEvidenceReason?: string;
}

export interface Hypothesis {
  id: string;
  name: string;
  description: string;
  confidence: number; // 0 - 100
  evidenceDebt: number; // 0 - 100
  status: HypothesisStatus;
  steps: AttackStep[];
  supportingEvidence: string[]; // Event IDs
  missingEvidence: string[]; // Descriptions of required evidence
  conflictingEvidence: string[]; // Event IDs
}

export interface EvidenceRecommendation {
  id: string;
  title: string;
  reason: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  informationGain: number; // 0.0 - 1.0
  associatedHypothesis: string;
  targetLogSource: string;
}

export interface SimulationState {
  telemetryIntegrity: number; // 100, 70, 40
  evidenceCompleteness: number; // 0 - 100 %
  evidenceDebt: number; // 0 - 100
  activeHypotheses: Hypothesis[];
  evidenceEvents: EvidenceEvent[];
  criticalGaps: number;
  selectedHypothesisId: string;
  recommendedEvidence: EvidenceRecommendation[];
  investigationStatus: string;
  whatWeKnow: string[];
  whatWeDontKnow: string[];
  investigatedLogs: string[]; // Track which logs have been restored/investigated
  activeScenario: "alpha" | "bravo" | "charlie";
  presentationMode: boolean;
  demoStep: number; // 1-7
  isDemoActive: boolean;
}
