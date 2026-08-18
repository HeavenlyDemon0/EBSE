import React, { useState, useEffect } from "react";
import { SimulationProvider, useSimulation } from "./context/SimulationContext";
import { EntryScreen } from "./components/shell/EntryScreen";
import { AppShell } from "./components/shell/AppShell";
import { Dashboard } from "./components/command-center/Dashboard";
import { InvestigationView } from "./components/investigation/InvestigationView";
import { EvidenceView } from "./components/evidence/EvidenceView";
import { HypothesesView } from "./components/hypotheses/HypothesesView";
import { SystemView } from "./components/system/SystemView";

// Evidence Arrival Toast Notification
const EvidenceArrivalToast: React.FC = () => {
  const { activeResolvedEvent } = useSimulation();
  const [visible, setVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(activeResolvedEvent);

  useEffect(() => {
    if (activeResolvedEvent && activeResolvedEvent !== currentEvent) {
      setCurrentEvent(activeResolvedEvent);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [activeResolvedEvent]);

  if (!visible || !currentEvent) return null;

  return (
    <div className="fixed top-20 right-6 z-50 w-80 bg-cyber-surface border border-cyber-green/50 shadow-2xl shadow-cyber-green/10 animate-evidence-arrive">
      <div className="h-0.5 w-full bg-cyber-green" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          <span className="font-mono text-[10px] text-cyber-green font-bold uppercase tracking-widest">
            NEW EVIDENCE RECEIVED
          </span>
        </div>
        <div className="space-y-1.5 font-mono text-[11px] text-cyber-muted">
          <div><span className="text-cyber-muted/60">SOURCE</span> <strong className="text-white ml-2">{currentEvent.source}</strong></div>
          <div><span className="text-cyber-muted/60">EVENT</span> <strong className="text-white ml-2">{currentEvent.type}</strong></div>
          <div><span className="text-cyber-muted/60">TIME</span> <strong className="text-white ml-2">{currentEvent.timestamp} UTC</strong></div>
          <div><span className="text-cyber-muted/60">STATUS</span> <strong className="text-cyber-green ml-2">VERIFIED</strong></div>
        </div>
        <div className="mt-3 pt-3 border-t border-cyber-border/40 text-[10px] text-cyber-muted font-sans leading-relaxed">
          {currentEvent.description}
        </div>
        <div className="mt-2 flex gap-3 font-mono text-[10px]">
          <span className="text-cyber-cyan">↑ Hypothesis A Confidence</span>
          <span className="text-cyber-amber">↓ Evidence Debt</span>
        </div>
      </div>
      <button 
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-cyber-muted hover:text-white text-xs font-mono px-1"
      >✕</button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { activeView } = useSimulation();
  const [hasEntered, setHasEntered] = useState<boolean>(false);

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
