import React from "react";
import { X, ExternalLink, ArrowDown } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";

export const ReasoningTraceDrawer: React.FC = () => {
  const {
    state,
    isReasoningTraceOpen,
    selectedReasoningHypothesisId,
    closeReasoningTrace,
    setSelectedSourceEvidenceId,
    selectedSourceEvidenceId,
    setActiveView
  } = useSimulation();

  if (!isReasoningTraceOpen) return null;

  const activeHyp = state.activeHypotheses.find(h => h.id === selectedReasoningHypothesisId)
    || state.activeHypotheses.find(h => h.status === "leading")
    || state.activeHypotheses[0];

  if (!activeHyp) return null;

  const reasoningSteps = activeHyp.reasoningTrace || [];

  const handleInspectSourceEvent = (evtId: string) => {
    setSelectedSourceEvidenceId(evtId === selectedSourceEvidenceId ? null : evtId);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-cyber-bg/60 backdrop-blur-[2px]"
        onClick={closeReasoningTrace}
      />

      {/* Right Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-xl z-50 bg-cyber-surface border-l-2 border-cyber-cyan shadow-2xl flex flex-col overflow-hidden animate-slide-in"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-cyber-border/40 p-5 bg-cyber-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[9px] font-black uppercase tracking-widest text-cyber-cyan px-2 py-0.5 border border-cyber-cyan/30 bg-cyber-cyan/10">
                  FEATURE #1 · REASONING TRACE
                </span>
                <span className="font-mono text-[9px] text-cyber-muted uppercase">EXPLICIT DERIVATION</span>
              </div>
              <h2 className="text-white text-lg font-black uppercase tracking-tight font-sans">
                WHY THIS ASSESSMENT?
              </h2>
            </div>
            <button
              onClick={closeReasoningTrace}
              className="p-1 text-cyber-muted hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 bg-cyber-bg border border-cyber-cyan/30 p-3 flex justify-between items-center">
            <div>
              <span className="font-mono text-[8px] text-cyber-muted uppercase block">Target Hypothesis</span>
              <strong className="text-white text-xs uppercase font-sans">{activeHyp.name}</strong>
            </div>
            <div className="text-right font-mono">
              <span className="text-[8px] text-cyber-muted uppercase block">CURRENT SUPPORT</span>
              <span className="text-xl font-black text-cyber-cyan">{activeHyp.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Body — Reasoning Chain Steps */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-[11px] text-cyber-muted font-sans leading-relaxed">
            Trace how EBHE derived this assessment from raw telemetry packets to final interpretation. Support is <strong>not confirmation</strong>.
          </p>

          <div className="space-y-4 relative">
            {reasoningSteps.map((step, idx) => {
              const isSourceExpanded = step.evidenceId && selectedSourceEvidenceId === step.evidenceId;
              const sourceEvt = step.evidenceId ? state.evidenceEvents.find(e => e.id === step.evidenceId) : null;

              return (
                <div key={step.stepNumber} className="relative">
                  {/* Step Card */}
                  <div className={`p-4 border transition-all ${
                    step.type === "OBSERVED" ? "border-cyber-green/40 bg-cyber-green/5"
                    : step.type === "SUPPORTED" ? "border-cyber-cyan/40 bg-cyber-cyan/5"
                    : step.type === "UNRESOLVED" ? "border-cyber-amber/40 bg-cyber-amber/5"
                    : "border-cyber-cyan bg-cyber-card shadow-lg"
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[9px] font-black text-cyber-muted">
                        0{step.stepNumber} // {step.type}
                      </span>
                      {step.isConfirmed && (
                        <span className="font-mono text-[8px] font-bold text-cyber-green-text border border-cyber-green/30 bg-cyber-green/10 px-1.5 py-0.5">
                          ✓ VERIFIED FACT
                        </span>
                      )}
                      {step.type === "UNRESOLVED" && (
                        <span className="font-mono text-[8px] font-bold text-cyber-amber-text border border-cyber-amber/30 bg-cyber-amber/10 px-1.5 py-0.5">
                          ? TELEMETRY GAP
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-black text-white uppercase font-sans mb-1">
                      {step.title}
                    </h4>

                    <p className="text-[11px] text-cyber-text leading-relaxed font-sans">
                      {step.description}
                    </p>

                    {/* Source Evidence Link button */}
                    {step.evidenceId && (
                      <div className="mt-3 pt-2 border-t border-cyber-border/30 flex items-center justify-between">
                        <span className="font-mono text-[9px] text-cyber-muted">
                          SOURCE EVENT: <strong className="text-cyber-cyan font-bold">{step.evidenceId}</strong>
                        </span>
                        <button
                          onClick={() => handleInspectSourceEvent(step.evidenceId!)}
                          className="flex items-center gap-1 font-mono text-[9px] text-cyber-cyan hover:underline cursor-pointer font-bold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {isSourceExpanded ? "HIDE RAW TELEMETRY" : "INSPECT SOURCE TELEMETRY"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Source Event Telemetry Inspection */}
                  {isSourceExpanded && sourceEvt && (
                    <div className="mt-2 p-3 bg-cyber-bg border border-cyber-cyan/50 font-mono text-[10px] space-y-1.5 animate-drop-in">
                      <div className="flex justify-between border-b border-cyber-border/40 pb-1 text-cyber-cyan font-bold">
                        <span>RAW TELEMETRY PACKET // {sourceEvt.id}</span>
                        <span>STATUS: {sourceEvt.status.toUpperCase()}</span>
                      </div>
                      <div className="text-cyber-muted grid grid-cols-2 gap-x-4">
                        <div>TIMESTAMP: <strong className="text-white">{sourceEvt.timestamp}</strong></div>
                        <div>TYPE: <strong className="text-white">{sourceEvt.type}</strong></div>
                        <div>SOURCE: <strong className="text-white">{sourceEvt.source}</strong></div>
                        <div>ACCOUNT: <strong className="text-white">{sourceEvt.account || "N/A"}</strong></div>
                      </div>
                      <p className="text-cyber-text pt-1">{sourceEvt.description}</p>
                      {sourceEvt.details && (
                        <p className="text-cyber-muted/80 text-[9px] italic border-t border-cyber-border/20 pt-1">
                          {sourceEvt.details}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Connector arrow */}
                  {idx < reasoningSteps.length - 1 && (
                    <div className="flex justify-center my-1.5">
                      <ArrowDown className="w-3.5 h-3.5 text-cyber-border" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-cyber-border/40 p-4 bg-cyber-card flex justify-between items-center">
          <button
            onClick={() => {
              closeReasoningTrace();
              setActiveView("evidence");
            }}
            className="font-mono text-[10px] text-cyber-cyan hover:underline cursor-pointer flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" /> OPEN FULL EVIDENCE EXPLORER
          </button>
          <button
            onClick={closeReasoningTrace}
            className="px-4 py-2 border border-cyber-border text-cyber-muted font-mono text-[10px] hover:text-white cursor-pointer uppercase font-bold"
          >
            CLOSE TRACE
          </button>
        </div>
      </div>
    </>
  );
};
