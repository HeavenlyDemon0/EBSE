import { SCENARIOS } from "../data/scenarios";
import type { SimulationState, Hypothesis, ReasoningStep, HypothesisFalsification } from "../types";

/**
 * Generates dynamic Reasoning Trace for a given hypothesis and telemetry state.
 */
export function getHypothesisReasoningTrace(
  hyp: Hypothesis,
  _telemetryIntegrity: number,
  isResolved: boolean
): ReasoningStep[] {
  if (hyp.id.includes("A") || hyp.name.toLowerCase().includes("credential")) {
    return [
      {
        stepNumber: 1,
        type: "OBSERVED",
        title: "OBSERVED VPN AUTHENTICATION",
        description: "WS-041 authenticated using svc_logistics credentials from authorized external gateway IP.",
        evidenceId: "AUTH-1832",
        isConfirmed: true,
      },
      {
        stepNumber: 2,
        type: "OBSERVED",
        title: "OBSERVED SMB CONNECTION",
        description: "WS-041 established SMB connection to LOG-SRV-12 over port 445.",
        evidenceId: "NET-8841",
        isConfirmed: true,
      },
      {
        stepNumber: 3,
        type: "SUPPORTED",
        title: "SUPPORTED LATERAL MOVEMENT PATTERN",
        description: "Activity pattern is consistent with cross-boundary credential reuse & lateral movement.",
        evidenceId: "PROC-9012",
        isConfirmed: true,
      },
      {
        stepNumber: 4,
        type: "UNRESOLVED",
        title: isResolved ? "RESTORED PRIVILEGED TELEMETRY" : "UNRESOLVED PRIVILEGED AUTHENTICATION",
        description: isResolved
          ? "DC-03 Kerberos ticket grant logs restored — svc_admin privileged session verified from WS-041."
          : "Privileged authentication telemetry from DC-03 is missing during the 14:34–14:37 UTC gap.",
        evidenceId: isResolved ? "DC-03-AUTH" : undefined,
        isConfirmed: isResolved,
      },
      {
        stepNumber: 5,
        type: "CURRENT_ASSESSMENT",
        title: "CURRENT ASSESSMENT",
        description: isResolved
          ? "Credential compromise is STRONGLY SUPPORTED (91% confidence). Support is not confirmation of exfiltration."
          : "Credential compromise remains the LEADING EXPLANATION (78% confidence). It is NOT confirmed.",
        isConfirmed: false,
      },
    ];
  } else if (hyp.id.includes("B") || hyp.name.toLowerCase().includes("malware")) {
    return [
      {
        stepNumber: 1,
        type: "OBSERVED",
        title: "OBSERVED POWERSHELL EXECUTION",
        description: "PowerShell script execution detected on LOG-SRV-12.",
        evidenceId: "PROC-9012",
        isConfirmed: true,
      },
      {
        stepNumber: 2,
        type: "SUPPORTED",
        title: "PLAUSIBLE MALWARE PROPAGATION",
        description: "SMB traffic could facilitate payload delivery across logistics subnet.",
        evidenceId: "NET-8841",
        isConfirmed: false,
      },
      {
        stepNumber: 3,
        type: "UNRESOLVED",
        title: "UNVERIFIED MEMORY INJECTION",
        description: "No endpoint memory dump available to confirm shellcode injection.",
        isConfirmed: false,
      },
      {
        stepNumber: 4,
        type: "CURRENT_ASSESSMENT",
        title: "CURRENT ASSESSMENT",
        description: "Malware introduction remains a PLAUSIBLE EXPLANATION (54% confidence). Requires endpoint memory audit.",
        isConfirmed: false,
      },
    ];
  } else {
    return [
      {
        stepNumber: 1,
        type: "OBSERVED",
        title: "OBSERVED LEGITIMATE CREDENTIAL ACCESS",
        description: "Account svc_logistics operated within normal scheduled window.",
        evidenceId: "AUTH-1832",
        isConfirmed: true,
      },
      {
        stepNumber: 2,
        type: "UNRESOLVED",
        title: "ATYPICAL CROSS-HOST ACCESS",
        description: "Cross-host SMB access to LOG-SRV-12 is atypical for backup user profile.",
        evidenceId: "NET-8841",
        isConfirmed: false,
      },
      {
        stepNumber: 3,
        type: "CURRENT_ASSESSMENT",
        title: "CURRENT ASSESSMENT",
        description: "Insider credential misuse is WEAK (31% confidence). Lacks corroborating policy violation logs.",
        isConfirmed: false,
      },
    ];
  }
}

/**
 * Generates dynamic "What Would Change The Assessment?" (Counterfactuals) for a hypothesis.
 */
export function getHypothesisFalsification(
  hyp: Hypothesis,
  _isResolved: boolean
): HypothesisFalsification {
  if (hyp.id.includes("A") || hyp.name.toLowerCase().includes("credential")) {
    return {
      wouldStrengthen: [
        "✓ Privileged authentication log from WS-041 on DC-03",
        "✓ Credential reuse evidence across secondary subnet hosts",
        "✓ Matching account activity timestamped during lateral movement",
      ],
      wouldWeaken: [
        "× No privileged authentication from WS-041 found on DC-03",
        "× Evidence showing an alternate access path (e.g. direct physical console)",
        "× Contradictory account activity on DC-03 from a different subnet IP",
      ],
      mostDecisiveEvidence: "DC-03 privileged authentication logs",
      targetLogSource: "DC-03 Security Audit Log",
    };
  } else if (hyp.id.includes("B") || hyp.name.toLowerCase().includes("malware")) {
    return {
      wouldStrengthen: [
        "✓ Memory dump artifacts containing known shellcode on LOG-SRV-12",
        "✓ Process auditing logs proving unauthorized diagnostic script execution",
        "✓ Outbound C2 network beaconing packets detected on firewall",
      ],
      wouldWeaken: [
        "× Process auditing proving PowerShell executed only legitimate admin script",
        "× Memory forensics showing zero shellcode or token duplication",
        "× Absence of any known malware signature across all subnet endpoints",
      ],
      mostDecisiveEvidence: "LOG-SRV-12 Memory Forensics & Process Audit",
      targetLogSource: "LOG-SRV-12 Endpoint Monitor",
    };
  } else {
    return {
      wouldStrengthen: [
        "✓ Badge access logs proving authorized user was physically at WS-041",
        "✓ Off-hours database export queries logged under svc_logistics profile",
        "✓ USB mass-storage insertion event on WS-041",
      ],
      wouldWeaken: [
        "× Physical badge logs proving user was absent during remote login",
        "× Evidence of external VPN IP origin disproving local employee workstation",
        "× HR access review showing user had zero privilege escalation rights",
      ],
      mostDecisiveEvidence: "Physical Badge Access & HR Audit Logs",
      targetLogSource: "Security & HR Logs",
    };
  }
}

/**
 * Derives the complete SimulationState from base parameters.
 */
export function deriveSimulationState(params: {
  activeScenario: "alpha" | "bravo" | "charlie";
  telemetryIntegrity: number; // 100, 70, 40
  investigatedLogs: string[]; // List of recommendation IDs resolved
  presentationMode: boolean;
  demoStep: number;
  isDemoActive: boolean;
  selectedHypothesisId: string;
  liveEventsBuffer?: any[];
  recentEvents?: any[];
  archivedEvents?: any[];
  isStreamPaused?: boolean;
  currentTimeStr?: string;
  incidentStartTimeStr?: string;
}): SimulationState {
  const {
    activeScenario,
    telemetryIntegrity,
    investigatedLogs,
    presentationMode,
    demoStep,
    isDemoActive,
    selectedHypothesisId,
    liveEventsBuffer = [],
    recentEvents = [],
    archivedEvents = [],
    isStreamPaused = false,
    currentTimeStr = new Date().toLocaleTimeString("en-US", { hour12: false }) + " IST",
    incidentStartTimeStr = "14:41:02 IST"
  } = params;

  const scenario = SCENARIOS[activeScenario];
  
  let stateKey: 100 | 70 | 40 | "40_resolved" = telemetryIntegrity as any;
  const isResolved = isRecommendationResolved(activeScenario, investigatedLogs);
  if (telemetryIntegrity === 40 && isResolved) {
    stateKey = "40_resolved";
  }

  const sData = scenario.states[stateKey];
  const events = sData.events;
  
  // Enrich hypotheses with reasoning trace and falsification data
  const hypotheses: Hypothesis[] = sData.hypotheses.map(hyp => ({
    ...hyp,
    reasoningTrace: getHypothesisReasoningTrace(hyp, telemetryIntegrity, isResolved),
    falsification: getHypothesisFalsification(hyp, isResolved)
  }));
  
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
    liveEventsBuffer,
    recentEvents,
    archivedEvents,
    isStreamPaused,
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
    isDemoActive,
    currentTimeStr,
    incidentStartTimeStr
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
