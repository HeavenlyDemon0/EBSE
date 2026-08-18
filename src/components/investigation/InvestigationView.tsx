import React, { useState, useEffect } from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  CheckCircle2, AlertTriangle, AlertCircle, XCircle,
  ChevronDown, ChevronRight, Shield, Key, Zap, Server, Database
} from "lucide-react";
import type { AttackStep, AttackStepStatus } from "../../types";

const PHASE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  INITIAL_ACCESS:    Key,
  CREDENTIAL_ACCESS: Shield,
  LATERAL_MOVEMENT:  Zap,
  PRIVILEGE_ESC:     Server,
  DATA_ACCESS:       Database,
};

const STATUS_STYLE: Record<AttackStepStatus, { badge: string; dot: string; text: string }> = {
  confirmed:    { badge: "border-cyber-green/40 bg-cyber-green/10 text-cyber-green-text",   dot: "bg-cyber-green",               text: "text-cyber-green-text" },
  supported:    { badge: "border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan",           dot: "bg-cyber-cyan",                text: "text-cyber-cyan" },
  unverified:   { badge: "border-cyber-amber/40 bg-cyber-amber/10 text-cyber-amber-text",   dot: "bg-cyber-amber animate-pulse", text: "text-cyber-amber-text" },
  missing:      { badge: "border-cyber-red/40 bg-cyber-red/10 text-cyber-red-text",         dot: "bg-cyber-red",                 text: "text-cyber-red-text" },
  contradicted: { badge: "border-cyber-red/60 bg-cyber-red/15 text-cyber-red-text",         dot: "bg-cyber-red opacity-50",      text: "text-cyber-red-text line-through opacity-60" },
};

const STATUS_LABEL: Record<AttackStepStatus, string> = {
  confirmed:    "CONFIRMED",
  supported:    "SUPPORTED",
  unverified:   "UNVERIFIED",
  missing:      "MISSING",
  contradicted: "CONTRADICTED",
};

// Per-hypothesis falsification (shown in Investigation View)
const FALSIFICATION: Record<string, string[]> = {
  hyp_alpha_A: [
    "No privileged authentication from WS-041 to DC-03",
    "Contradictory account activity proving svc_admin was not accessed",
    "Evidence of an alternate access path not involving credential reuse",
  ],
  hyp_alpha_B: [
    "Process audit proving PowerShell ran only authorised diagnostics",
    "Absence of injected shellcode in WS-041 memory forensics",
    "No known malware signature in any endpoint telemetry",
  ],
  hyp_alpha_C: [
    "Physical access logs proving svc_logistics holder was not present",
    "Evidence of external connection origin disproving internal origin",
    "HR records showing no motive or access to target data",
  ],
};

const VerticalAttackStep: React.FC<{
  step: AttackStep;
  isLast: boolean;
  expanded: boolean;
  onToggle: () => void;
}> = ({ step, isLast, expanded, onToggle }) => {
  const style = STATUS_STYLE[step.status];
  const Icon = PHASE_ICONS[step.phase] || Shield;

  return (
    <div className="flex gap-4">
      {/* Left: connector */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-8 h-8 border flex items-center justify-center ${step.status === "confirmed" ? "border-cyber-green/50 bg-cyber-green/10" : step.status === "supported" ? "border-cyber-cyan/40 bg-cyber-cyan/10" : step.status === "unverified" ? "border-cyber-amber/40 bg-cyber-amber/5" : "border-cyber-red/40 bg-cyber-red/5"}`}>
          <Icon className={`w-4 h-4 ${style.text}`} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-cyber-border/40 my-1 min-h-[16px]" />}
      </div>

      {/* Right: step detail */}
      <div className={`flex-1 min-w-0 pb-4 ${isLast ? "" : ""}`}>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group py-1"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[11px] text-white font-bold uppercase font-sans truncate">{step.name}</span>
            <span className={`font-mono text-[9px] font-black px-2 py-0.5 border shrink-0 ${style.badge}`}>
              {STATUS_LABEL[step.status]}
            </span>
          </div>
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-cyber-muted shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-cyber-muted shrink-0" />}
        </button>

        {expanded && (
          <div className="mt-2 space-y-3 animate-drop-in">
            {/* Description */}
            <p className="text-[11px] text-cyber-muted font-sans leading-relaxed">{step.description}</p>

            {/* FACT vs INFERENCE warning */}
            {(step.status === "unverified" || step.status === "missing") && (
              <div className="flex items-start gap-2.5 p-3 border border-cyber-amber/30 bg-cyber-amber/5">
                <AlertTriangle className="w-4 h-4 text-cyber-amber shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-[9px] text-cyber-amber font-black uppercase block mb-1">
                    NOT AN OBSERVED EVENT
                  </span>
                  <p className="text-[10px] text-cyber-amber/80 leading-relaxed font-sans">
                    This step is a logical inference. No direct telemetry packet confirms this event occurred.
                    Status remains <strong>{STATUS_LABEL[step.status]}</strong> until supporting logs are retrieved.
                  </p>
                </div>
              </div>
            )}

            {/* Confirmed */}
            {step.status === "confirmed" && (
              <div className="flex items-start gap-2.5 p-3 border border-cyber-green/30 bg-cyber-green/5">
                <CheckCircle2 className="w-4 h-4 text-cyber-green shrink-0 mt-0.5" />
                <p className="text-[10px] text-cyber-green/80 font-sans leading-relaxed">
                  Directly verified by immutable sensor telemetry.
                </p>
              </div>
            )}

            {/* Evidence */}
            {step.evidenceIds.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {step.evidenceIds.map(id => (
                  <span key={id} className="font-mono text-[9px] text-cyber-cyan border border-cyber-cyan/25 bg-cyber-cyan/5 px-2 py-0.5">
                    {id} · VERIFIED
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] font-mono text-cyber-red-text">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{step.missingEvidenceReason || "No supporting evidence available."}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const InvestigationView: React.FC = () => {
  const { state, activeResolvedEvent } = useSimulation();

  const activeHyp =
    state.activeHypotheses.find(h => h.id === state.selectedHypothesisId) ??
    state.activeHypotheses[0];

  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [showFalsification, setShowFalsification] = useState(false);
  const [showConfBreakdown, setShowConfBreakdown] = useState(false);

  useEffect(() => {
    if (activeHyp?.steps?.length > 0) {
      setExpandedStepId(activeHyp.steps[0].id);
    }
  }, [activeHyp?.id]);

  if (!activeHyp) {
    return (
      <div className="flex items-center justify-center h-64 bg-cyber-surface border border-cyber-border">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-cyber-amber mx-auto mb-3" />
          <p className="text-white font-bold">No Active Hypothesis</p>
          <p className="text-xs text-cyber-muted mt-1">Select a scenario to begin analysis.</p>
        </div>
      </div>
    );
  }

  const isLeading = activeHyp.status === "leading";
  const falsification = FALSIFICATION[activeHyp.id] ?? [];



  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-5 border-b border-cyber-border/30">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-mono text-[9px] font-black uppercase tracking-wider px-2.5 py-1 border ${isLeading ? "border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan" : "border-cyber-amber/40 bg-cyber-amber/10 text-cyber-amber-text"}`}>
              {activeHyp.status.toUpperCase()}
            </span>
            <span className="font-mono text-[9px] text-cyber-muted uppercase">HYPOTHESIS DEEP DIVE</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-1.5">
            {activeHyp.name}
          </h2>
          <p className="text-[11px] text-cyber-muted font-sans leading-relaxed max-w-2xl">{activeHyp.description}</p>
        </div>
        <div className="flex items-end gap-6 shrink-0 font-mono">
          <div className="text-right">
            <span className="block text-[9px] text-cyber-muted uppercase mb-0.5">Confidence</span>
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-black text-white leading-none">{activeHyp.confidence}%</span>
              <button
                onClick={() => setShowConfBreakdown(v => !v)}
                className="font-mono text-[9px] text-cyber-cyan hover:underline cursor-pointer pb-0.5"
              >WHY?</button>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-cyber-muted uppercase mb-0.5">Evidence Debt</span>
            <span className={`text-3xl font-black leading-none ${activeHyp.evidenceDebt > 40 ? "text-cyber-red-text" : activeHyp.evidenceDebt > 15 ? "text-cyber-amber-text" : "text-cyber-green-text"}`}>
              {activeHyp.evidenceDebt}
            </span>
          </div>
        </div>
      </div>

      {/* Confidence breakdown */}
      {showConfBreakdown && (
        <div className="border border-cyber-border/40 bg-cyber-surface p-4 animate-drop-in">
          <div className="font-mono text-[9px] text-cyber-muted uppercase tracking-wider font-bold mb-2">WHY {activeHyp.confidence}%?</div>
          <div className="space-y-1.5 text-[10px] font-sans">
            {activeHyp.supportingEvidence.map(id => {
              const ev = state.evidenceEvents.find(e => e.id === id);
              return ev ? (
                <div key={id} className="flex items-start gap-2 text-cyber-green/90">
                  <span className="shrink-0 font-mono">+</span><span>{ev.description}</span>
                </div>
              ) : null;
            })}
            {activeHyp.missingEvidence.map((me, i) => (
              <div key={i} className="flex items-start gap-2 text-cyber-amber/80">
                <span className="shrink-0 font-mono">−</span><span>{me}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[9px] text-cyber-muted italic mt-3 pt-2 border-t border-cyber-border/30">
            Current evidence supports this hypothesis. It does not confirm it.
          </p>
        </div>
      )}

      {/* Two-column: Attack Path | Verifier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT: Vertical Attack Path */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-cyber-surface border border-cyber-border/40 p-5">
            <div className="absolute top-0 left-0 h-0.5 w-10 bg-cyber-cyan relative mb-4" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-mono text-[10px] text-white font-black uppercase tracking-wider">ATTACK PATH</h3>
              <div className="flex gap-2 text-[9px] font-mono">
                {["confirmed", "supported", "unverified", "missing"].map(s => (
                  <span key={s} className={`flex items-center gap-1 ${STATUS_STYLE[s as AttackStepStatus].text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[s as AttackStepStatus].dot}`} />
                    {STATUS_LABEL[s as AttackStepStatus]}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-0">
              {activeHyp.steps.map((step, idx) => (
                <VerticalAttackStep
                  key={step.id}
                  step={step}
                  isLast={idx === activeHyp.steps.length - 1}
                  expanded={expandedStepId === step.id}
                  onToggle={() => setExpandedStepId(expandedStepId === step.id ? null : step.id)}
                />
              ))}
            </div>
          </div>

          {/* Restored evidence detail */}
          {activeResolvedEvent && (
            <div className="border border-cyber-cyan/30 bg-cyber-cyan/5 p-4 animate-evidence-arrive">
              <span className="font-mono text-[9px] text-cyber-cyan font-black uppercase tracking-wider block mb-3">
                RESTORED EVIDENCE — {activeResolvedEvent.id}
              </span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-[10px] text-cyber-muted">
                <div>TIMESTAMP: <strong className="text-white">{activeResolvedEvent.timestamp} UTC</strong></div>
                <div>SOURCE: <strong className="text-white">{activeResolvedEvent.source}</strong></div>
                <div>TYPE: <strong className="text-white">{activeResolvedEvent.type}</strong></div>
                <div>STATUS: <strong className="text-cyber-green">VERIFIED</strong></div>
              </div>
              <p className="text-[10px] text-cyber-muted/80 mt-3 pt-3 border-t border-cyber-border/30 font-sans leading-relaxed">
                {activeResolvedEvent.description}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Verifier */}
        <div className="bg-cyber-surface border border-cyber-border/40 p-5 space-y-5">
          <h4 className="font-mono text-[10px] text-white font-black uppercase tracking-wider flex items-center gap-2 border-b border-cyber-border/40 pb-2.5">
            <Shield className="w-3.5 h-3.5 text-cyber-cyan" /> EVIDENCE VERIFIER
          </h4>

          {/* Step checklist */}
          <div>
            <span className="font-mono text-[9px] text-cyber-muted uppercase block mb-2">Phase Status</span>
            <div className="space-y-1">
              {activeHyp.steps.map(s => (
                <button
                  key={s.id}
                  onClick={() => setExpandedStepId(expandedStepId === s.id ? null : s.id)}
                  className={`w-full flex items-center justify-between py-1.5 px-2 cursor-pointer transition-all border text-left ${s.id === expandedStepId ? "bg-cyber-hover border-cyber-border" : "border-transparent hover:bg-cyber-hover/50"}`}
                >
                  <span className="text-[10px] text-cyber-text font-mono uppercase truncate pr-2">{s.name}</span>
                  <span className={`font-mono text-[8px] font-black shrink-0 ${STATUS_STYLE[s.status].text}`}>
                    {STATUS_LABEL[s.status]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Missing Evidence */}
          <div>
            <span className="font-mono text-[9px] text-cyber-muted uppercase block mb-2">Missing Evidence</span>
            {activeHyp.missingEvidence.length > 0 ? (
              <ul className="space-y-1.5">
                {activeHyp.missingEvidence.map((me, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-cyber-amber-text font-sans">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />{me}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-cyber-green-text font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> NONE
              </div>
            )}
          </div>

          {/* WHAT WOULD DISPROVE IT */}
          <div className="border-t border-cyber-border/30 pt-4">
            <button
              onClick={() => setShowFalsification(v => !v)}
              className="w-full flex items-center justify-between mb-2.5 cursor-pointer group"
            >
              <span className="font-mono text-[9px] text-cyber-amber font-black uppercase flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5" /> WHAT WOULD DISPROVE THIS?
              </span>
              {showFalsification ? <ChevronDown className="w-3.5 h-3.5 text-cyber-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-cyber-muted" />}
            </button>
            {showFalsification && falsification.length > 0 && (
              <ul className="space-y-1.5 animate-drop-in">
                {falsification.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-cyber-text/80 font-sans">
                    <span className="text-cyber-amber font-mono mt-0.5 shrink-0">•</span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            )}
            {!showFalsification && (
              <p className="text-[10px] text-cyber-muted italic font-sans">
                Shows conditions that would weaken or eliminate this hypothesis.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
