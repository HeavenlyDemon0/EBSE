import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface InvestigateSequenceProps {
  active: boolean;
}

const PHASES = [
  { label: "REQUESTING EVIDENCE", color: "text-cyber-cyan" },
  { label: "TELEMETRY RECEIVED", color: "text-cyber-green" },
  { label: "VERIFYING", color: "text-cyber-amber" },
  { label: "HYPOTHESES UPDATED", color: "text-cyber-green" },
];

export const InvestigateSequence: React.FC<InvestigateSequenceProps> = ({ active }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setCurrentPhase(0);
      setDone(false);
      return;
    }

    setCurrentPhase(0);
    setDone(false);

    const timings = [0, 400, 850, 1200];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setCurrentPhase(i), delay)
    );
    const doneTimer = setTimeout(() => setDone(true), 1600);

    return () => { timers.forEach(clearTimeout); clearTimeout(doneTimer); };
  }, [active]);

  if (!active && !done) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-cyber-surface border border-cyber-border shadow-2xl px-5 py-3 flex items-center gap-4">
        {PHASES.map((phase, i) => {
          const isActive = i === currentPhase && active;
          const isComplete = (active && i < currentPhase) || (!active && done);
          return (
            <React.Fragment key={phase.label}>
              <div className={`flex items-center gap-2 font-mono text-[10px] transition-all duration-300 ${isActive ? phase.color + " font-black" : isComplete ? "text-cyber-green/60" : "text-cyber-border"}`}>
                {isComplete ? (
                  <CheckCircle2 className="w-3 h-3 text-cyber-green/60 shrink-0" />
                ) : isActive ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-current opacity-30 shrink-0" />
                )}
                {phase.label}
              </div>
              {i < PHASES.length - 1 && (
                <span className="text-cyber-border text-[10px]">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
