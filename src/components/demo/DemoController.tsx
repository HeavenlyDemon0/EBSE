import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import { ChevronRight, ChevronLeft, RotateCcw, X } from "lucide-react";

const PHASES = [
  {
    n: 1,
    phase: "01 / 04",
    title: "Baseline State",
    action: "Evidence at 100% · 1 Hypothesis · Debt: 8",
    narrative: "Under complete telemetry, EBHE maintains a single high-confidence hypothesis. Evidence Debt is low — assessment is well-supported.",
    speech: "Under full telemetry, EBHE confirms one dominant narrative. Evidence Debt is only 8 — nearly no unresolved uncertainty."
  },
  {
    n: 2,
    phase: "02 / 04",
    title: "Simulate Evidence Loss",
    action: "→ Telemetry drops to 40%",
    narrative: "A sensor failure drops telemetry to 40%. EBHE does not invent the missing events. Evidence Debt spikes. Hypotheses multiply.",
    speech: "Three hypotheses now survive. Debt rose from 8 to 67. The system did not guess what happened during the gap — it held the uncertainty."
  },
  {
    n: 3,
    phase: "03 / 04",
    title: "Investigate Evidence",
    action: "→ Click INVESTIGATE EVIDENCE",
    narrative: "EBHE recommends the evidence most likely to resolve the ambiguity: Domain Controller authentication logs (gain: 0.82).",
    speech: "We request the DC-03 logs. The system waits 1.5 seconds — simulating retrieval from an air-gapped audit server. Watch Evidence Debt drop."
  },
  {
    n: 4,
    phase: "04 / 04",
    title: "Assessment Recalculated",
    action: "→ Hypothesis confidence updated",
    narrative: "Privilege escalation confirmed. Hypothesis A rises to 91%. Evidence Debt falls from 67 to 21. One uncertainty remains: data staging.",
    speech: "EBHE did not guess. It held the uncertainty, recommended the evidence, and updated when that evidence arrived. One gap remains — explicitly named."
  }
];

export const DemoController: React.FC = () => {
  const { state, setDemoStep, resetDemo, setDemoActive, investigateLog, isSimulatingInvestigation } = useSimulation();

  if (!state.isDemoActive) return null;

  // Map 4 phases to internal steps: 1→1, 2→2, 3→5 (investigate), 4→7 (final)
  const phaseToStep = [1, 2, 5, 7];
  const currentPhaseIdx = Math.max(0, Math.min(3,
    state.demoStep <= 1 ? 0
    : state.demoStep <= 4 ? 1
    : state.demoStep <= 6 ? 2
    : 3
  ));
  const phase = PHASES[currentPhaseIdx];

  const goNext = async () => {
    const nextPhaseIdx = currentPhaseIdx + 1;
    if (nextPhaseIdx >= PHASES.length) return;

    // On phase 3 (investigate), auto-trigger investigation
    if (currentPhaseIdx === 2) {
      const rec = state.recommendedEvidence[0];
      if (rec && !state.investigatedLogs.includes(rec.id) && state.telemetryIntegrity === 40) {
        await investigateLog(rec.id);
      }
    }

    const targetStep = phaseToStep[nextPhaseIdx];
    setDemoStep(targetStep);
  };

  const goPrev = () => {
    const prevPhaseIdx = currentPhaseIdx - 1;
    if (prevPhaseIdx < 0) return;
    setDemoStep(phaseToStep[prevPhaseIdx]);
  };

  const isLastPhase = currentPhaseIdx >= PHASES.length - 1;
  const isFirstPhase = currentPhaseIdx === 0;

  return (
    <div className="border border-cyber-amber/30 bg-cyber-surface relative animate-drop-in">
      <div className="h-0.5 w-full bg-gradient-to-r from-cyber-amber via-cyber-amber/50 to-transparent" />

      <div className="p-4 flex flex-col lg:flex-row items-start gap-4">

        {/* Phase indicator + content */}
        <div className="flex-1 min-w-0">

          {/* Phase tabs */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {PHASES.map((p, i) => (
              <button
                key={i}
                onClick={() => setDemoStep(phaseToStep[i])}
                className={`font-mono text-[9px] px-2.5 py-1 border cursor-pointer transition-all uppercase tracking-wider ${i === currentPhaseIdx
                  ? "border-cyber-amber bg-cyber-amber/15 text-cyber-amber font-black"
                  : i < currentPhaseIdx
                  ? "border-cyber-green/40 bg-cyber-green/5 text-cyber-green/70"
                  : "border-cyber-border text-cyber-muted/60 hover:border-cyber-muted hover:text-cyber-muted"}`}
              >
                {p.phase} {p.title}
              </button>
            ))}
          </div>

          {/* Current phase detail */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-cyber-amber font-black">{phase.action}</span>
            </div>
            <p className="text-[11px] text-cyber-text/85 font-sans leading-relaxed max-w-3xl">{phase.narrative}</p>
            <div className="flex items-start gap-2 border-l-2 border-cyber-green/40 pl-3 py-1">
              <span className="font-mono text-[8px] text-cyber-green font-bold uppercase shrink-0 mt-0.5">SAY:</span>
              <p className="font-sans text-[10px] text-cyber-green/80 italic leading-relaxed">"{phase.speech}"</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
          <button
            onClick={goPrev}
            disabled={isFirstPhase || isSimulatingInvestigation}
            className="p-2 border border-cyber-border text-cyber-muted hover:text-white hover:border-cyber-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isLastPhase ? (
            <button
              onClick={goNext}
              disabled={isSimulatingInvestigation}
              className="flex items-center gap-2 px-5 py-2 bg-cyber-amber text-cyber-bg font-black text-[11px] uppercase tracking-wider cursor-pointer hover:bg-cyber-amber/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSimulatingInvestigation ? (
                <><span className="w-3 h-3 border-2 border-cyber-bg border-t-transparent rounded-full animate-spin" />RETRIEVING</>
              ) : currentPhaseIdx === 2 ? (
                <>INVESTIGATE & CONTINUE <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>NEXT PHASE <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="font-mono text-[10px] text-cyber-green font-bold border border-cyber-green/30 bg-cyber-green/5 px-4 py-2">
                ✓ DEMO COMPLETE
              </div>
              <button onClick={resetDemo} className="font-mono text-[9px] text-cyber-muted hover:text-white cursor-pointer underline">
                RESET DEMO
              </button>
            </div>
          )}

          <button onClick={resetDemo} title="Reset" className="p-2 border border-cyber-border text-cyber-muted hover:text-white transition-all cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDemoActive(false)}
            className="p-2 border border-cyber-red/30 text-cyber-red/60 hover:bg-cyber-red hover:text-white hover:border-cyber-red transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
