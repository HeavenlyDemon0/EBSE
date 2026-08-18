import React, { useState, useEffect, useRef } from "react";
import { SimulationProvider, useSimulation } from "./context/SimulationContext";
import { EntryScreen } from "./components/shell/EntryScreen";
import { AppShell } from "./components/shell/AppShell";
import { Dashboard } from "./components/command-center/Dashboard";
import { InvestigationView } from "./components/investigation/InvestigationView";
import { EvidenceView } from "./components/evidence/EvidenceView";
import { HypothesesView } from "./components/hypotheses/HypothesesView";
import { SystemView } from "./components/system/SystemView";
import { TelemetryLossBanner } from "./components/ui/TelemetryLossBanner";
import { InvestigateSequence } from "./components/ui/InvestigateSequence";

// Evidence Arrival Toast — fires when investigation resolves
const EvidenceArrivalToast: React.FC = () => {
  const { activeResolvedEvent } = useSimulation();
  const [visible, setVisible] = useState(false);
  const prevEventId = useRef<string | null>(null);

  useEffect(() => {
    if (activeResolvedEvent && activeResolvedEvent.id !== prevEventId.current) {
      prevEventId.current = activeResolvedEvent.id;
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 7000);
      return () => clearTimeout(timer);
    }
    if (!activeResolvedEvent) prevEventId.current = null;
  }, [activeResolvedEvent]);

  if (!visible || !activeResolvedEvent) return null;

  return (
    <div className="fixed top-16 right-5 z-50 w-80 bg-cyber-surface border border-cyber-green shadow-2xl shadow-cyber-green/10 animate-evidence-arrive">
      <div className="h-0.5 w-full bg-cyber-green" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-cyber-green" />
          <span className="font-mono text-[10px] text-cyber-green font-black uppercase tracking-widest">
            NEW EVIDENCE RECEIVED
          </span>
        </div>
        <div className="space-y-1.5 font-mono text-[10px]">
          <div><span className="text-cyber-muted/70 w-20 inline-block">SOURCE</span> <strong className="text-white">{activeResolvedEvent.source}</strong></div>
          <div><span className="text-cyber-muted/70 w-20 inline-block">EVENT</span> <strong className="text-white">{activeResolvedEvent.type}</strong></div>
          <div><span className="text-cyber-muted/70 w-20 inline-block">TIME</span> <strong className="text-white">{activeResolvedEvent.timestamp} UTC</strong></div>
          <div><span className="text-cyber-muted/70 w-20 inline-block">STATUS</span> <strong className="text-cyber-green">VERIFIED</strong></div>
        </div>
        <div className="mt-3 pt-3 border-t border-cyber-border/40 text-[10px] font-sans text-cyber-muted leading-relaxed">
          {activeResolvedEvent.description}
        </div>
        <div className="mt-2.5 flex gap-4 font-mono text-[9px] font-bold">
          <span className="text-cyber-cyan">↑ Leading Hypothesis</span>
          <span className="text-cyber-green">↓ Evidence Debt</span>
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-cyber-muted hover:text-white font-mono text-xs px-1 cursor-pointer"
      >✕</button>
    </div>
  );
};

// Wrapper that has access to simulation state
const AppContent: React.FC = () => {
  const {
    state,
    activeView,
    isSimulatingInvestigation,
  } = useSimulation();

  const [hasEntered, setHasEntered] = useState(false);

  // Track telemetry loss banner
  const prevTelemetry = useRef(state.telemetryIntegrity);
  const [showLossBanner, setShowLossBanner] = useState(false);
  const [bannerDebtBefore, setBannerDebtBefore] = useState(8);
  const [bannerDebtAfter, setBannerDebtAfter] = useState(67);
  const bannerDismissed = useRef(false);

  useEffect(() => {
    if (
      prevTelemetry.current > 50 &&
      state.telemetryIntegrity <= 40 &&
      !bannerDismissed.current
    ) {
      setBannerDebtBefore(prevTelemetry.current === 100 ? 8 : 22);
      setBannerDebtAfter(state.evidenceDebt);
      setShowLossBanner(true);
      bannerDismissed.current = true;
    }
    if (state.telemetryIntegrity > 50) {
      bannerDismissed.current = false;
      setShowLossBanner(false);
    }
    prevTelemetry.current = state.telemetryIntegrity;
  }, [state.telemetryIntegrity, state.evidenceDebt]);

  if (!hasEntered) {
    return <EntryScreen onEnter={() => setHasEntered(true)} />;
  }

  const renderView = () => {
    switch (activeView) {
      case "command-center": return <Dashboard />;
      case "investigation":  return <InvestigationView />;
      case "evidence":       return <EvidenceView />;
      case "hypotheses":     return <HypothesesView />;
      case "system":         return <SystemView />;
      default:               return <Dashboard />;
    }
  };

  return (
    <>
      <AppShell>{renderView()}</AppShell>

      {/* Global overlay components */}
      <TelemetryLossBanner
        show={showLossBanner}
        hypothesisCount={state.activeHypotheses.length}
        debtBefore={bannerDebtBefore}
        debtAfter={bannerDebtAfter}
        onDismiss={() => setShowLossBanner(false)}
      />

      <InvestigateSequence active={isSimulatingInvestigation} />
      <EvidenceArrivalToast />
    </>
  );
};

function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}

export default App;
