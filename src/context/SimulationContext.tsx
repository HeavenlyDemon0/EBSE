import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import type { SimulationState, EvidenceEvent } from "../types";
import { deriveSimulationState, isRecommendationResolved } from "../engine/simulation";

interface SimulationContextProps {
  state: SimulationState;
  activeView: "command-center" | "investigation" | "evidence" | "hypotheses" | "system";
  isSimulatingInvestigation: boolean;
  activeResolvedEvent: EvidenceEvent | null;
  setActiveView: (view: "command-center" | "investigation" | "evidence" | "hypotheses" | "system") => void;
  setTelemetryIntegrity: (level: number) => void;
  switchScenario: (id: "alpha" | "bravo" | "charlie") => void;
  investigateLog: (recId: string) => Promise<void>;
  restoreDelayedEvidence: () => Promise<void>;
  resetDemo: () => void;
  setDemoActive: (active: boolean) => void;
  setDemoStep: (step: number) => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  setPresentationMode: (mode: boolean) => void;
  setSelectedHypothesisId: (id: string) => void;
}

const SimulationContext = createContext<SimulationContextProps | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScenario, setActiveScenario] = useState<"alpha" | "bravo" | "charlie">("alpha");
  const [telemetryIntegrity, setTelemetryIntegrityState] = useState<number>(100);
  const [investigatedLogs, setInvestigatedLogs] = useState<string[]>([]);
  const [presentationMode, setPresentationModeState] = useState<boolean>(false);
  const [demoStep, setDemoStepState] = useState<number>(1);
  const [isDemoActive, setIsDemoActiveState] = useState<boolean>(false);
  const [selectedHypothesisId, setSelectedHypothesisIdState] = useState<string>("");
  const [activeView, setActiveViewState] = useState<"command-center" | "investigation" | "evidence" | "hypotheses" | "system">("command-center");
  const [isSimulatingInvestigation, setIsSimulatingInvestigation] = useState<boolean>(false);
  const [activeResolvedEvent, setActiveResolvedEvent] = useState<EvidenceEvent | null>(null);

  // Set default selected hypothesis when scenario changes
  useEffect(() => {
    if (activeScenario === "alpha") setSelectedHypothesisIdState("hyp_alpha_A");
    else if (activeScenario === "bravo") setSelectedHypothesisIdState("hyp_bravo_A");
    else if (activeScenario === "charlie") setSelectedHypothesisIdState("hyp_charlie_A");
  }, [activeScenario]);

  // Derive global simulation state
  const derivedState = useMemo(() => {
    return deriveSimulationState({
      activeScenario,
      telemetryIntegrity,
      investigatedLogs,
      presentationMode,
      demoStep,
      isDemoActive,
      selectedHypothesisId
    });
  }, [activeScenario, telemetryIntegrity, investigatedLogs, presentationMode, demoStep, isDemoActive, selectedHypothesisId]);

  // Set active resolved event if state is resolved
  useEffect(() => {
    if (telemetryIntegrity === 40 && isRecommendationResolved(activeScenario, investigatedLogs)) {
      if (activeScenario === "alpha") {
        setActiveResolvedEvent({
          id: "DC-03-AUTH",
          timestamp: "14:36:02",
          type: "AUTH",
          source: "DC-03",
          description: "Privileged authentication: account 'svc_admin' verified from WS-041",
          status: "verified",
          reliability: 0.98,
          details: "Authentication type: Kerberos TGT request. User: svc_admin. Source IP: WS-041. Status: Success."
        });
      } else if (activeScenario === "bravo") {
        setActiveResolvedEvent({
          id: "NET-5512-RESTORED",
          timestamp: "15:04:40",
          type: "NETWORK",
          source: "WS-082",
          destination: "LOG-SRV-14",
          description: "SMB session verified: Authentication success for administrator account",
          status: "verified",
          reliability: 0.94,
          details: "Session duration: 18 seconds. Transferred: 1.2MB. Port: 445. Status: Success."
        });
      } else if (activeScenario === "charlie") {
        setActiveResolvedEvent({
          id: "DATA-9902-RESTORED",
          timestamp: "23:44:05",
          type: "DATA",
          source: "DB-SRV-01",
          description: "Query audit success: SELECT ALL FROM log_routing_table. 18.4GB retrieved.",
          status: "verified",
          reliability: 0.94,
          details: "Client IP: 10.92.10.42. Database: logistics_db. Query duration: 184 seconds. Rows affected: 450,000. Privilege level: DBA."
        });
      }
    } else {
      setActiveResolvedEvent(null);
    }
  }, [telemetryIntegrity, investigatedLogs, activeScenario]);

  const setTelemetryIntegrity = (level: number) => {
    setTelemetryIntegrityState(level);
    // If telemetry integrity changes, reset investigation if setting back to 100 or 70
    if (level !== 40) {
      setInvestigatedLogs([]);
    }
  };

  const switchScenario = (id: "alpha" | "bravo" | "charlie") => {
    setActiveScenario(id);
    setInvestigatedLogs([]);
    setTelemetryIntegrityState(100);
    setDemoStepState(1);
    setIsDemoActiveState(false);
    setActiveViewState("command-center");
  };

  const investigateLog = async (recId: string) => {
    setIsSimulatingInvestigation(true);
    // Simulate latency of retrieving telemetry from air-gapped system
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setInvestigatedLogs((prev) => [...prev, recId]);
    setIsSimulatingInvestigation(false);
  };

  const restoreDelayedEvidence = async () => {
    setIsSimulatingInvestigation(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const token = activeScenario === "alpha" ? "RESTORED_DC" : activeScenario === "bravo" ? "RESTORED_FW" : "RESTORED_DB";
    setInvestigatedLogs((prev) => [...prev, token]);
    setIsSimulatingInvestigation(false);
  };

  const resetDemo = () => {
    setTelemetryIntegrityState(100);
    setInvestigatedLogs([]);
    setDemoStepState(1);
    setIsDemoActiveState(false);
    setActiveViewState("command-center");
    if (activeScenario === "alpha") setSelectedHypothesisIdState("hyp_alpha_A");
    else if (activeScenario === "bravo") setSelectedHypothesisIdState("hyp_bravo_A");
    else if (activeScenario === "charlie") setSelectedHypothesisIdState("hyp_charlie_A");
  };

  const setDemoActive = (active: boolean) => {
    setIsDemoActiveState(active);
    if (active) {
      resetDemo();
      setIsDemoActiveState(true); // resetDemo turns it off, so enable it explicitly
    }
  };

  const setDemoStep = (step: number) => {
    setDemoStepState(step);
    applyDemoStepEffects(step);
  };

  const nextDemoStep = () => {
    if (demoStep < 7) {
      const nextStep = demoStep + 1;
      setDemoStepState(nextStep);
      applyDemoStepEffects(nextStep);
    }
  };

  const prevDemoStep = () => {
    if (demoStep > 1) {
      const prevStep = demoStep - 1;
      setDemoStepState(prevStep);
      applyDemoStepEffects(prevStep);
    }
  };

  const applyDemoStepEffects = (step: number) => {
    switch (step) {
      case 1: // Baseline
        setTelemetryIntegrityState(100);
        setInvestigatedLogs([]);
        setActiveViewState("command-center");
        break;
      case 2: // Telemetry Loss
        setTelemetryIntegrityState(40);
        setInvestigatedLogs([]);
        setActiveViewState("command-center");
        break;
      case 3: // Show Uncertainty
        setTelemetryIntegrityState(40);
        setInvestigatedLogs([]);
        setActiveViewState("command-center");
        // Open leading hypothesis details (default)
        break;
      case 4: // Ask what to check
        setTelemetryIntegrityState(40);
        setInvestigatedLogs([]);
        setActiveViewState("command-center");
        break;
      case 5: // Simulate Investigate (Triggered on UI or auto-triggered on next step)
        // Show loading state, but let them trigger or auto resolve on next
        break;
      case 6: // Reasoning Update
        setTelemetryIntegrityState(40);
        // Force the resolved log injection
        const token = activeScenario === "alpha" ? "rec_alpha_40_1" : activeScenario === "bravo" ? "rec_bravo_40_1" : "rec_charlie_40_1";
        setInvestigatedLogs([token]);
        setActiveViewState("investigation"); // Navigate to see the attack graph update!
        break;
      case 7: // Final Assessment
        setTelemetryIntegrityState(40);
        setActiveViewState("command-center");
        break;
      default:
        break;
    }
  };

  const setPresentationMode = (mode: boolean) => {
    setPresentationModeState(mode);
  };

  const setSelectedHypothesisId = (id: string) => {
    setSelectedHypothesisIdState(id);
  };

  const setActiveView = (view: "command-center" | "investigation" | "evidence" | "hypotheses" | "system") => {
    setActiveViewState(view);
  };

  return (
    <SimulationContext.Provider
      value={{
        state: derivedState,
        activeView,
        isSimulatingInvestigation,
        activeResolvedEvent,
        setActiveView,
        setTelemetryIntegrity,
        switchScenario,
        investigateLog,
        restoreDelayedEvidence,
        resetDemo,
        setDemoActive,
        setDemoStep,
        nextDemoStep,
        prevDemoStep,
        setPresentationMode,
        setSelectedHypothesisId
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};
