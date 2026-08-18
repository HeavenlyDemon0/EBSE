import React, { useState, useEffect } from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  Key, Zap, Server, Database, ArrowRight, Shield,
  CheckCircle2, AlertTriangle, AlertCircle, HelpCircle
} from "lucide-react";
import type { AttackStep, AttackStepStatus } from "../../types";

const PHASE_META: Record<string, { label: string; short: string; Icon: React.FC<{ className?: string }> }> = {
  INITIAL_ACCESS:    { label: "Initial Access",         short: "ACCESS",    Icon: Key },
  CREDENTIAL_ACCESS: { label: "Credential Access",      short: "CRED",      Icon: Shield },
  LATERAL_MOVEMENT:  { label: "Lateral Movement",       short: "LATERAL",   Icon: Zap },
  PRIVILEGE_ESC:     { label: "Privilege Escalation",   short: "PRIV ESC",  Icon: Server },
  DATA_ACCESS:       { label: "Data Access",            short: "DATA",      Icon: Database },
};

const STATUS_STYLE: Record<AttackStepStatus, { node: string; dot: string; badge: string; text: string }> = {
  confirmed:    { node: "border-cyber-green/60 bg-cyber-green/8",   dot: "bg-cyber-green",  badge: "bg-cyber-green/15 border-cyber-green/40 text-cyber-green-text",  text: "text-cyber-green-text" },
  supported:    { node: "border-cyber-cyan/60 bg-cyber-cyan/8",     dot: "bg-cyber-cyan",   badge: "bg-cyber-cyan/15 border-cyber-cyan/40 text-cyber-cyan",          text: "text-cyber-cyan" },
  unverified:   { node: "border-cyber-amber/50 bg-cyber-amber/5",   dot: "bg-cyber-amber animate-pulse",  badge: "bg-cyber-amber/15 border-cyber-amber/40 text-cyber-amber-text", text: "text-cyber-amber-text" },
  missing:      { node: "border-cyber-red/50 bg-cyber-red/5",       dot: "bg-cyber-red",    badge: "bg-cyber-red/15 border-cyber-red/40 text-cyber-red-text",        text: "text-cyber-red-text" },
  contradicted: { node: "border-cyber-red/70 bg-cyber-red/8 opacity-70", dot: "bg-cyber-red", badge: "bg-cyber-red/25 border-cyber-red/60 text-cyber-red-text",   text: "text-cyber-red-text line-through" },
};

const STATUS_LABEL: Record<AttackStepStatus, string> = {
  confirmed:    "CONFIRMED",
  supported:    "SUPPORTED",
  unverified:   "UNVERIFIED",
  missing:      "MISSING",
  contradicted: "CONTRADICTED",
};

export const InvestigationView: React.FC = () => {
  const { state, activeResolvedEvent } = useSimulation();

  const activeHypothesis = state.activeHypotheses.find(h => h.id === state.selectedHypothesisId)
    || state.activeHypotheses[0];

  const [selectedStepId, setSelectedStepId] = useState<string>("");

  useEffect(() => {
    if (activeHypothesis?.steps?.length > 0) {
      setSelectedStepId(activeHypothesis.steps[0].id);
    }
  }, [activeHypothesis?.id]);

  if (!activeHypothesis) {
    return (
      <div className="flex items-center justify-center h-64 bg-cyber-surface border border-cyber-border">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-cyber-amber mx-auto mb-3" />
          <p className="text-white font-bold text-sm">No Active Investigation</p>
          <p className="text-xs text-cyber-muted mt-1">Select a scenario to begin analysis.</p>
        </div>
      </div>
    );
  }

  const selectedStep = activeHypothesis.steps.find(s => s.id === selectedStepId) || activeHypothesis.steps[0];

  const isInferred = (step: AttackStep) =>
    step.status !== "confirmed" && (
      step.phase === "CREDENTIAL_ACCESS" ||
      step.phase === "PRIVILEGE_ESC" ||
      step.phase === "DATA_ACCESS"
    );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-3 pb-4 border-b border-cyber-border/40">
        <div>
          <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-wider block mb-1">
            ATTACK PATH ANALYSIS — HYPOTHESIS DEEP DIVE
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            {activeHypothesis.name}
          </h2>
          <p className="text-[11px] text-cyber-muted mt-0.5 font-sans max-w-2xl">
            {activeHypothesis.description}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono">
            <span className="block text-[9px] text-cyber-muted">CONFIDENCE</span>
            <span className="text-2xl font-black text-white">{activeHypothesis.confidence}%</span>
          </div>
          <div className="h-10 w-px bg-cyber-border" />
          <div className="text-right font-mono">
            <span className="block text-[9px] text-cyber-muted">EVIDENCE DEBT</span>
            <span className="text-2xl font-black text-cyber-amber-text">{activeHypothesis.evidenceDebt}</span>
          </div>
        </div>
      </div>

      {/* ─── HORIZONTAL ATTACK PATH GRAPH ─── */}
      <div className="bg-cyber-surface border border-cyber-border/50 p-5 relative">
        <div className="absolute top-0 left-0 h-0.5 w-8 bg-cyber-cyan" />
        <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest block mb-6">
          ATTACK PHASE DETECTION GRAPH — CLICK TO INSPECT
        </span>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-3 mb-5 text-[9px] font-mono">
          {(Object.entries(STATUS_LABEL) as [AttackStepStatus, string][]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[k].dot}`} />
              <span className={STATUS_STYLE[k].text}>{v}</span>
            </div>
          ))}
        </div>

        {/* Nodes row */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-0 min-w-[600px]">
            {activeHypothesis.steps.map((step, idx) => {
              const meta = PHASE_META[step.phase] || { label: step.name, short: step.name, Icon: HelpCircle };
              const style = STATUS_STYLE[step.status];
              const Icon = meta.Icon;
              const isSelected = step.id === selectedStepId;

              return (
                <React.Fragment key={step.id}>
                  {/* Node */}
                  <div
                    onClick={() => setSelectedStepId(step.id)}
                    className={`flex-1 flex flex-col items-center cursor-pointer group transition-all ${isSelected ? 'scale-105 z-10' : 'hover:scale-102'}`}
                    style={{ minWidth: '100px' }}
                  >
                    {/* Icon box */}
                    <div className={`w-14 h-14 border-2 flex items-center justify-center relative transition-all duration-300 ${style.node} ${isSelected ? 'ring-2 ring-offset-1 ring-offset-cyber-surface ring-cyber-cyan/40' : ''}`}>
                      <Icon className={`w-6 h-6 ${step.status === 'confirmed' ? 'text-cyber-green-text' : step.status === 'supported' ? 'text-cyber-cyan' : step.status === 'unverified' ? 'text-cyber-amber-text' : 'text-cyber-red-text'}`} />
                      {/* Status indicator dot */}
                      <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-cyber-surface ${style.dot}`} />
                    </div>
                    {/* Phase name */}
                    <div className="mt-2.5 text-center px-1">
                      <span className="font-mono text-[8px] text-cyber-muted block uppercase">{meta.short}</span>
                      <span className={`font-sans text-[10px] font-bold block mt-0.5 leading-tight ${style.text}`}>
                        {step.name}
                      </span>
                      <span className={`font-mono text-[8px] font-black block mt-1 px-1 py-0.5 border ${style.badge}`}>
                        {STATUS_LABEL[step.status]}
                      </span>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  {idx < activeHypothesis.steps.length - 1 && (
                    <div className="flex items-start justify-center pt-6 px-1 shrink-0">
                      <ArrowRight className={`w-4 h-4 ${step.status === 'confirmed' || step.status === 'supported' ? 'text-cyber-border' : 'text-cyber-border/40'}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── STEP ANALYSIS + VERIFIER PANEL ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Step Analysis (2 cols) */}
        <div className="lg:col-span-2 bg-cyber-surface border border-cyber-border/50 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border/30 pb-3">
            <div>
              <span className="font-mono text-[9px] text-cyber-muted uppercase block">Selected Phase</span>
              <h3 className="text-white text-base font-black uppercase mt-0.5">{selectedStep?.name}</h3>
            </div>
            {selectedStep && (
              <span className={`font-mono text-[10px] font-black uppercase px-2 py-1 border ${STATUS_STYLE[selectedStep.status].badge}`}>
                {STATUS_LABEL[selectedStep.status]}
              </span>
            )}
          </div>

          {selectedStep && (
            <div className="space-y-4 text-[11px] font-sans">
              {/* Description */}
              <p className="text-cyber-text leading-relaxed">{selectedStep.description}</p>

              {/* CRITICAL: Fact vs Inference banner */}
              {isInferred(selectedStep) && selectedStep.status !== 'confirmed' && (
                <div className="bg-cyber-amber/5 border border-cyber-amber/40 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-cyber-amber shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[10px] text-cyber-amber font-black block uppercase tracking-wider mb-1.5">
                        CLAIM IS NOT AN OBSERVED EVENT
                      </span>
                      <p className="text-cyber-amber/85 leading-relaxed text-[10px]">
                        This attack phase represents a logical inference computed by the EBHE reasoning engine.
                        No direct, verifiable telemetry packet confirms this event. The claim remains{' '}
                        <strong>{STATUS_LABEL[selectedStep.status]}</strong> until supporting logs are retrieved.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmed banner */}
              {selectedStep.status === 'confirmed' && (
                <div className="bg-cyber-green/5 border border-cyber-green/30 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyber-green shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[10px] text-cyber-green font-black block uppercase tracking-wider mb-1">
                        VERIFIED OBSERVED TELEMETRY
                      </span>
                      <p className="text-cyber-green/85 leading-relaxed text-[10px]">
                        This attack phase is directly verified by immutable telemetry packets received in real-time from system sensors.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Supporting Evidence */}
              <div>
                <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-wider block mb-2">
                  SUPPORTING EVIDENCE LOGS
                </span>
                {selectedStep.evidenceIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStep.evidenceIds.map(evId => {
                      const ev = state.evidenceEvents.find(e => e.id === evId);
                      return ev ? (
                        <div key={ev.id} className="border border-cyber-border/50 bg-cyber-bg p-3 flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-[9px] text-cyber-cyan font-bold">{ev.id}</span>
                              <span className="font-mono text-[8px] text-cyber-muted">{ev.timestamp} UTC</span>
                            </div>
                            <p className="text-[10px] text-white leading-relaxed">{ev.description}</p>
                            <span className="font-mono text-[8px] text-cyber-muted mt-1 block">
                              {ev.source}{ev.destination ? ` → ${ev.destination}` : ''} · Reliability: {(ev.reliability * 100).toFixed(0)}%
                            </span>
                          </div>
                          <span className="font-mono text-[9px] text-cyber-green-text font-bold shrink-0">✓ VERIFIED</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="border border-cyber-red/25 bg-cyber-red/5 p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-cyber-red shrink-0 mt-0.5" />
                    <p className="font-mono text-[10px] text-cyber-red-text">
                      {selectedStep.missingEvidenceReason || "No supporting log events. Required telemetry unavailable due to sensor gap."}
                    </p>
                  </div>
                )}
              </div>

              {/* Restored Evidence Detail */}
              {selectedStep.phase === "PRIVILEGE_ESC" && activeResolvedEvent && (
                <div className="border border-cyber-cyan/30 bg-cyber-cyan/5 p-4 animate-evidence-arrive">
                  <span className="font-mono text-[9px] text-cyber-cyan font-black uppercase tracking-wider block mb-3">
                    RESTORED EVIDENCE PACKET — {activeResolvedEvent.id}
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-cyber-muted">
                    <div>TIMESTAMP: <strong className="text-white">{activeResolvedEvent.timestamp} UTC</strong></div>
                    <div>SOURCE: <strong className="text-white">{activeResolvedEvent.source}</strong></div>
                    <div>STATUS: <strong className="text-cyber-green">VERIFIED</strong></div>
                    <div>RELIABILITY: <strong className="text-white">{(activeResolvedEvent.reliability * 100).toFixed(0)}%</strong></div>
                  </div>
                  {activeResolvedEvent.details && (
                    <p className="text-[10px] text-cyber-muted/80 mt-3 pt-3 border-t border-cyber-border/30 leading-relaxed">
                      {activeResolvedEvent.details}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Evidence Verifier (1 col) */}
        <div className="bg-cyber-surface border border-cyber-border/50 p-5 space-y-4">
          <h4 className="font-mono text-[10px] text-white font-bold uppercase border-b border-cyber-border/40 pb-2.5 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyber-cyan" />
            EVIDENCE VERIFIER
          </h4>

          <div className="space-y-3 text-[11px] font-sans">
            <div className="bg-cyber-bg p-3 border border-cyber-border/40">
              <span className="font-mono text-[8px] text-cyber-muted uppercase block">Hypothesis Status</span>
              <span className="text-lg font-black text-white uppercase mt-0.5 block">{activeHypothesis.status}</span>
              <span className="font-mono text-[10px] text-cyber-cyan mt-1 block">Confidence: {activeHypothesis.confidence}%</span>
            </div>

            {/* Step checklist */}
            <div>
              <span className="font-mono text-[9px] text-cyber-muted uppercase block mb-2">Phase Requirements</span>
              <div className="space-y-1.5">
                {activeHypothesis.steps.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStepId(s.id)}
                    className={`flex items-center justify-between py-1.5 px-2 cursor-pointer transition-all border ${s.id === selectedStepId ? 'bg-cyber-hover border-cyber-border' : 'border-transparent hover:bg-cyber-hover/50'}`}
                  >
                    <span className="text-[10px] text-cyber-text font-medium uppercase font-mono truncate pr-2">{s.name}</span>
                    <span className={`font-mono text-[8px] font-black shrink-0 ${STATUS_STYLE[s.status].text}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Evidence */}
            <div className="border-t border-cyber-border/40 pt-3">
              <span className="font-mono text-[9px] text-cyber-muted uppercase block mb-2">Missing Evidence</span>
              {activeHypothesis.missingEvidence.length > 0 ? (
                <ul className="space-y-1.5 text-[10px] font-mono text-cyber-amber-text">
                  {activeHypothesis.missingEvidence.map((me, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{me}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-cyber-green-text font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  NO MISSING EVIDENCE
                </div>
              )}
            </div>

            {/* Conflicts */}
            <div className="border-t border-cyber-border/40 pt-3">
              <span className="font-mono text-[9px] text-cyber-muted uppercase block mb-2">Conflicting Telemetry</span>
              {activeHypothesis.conflictingEvidence.length > 0 ? (
                <div className="space-y-1.5">
                  {activeHypothesis.conflictingEvidence.map(cId => {
                    const ce = state.evidenceEvents.find(e => e.id === cId);
                    return ce ? (
                      <div key={cId} className="p-2 border border-cyber-red/30 bg-cyber-red/5 font-mono text-[9px] text-cyber-red-text">
                        <strong className="block">{ce.id}</strong>
                        <span className="text-cyber-red/70">{ce.description.slice(0, 60)}...</span>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <span className="font-mono text-[10px] text-cyber-muted">NONE DETECTED</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
