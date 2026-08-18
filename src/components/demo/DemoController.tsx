import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import { ChevronRight, ChevronLeft, RotateCcw, X } from "lucide-react";

const DEMO_STEPS = [
  {
    n: 1,
    title: "Baseline Security State",
    action: "100% Telemetry / 1 Hypothesis / Debt: 8",
    narrative: "Evidence is complete. EBHE maintains one dominant, high-confidence hypothesis with minimal Evidence Debt.",
    speech: "Under full telemetry, EBHE precisely confirms a single attack narrative with 78% confidence."
  },
  {
    n: 2,
    title: "Simulate Telemetry Loss",
    action: "→ Drop to 40% Telemetry",
    narrative: "A network segment sensor failure drops telemetry to 40%. Watch as EBHE does not guess — it increases uncertainty.",
    speech: "Notice the timeline gap. The system does NOT fabricate missing events. Evidence Debt rises from 8 to 67."
  },
  {
    n: 3,
    title: "Inspect Uncertainty Gaps",
    action: "→ Review What We Know / Don't Know",
    narrative: "The 'What We Know' panel shows only verified facts. 'What We Don't Know' lists exact unresolved questions.",
    speech: "Every gap is explicitly named. EBHE knows what it doesn't know — and says so."
  },
  {
    n: 4,
    title: "Next Best Evidence",
    action: "→ Check Recommendations Panel",
    narrative: "EBHE scores each available evidence check by expected information gain — the ability to distinguish hypotheses.",
    speech: "Domain Controller logs score 0.82 — the highest gain. This is the evidence most likely to resolve the ambiguity."
  },
  {
    n: 5,
    title: "Request Evidence (Investigate)",
    action: "→ Click [ INVESTIGATE ] button",
    narrative: "Clicking INVESTIGATE simulates retrieval from the air-gapped audit server with a deliberate network delay.",
    speech: "The system requests the evidence. It does not act automatically. The operator remains in control."
  },
  {
    n: 6,
    title: "Reasoning Recalculation",
    action: "→ Hypothesis confidence updates",
    narrative: "DC-03 Kerberos authentication logs arrive and confirm privilege escalation. All hypotheses are re-evaluated.",
    speech: "Hypothesis A rises to 91%. Insider Misuse drops to 18%. Evidence Debt falls from 67 to 21. The attack graph updates."
  },
  {
    n: 7,
    title: "Final Assessment",
    action: "→ See investigation summary",
    narrative: "EBHE delivers a calibrated final assessment. One critical gap remains — data staging — clearly flagged for next action.",
    speech: "EBHE did not guess the missing event. It told us what was uncertain, recommended the check, and updated when facts arrived."
  }
];

export const DemoController: React.FC = () => {
  const { state, nextDemoStep, prevDemoStep, setDemoStep, resetDemo, setDemoActive, investigateLog, isSimulatingInvestigation } = useSimulation();

  if (!state.isDemoActive) return null;

  const step = DEMO_STEPS[state.demoStep - 1];

  const handleNext = async () => {
    if (state.demoStep === 5) {
      const rec = state.recommendedEvidence[0];
      if (rec && !state.investigatedLogs.includes(rec.id)) {
        await investigateLog(rec.id);
      }
    }
    nextDemoStep();
  };

  return (
    <div className="border border-cyber-amber/35 bg-cyber-surface relative mb-1 animate-drop-in">
      {/* Top accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-cyber-amber to-cyber-amber/30" />

      <div className="p-4 flex flex-col lg:flex-row items-start lg:items-center gap-4">

        {/* Step indicator + content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="status-pill border-cyber-amber/40 bg-cyber-amber/10 text-cyber-amber-text">
              GUIDED DEMO · STEP {state.demoStep} / 7
            </span>
            {/* Progress dots */}
            <div className="flex items-center gap-1">
              {DEMO_STEPS.map((_s, i) => (
                <button
                  key={i}
                  onClick={() => setDemoStep(i + 1)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${state.demoStep === i + 1 ? 'bg-cyber-amber scale-125' : i + 1 < state.demoStep ? 'bg-cyber-green/60' : 'bg-cyber-border hover:bg-cyber-muted'}`}
                />
              ))}
            </div>
            <span className="font-mono text-[9px] text-cyber-amber-text font-bold">→ {step.action}</span>
          </div>

          <h3 className="text-white text-sm font-black uppercase tracking-wide mb-1">{step.title}</h3>
          <p className="text-[11px] text-cyber-text/85 leading-relaxed font-sans mb-2 max-w-3xl">{step.narrative}</p>

          {/* Speech */}
          <div className="flex items-start gap-2 bg-cyber-bg/60 border-l-2 border-cyber-green/40 pl-3 py-1.5 pr-2">
            <span className="font-mono text-[8px] text-cyber-green font-bold uppercase tracking-wider shrink-0 mt-0.5">SAY:</span>
            <p className="font-sans text-[10px] text-cyber-green/80 italic leading-relaxed">" {step.speech} "</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
          <button
            onClick={prevDemoStep}
            disabled={state.demoStep === 1 || isSimulatingInvestigation}
            className="p-2 border border-cyber-border text-cyber-muted hover:text-white hover:border-cyber-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            disabled={state.demoStep === 7 || isSimulatingInvestigation}
            className="flex items-center gap-1.5 px-5 py-2 bg-cyber-amber text-cyber-bg font-black text-[11px] uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-cyber-amber/90 transition-all"
          >
            {isSimulatingInvestigation ? (
              <><span className="w-3 h-3 border-2 border-cyber-bg border-t-transparent rounded-full animate-spin" /> RETRIEVING...</>
            ) : state.demoStep === 5 ? "INVESTIGATE & NEXT" : (
              <>NEXT <ChevronRight className="w-4 h-4" /></>
            )}
          </button>

          <button onClick={resetDemo} title="Reset Demo" className="p-2 border border-cyber-border text-cyber-muted hover:text-white transition-all cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDemoActive(false)}
            className="p-2 border border-cyber-red/30 text-cyber-red/70 hover:bg-cyber-red hover:text-white hover:border-cyber-red transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
