import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import type { SimulationState, EvidenceEvent } from "../types";
import { deriveSimulationState, isRecommendationResolved } from "../engine/simulation";
import { generateNextSyntheticEvent } from "../engine/telemetryGenerator";

interface SimulationContextProps {
  state: SimulationState;
  activeView: "command-center" | "investigation" | "evidence" | "hypotheses" | "system";
  isSimulatingInvestigation: boolean;
  activeResolvedEvent: EvidenceEvent | null;
  isReasoningTraceOpen: boolean;
  selectedReasoningHypothesisId: string | null;
  selectedSourceEvidenceId: string | null;
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
  togglePauseStream: () => void;
  clearLiveBuffer: () => void;
  openReasoningTrace: (hypId?: string) => void;
  closeReasoningTrace: () => void;
  setSelectedSourceEvidenceId: (id: string | null) => void;
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

  // Live telemetry stream state
  const [isStreamPaused, setIsStreamPaused] = useState<boolean>(false);
  const [liveEventsBuffer, setLiveEventsBuffer] = useState<EvidenceEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<EvidenceEvent[]>([]);
  const [archivedEvents, setArchivedEvents] = useState<EvidenceEvent[]>([]);
  
  // Real-time clock state
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  const [incidentStartTimeStr, setIncidentStartTimeStr] = useState<string>("");

  // Feature #1: Reasoning Trace Drawer State
  const [isReasoningTraceOpen, setIsReasoningTraceOpen] = useState<boolean>(false);
  const [selectedReasoningHypothesisId, setSelectedReasoningHypothesisId] = useState<string | null>(null);
  const [selectedSourceEvidenceId, setSelectedSourceEvidenceId] = useState<string | null>(null);

  // Initialize clock and initial seeds
  useEffect(() => {
    const formatTime = () => {
      const now = new Date();
      return now.toLocaleTimeString("en-US", { hour12: false }) + " IST";
    };
    const nowStr = formatTime();
    setCurrentTimeStr(nowStr);
    setIncidentStartTimeStr(nowStr);

    const clockInterval = setInterval(() => {
      setCurrentTimeStr(formatTime());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Continuous synthetic telemetry engine (1 event per second)
  useEffect(() => {
    if (isStreamPaused) return;

    const streamInterval = setInterval(() => {
      const isLossActive = telemetryIntegrity === 40;
      const newEvt = generateNextSyntheticEvent(telemetryIntegrity, isLossActive);

      setLiveEventsBuffer((prev) => {
        const updated = [newEvt, ...prev];
        // Keep max 40 in live buffer (approx 40 seconds)
        if (updated.length > 40) {
          const agingOut = updated.slice(40);
          setRecentEvents((prevRecent) => {
            const newRecent = [...agingOut, ...prevRecent];
            if (newRecent.length > 50) {
              const toArchive = newRecent.slice(50);
              setArchivedEvents((prevArch) => [...toArchive, ...prevArch].slice(0, 200));
              return newRecent.slice(0, 50);
            }
            return newRecent;
          });
          return updated.slice(0, 40);
        }
        return updated;
      });
    }, 1200);

    return () => clearInterval(streamInterval);
  }, [isStreamPaused, telemetryIntegrity]);

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
      selectedHypothesisId,
      liveEventsBuffer,
      recentEvents,
      archivedEvents,
      isStreamPaused,
      currentTimeStr,
      incidentStartTimeStr
    });
  }, [
    activeScenario,
    telemetryIntegrity,
    investigatedLogs,
    presentationMode,
    demoStep,
    isDemoActive,
    selectedHypothesisId,
    liveEventsBuffer,
    recentEvents,
    archivedEvents,
    isStreamPaused,
    currentTimeStr,
    incidentStartTimeStr
  ]);

  // Set active resolved event if state is resolved
  useEffect(() => {
    if (telemetryIntegrity === 40 && isRecommendationResolved(activeScenario, investigatedLogs)) {
      if (activeScenario === "alpha") {
        setActiveResolvedEvent({
          id: "DC-03-AUTH",
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          type: "AUTH",
          source: "DC-03",
          account: "svc_admin",
          description: "Privileged authentication: account 'svc_admin' verified from WS-041",
          status: "verified",
          reliability: 0.98,
          details: "Authentication type: Kerberos TGT request. User: svc_admin. Source IP: WS-041. Status: Success."
        });
      } else if (activeScenario === "bravo") {
        setActiveResolvedEvent({
          id: "NET-5512-RESTORED",
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          type: "NETWORK",
          source: "WS-082",
          destination: "LOG-SRV-14",
          account: "administrator",
          description: "SMB session verified: Authentication success for administrator account",
          status: "verified",
          reliability: 0.94,
          details: "Session duration: 18 seconds. Transferred: 1.2MB. Port: 445. Status: Success."
        });
      } else if (activeScenario === "charlie") {
        setActiveResolvedEvent({
          id: "DATA-9902-RESTORED",
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          type: "DATA",
          source: "DB-SRV-01",
          account: "svc_batch",
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
    setLiveEventsBuffer([]);
    setIsStreamPaused(false);
  };

  const setDemoActive = (active: boolean) => {
    setIsDemoActiveState(active);
    if (active) {
      resetDemo();
      setIsDemoActiveState(true);
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
      case 1:
        setTelemetryIntegrityState(100);
        setInvestigatedLogs([]);
        setActiveViewState("command-center");
        break;
      case 2:
        setTelemetryIntegrityState(40);
        setInvestigatedLogs([]);
        setActiveViewState("command-center");
        break;
      case 3:
        setTelemetryIntegrityState(40);
        setInvestigatedLogs([]);
        setActiveViewState("command-center");
        break;
      case 4:
        setTelemetryIntegrityState(40);
        setInvestigatedLogs([]);
        setActiveViewState("command-center");
        break;
      case 5:
        break;
      case 6:
        setTelemetryIntegrityState(40);
        const token = activeScenario === "alpha" ? "rec_alpha_40_1" : activeScenario === "bravo" ? "rec_bravo_40_1" : "rec_charlie_40_1";
        setInvestigatedLogs([token]);
        setActiveViewState("investigation");
        break;
      case 7:
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

  const togglePauseStream = () => {
    setIsStreamPaused((prev) => !prev);
  };

  const clearLiveBuffer = () => {
    setLiveEventsBuffer([]);
  };

  const openReasoningTrace = (hypId?: string) => {
    const targetId = hypId || selectedHypothesisId || derivedState.activeHypotheses[0]?.id;
    setSelectedReasoningHypothesisId(targetId);
    setIsReasoningTraceOpen(true);
  };

  const closeReasoningTrace = () => {
    setIsReasoningTraceOpen(false);
    setSelectedSourceEvidenceId(null);
  };

  return (
    <SimulationContext.Provider
      value={{
        state: derivedState,
        activeView,
        isSimulatingInvestigation,
        activeResolvedEvent,
        isReasoningTraceOpen,
        selectedReasoningHypothesisId,
        selectedSourceEvidenceId,
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
        setSelectedHypothesisId,
        togglePauseStream,
        clearLiveBuffer,
        openReasoningTrace,
        closeReasoningTrace,
        setSelectedSourceEvidenceId
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
