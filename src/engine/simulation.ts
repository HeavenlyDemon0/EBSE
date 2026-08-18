import { SCENARIOS } from "../data/scenarios";
import type { SimulationState } from "../types";

/**
 * Derives the complete SimulationState from base parameters.
 * Ensures data remains internally consistent across all components.
 */
export function deriveSimulationState(params: {
  activeScenario: "alpha" | "bravo" | "charlie";
  telemetryIntegrity: number; // 100, 70, 40
  investigatedLogs: string[]; // List of recommendation IDs resolved
  presentationMode: boolean;
  demoStep: number;
  isDemoActive: boolean;
  selectedHypothesisId: string;
}): SimulationState {
  const {
    activeScenario,
    telemetryIntegrity,
    investigatedLogs,
    presentationMode,
    demoStep,
    isDemoActive,
    selectedHypothesisId
  } = params;

  const scenario = SCENARIOS[activeScenario];
  
  // Determine the key state name based on whether the main recommendation is resolved
  let stateKey: 100 | 70 | 40 | "40_resolved" = telemetryIntegrity as any;
  
  const isResolved = isRecommendationResolved(activeScenario, investigatedLogs);
  if (telemetryIntegrity === 40 && isResolved) {
    stateKey = "40_resolved";
  }

  const sData = scenario.states[stateKey];

  // Derive evidence quality stats
  // Statuses: verified, delayed, missing, contradictory, unverified
  const events = sData.events;
  const hypotheses = sData.hypotheses;
  
  // If the hypothesis selection is empty, select the first one
  let activeHypothesisId = selectedHypothesisId;
  if (!activeHypothesisId || !hypotheses.some(h => h.id === activeHypothesisId)) {
    activeHypothesisId = hypotheses[0]?.id || "";
  }

  return {
    telemetryIntegrity,
    evidenceCompleteness: sData.evidenceCompleteness,
    evidenceDebt: sData.evidenceDebt,
    activeHypotheses: hypotheses,
    evidenceEvents: events,
    criticalGaps: sData.criticalGaps,
    selectedHypothesisId: activeHypothesisId,
    recommendedEvidence: sData.recommendations,
    investigationStatus: sData.investigationStatus,
    whatWeKnow: sData.whatWeKnow,
    whatWeDontKnow: sData.whatWeDontKnow,
    investigatedLogs,
    activeScenario,
    presentationMode,
    demoStep,
    isDemoActive
  };
}

/**
 * Check if the primary recommendation for the active scenario has been investigated.
 */
export function isRecommendationResolved(
  activeScenario: "alpha" | "bravo" | "charlie",
  investigatedLogs: string[]
): boolean {
  if (activeScenario === "alpha") {
    return investigatedLogs.includes("rec_alpha_40_1") || investigatedLogs.includes("RESTORED_DC");
  } else if (activeScenario === "bravo") {
    return investigatedLogs.includes("rec_bravo_40_1") || investigatedLogs.includes("RESTORED_FW");
  } else if (activeScenario === "charlie") {
    return investigatedLogs.includes("rec_charlie_40_1") || investigatedLogs.includes("RESTORED_DB");
  }
  return false;
}

/**
 * Returns the description of the top recommendation for a scenario.
 */
export function getTopRecommendationName(scenarioId: "alpha" | "bravo" | "charlie"): string {
  if (scenarioId === "alpha") return "Domain Controller Authentication Logs (DC-03)";
  if (scenarioId === "bravo") return "Firewall Network Session Archive (FIREWALL-09)";
  return "DB-SRV-01 SQL Audit Log";
}
