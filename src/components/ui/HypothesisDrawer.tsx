import React, { useState } from "react";
import { X, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Shield } from "lucide-react";
import type { Hypothesis, AttackStepStatus } from "../../types";
import { useSimulation } from "../../context/SimulationContext";

interface HypothesisDrawerProps {
  hypothesis: Hypothesis | null;
  onClose: () => void;
}

const STEP_STATUS_COLOR: Record<AttackStepStatus, string> = {
  confirmed:    "text-cyber-green-text bg-cyber-green/10 border-cyber-green/30",
  supported:    "text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30",
  unverified:   "text-cyber-amber-text bg-cyber-amber/10 border-cyber-amber/30",
  missing:      "text-cyber-red-text bg-cyber-red/10 border-cyber-red/30",
  contradicted: "text-cyber-red-text bg-cyber-red/15 border-cyber-red/40 line-through opacity-70",
};

const STEP_DOT_COLOR: Record<AttackStepStatus, string> = {
  confirmed:    "bg-cyber-green",
  supported:    "bg-cyber-cyan",
  unverified:   "bg-cyber-amber animate-pulse",
  missing:      "bg-cyber-red",
  contradicted: "bg-cyber-red opacity-50",
};

// Per-hypothesis falsification conditions
const FALSIFICATION_CONDITIONS: Record<string, string[]> = {
  hyp_alpha_A: [
    "Evidence showing svc_logistics credentials were not compromised prior to incident",
    "DC-03 logs showing no elevated authentication from WS-041",
    "Network isolation evidence proving WS-041 could not reach LOG-SRV-12",
  ],
  hyp_alpha_B: [
    "Process audit proving PowerShell executed only authorised diagnostic scripts",
    "Memory forensics showing no injected shellcode on WS-041",
    "Absence of any known malware signature in all endpoint telemetry",
  ],
  hyp_alpha_C: [
    "Physical access logs proving svc_logistics account holder was not present",
    "Evidence of external connection origin disproving internal origin theory",
    "HR records showing svc_logistics user had no motive or access to target data",
  ],
  hyp_bravo_A: [
    "No malware artifacts found in memory dump of WS-082",
    "Evidence that SMB connection was initiated by authorised admin",
    "Network log proving no external C2 communication occurred",
  ],
  hyp_bravo_B: [
    "Evidence that svc_maintenance was legitimately operated by a known administrator",
    "Firewall logs showing no lateral movement from WS-082 subnet",
    "Endpoint telemetry showing no privilege escalation attempt",
  ],
  hyp_bravo_C: [
    "Badge access logs proving no unauthorised physical access occurred",
    "Evidence that all accesses were approved in the change management system",
    "No evidence of data exfiltration or unusual data volumes",
  ],
  hyp_charlie_A: [
    "Evidence that svc_batch account was operated by an authorised service",
    "Query audit showing all database accesses were within normal operational scope",
    "No exfiltration channel identified on the network segment",
  ],
  hyp_charlie_B: [
    "Evidence that no external actor had access to the svc_batch credentials",
    "Network logs showing no external connection prior to the incident",
    "Memory forensics showing no malware on the workstation",
  ],
  hyp_charlie_C: [
    "Evidence that svc_batch account holder had no DBA-level access",
    "System logs proving the batch job was authorised and scheduled",
    "No access to sensitive tables confirmed by query audit",
  ],
};

// Per-hypothesis confidence explanation
const CONFIDENCE_BREAKDOWN: Record<string, { positive: string[]; negative: string[] }> = {
  hyp_alpha_A: {
    positive: [
      "Strong VPN authentication evidence (AUTH-1832)",
      "SMB connection consistent with lateral movement (NET-8841)",
      "PowerShell execution supports progression (PROC-9012)",
    ],
    negative: [
      "Privileged authentication not directly verified (DC-03 gap)",
      "svc_logistics credential compromise not confirmed",
    ],
  },
  hyp_alpha_B: {
    positive: [
      "PowerShell execution is consistent with malware behaviour (PROC-9012)",
      "SMB session could facilitate payload delivery",
    ],
    negative: [
      "No memory injection artifact detected",
      "No known malware signature in telemetry",
      "VPN authentication inconsistent with malware-first entry",
    ],
  },
  hyp_alpha_C: {
    positive: [
      "Legitimate-looking credential usage fits insider profile",
      "VPN access from authorised gateway",
    ],
    negative: [
      "Cross-host SMB session is atypical for insider backup operations",
      "PowerShell execution inconsistent with standard insider data access",
      "No HR indicator of intent",
    ],
  },
};

export const HypothesisDrawer: React.FC<HypothesisDrawerProps> = ({ hypothesis, onClose }) => {
  const { state, setActiveView, setSelectedHypothesisId } = useSimulation();
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [showConfBreakdown, setShowConfBreakdown] = useState(false);
  const [showFalsification, setShowFalsification] = useState(false);

  if (!hypothesis) return null;

  const isLeading = hypothesis.status === "leading";
  const leadBorderColor = isLeading ? "border-cyber-cyan/40" : hypothesis.status === "plausible" ? "border-cyber-amber/30" : "border-cyber-border/50";
  const confBreakdown = CONFIDENCE_BREAKDOWN[hypothesis.id];
  const falsification = FALSIFICATION_CONDITIONS[hypothesis.id] || [];

  const handleOpenInvestigation = () => {
    setSelectedHypothesisId(hypothesis.id);
    setActiveView("investigation");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-cyber-bg/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-cyber-surface border-l-2 ${leadBorderColor} shadow-2xl flex flex-col overflow-hidden`}
        style={{ animation: "slideInRight 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-cyber-border/40 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${isLeading ? "border-cyber-cyan/40 text-cyber-cyan bg-cyber-cyan/10" : "border-cyber-amber/40 text-cyber-amber-text bg-cyber-amber/10"}`}>
                  {hypothesis.status.toUpperCase()}
                </span>
                <span className="font-mono text-[9px] text-cyber-muted uppercase">HYPOTHESIS</span>
              </div>
              <h2 className="text-white text-lg font-black uppercase leading-tight tracking-tight truncate">
                {hypothesis.name}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-cyber-muted hover:text-white transition-colors cursor-pointer shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Confidence + Debt */}
          <div className="flex items-end gap-6 mt-4">
            <div>
              <span className="font-mono text-[9px] text-cyber-muted uppercase block mb-0.5">Confidence</span>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-black leading-none ${isLeading ? "text-white" : "text-cyber-amber-text"}`}>
                  {hypothesis.confidence}%
                </span>
                <button
                  onClick={() => setShowConfBreakdown(v => !v)}
                  className="font-mono text-[9px] text-cyber-cyan hover:underline cursor-pointer pb-1"
                >
                  WHY?
                </button>
              </div>
            </div>
            <div>
              <span className="font-mono text-[9px] text-cyber-muted uppercase block mb-0.5">Evidence Debt</span>
              <span className={`text-2xl font-black leading-none ${hypothesis.evidenceDebt > 40 ? "text-cyber-red-text" : hypothesis.evidenceDebt > 15 ? "text-cyber-amber-text" : "text-cyber-green-text"}`}>
                {hypothesis.evidenceDebt}
              </span>
            </div>
            <div className="ml-auto text-right pb-1">
              <span className="font-mono text-[9px] text-cyber-muted uppercase block">{hypothesis.supportingEvidence.length} evidence</span>
              <span className="font-mono text-[9px] text-cyber-amber-text block">{hypothesis.missingEvidence.length} missing</span>
            </div>
          </div>

          {/* Confidence Breakdown (expandable) */}
          {showConfBreakdown && confBreakdown && (
            <div className="mt-3 border border-cyber-border/40 bg-cyber-bg p-3 animate-drop-in">
              <div className="font-mono text-[9px] text-cyber-muted uppercase tracking-wider mb-2 font-bold">
                WHY {hypothesis.confidence}%?
              </div>
              <div className="space-y-1.5 text-[10px] font-sans">
                {confBreakdown.positive.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-cyber-green/90">
                    <span className="shrink-0 mt-0.5 font-mono">+</span>
                    <span>{p}</span>
                  </div>
                ))}
                {confBreakdown.negative.map((n, i) => (
                  <div key={i} className="flex items-start gap-2 text-cyber-amber/80">
                    <span className="shrink-0 mt-0.5 font-mono">−</span>
                    <span>{n}</span>
                  </div>
                ))}
              </div>
              <p className="font-mono text-[9px] text-cyber-muted italic mt-2 pt-2 border-t border-cyber-border/30">
                Current evidence supports this hypothesis but does not confirm it.
              </p>
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Description */}
          <p className="text-[11px] text-cyber-muted font-sans leading-relaxed">{hypothesis.description}</p>

          {/* ATTACK PATH — vertical compact */}
          <div>
            <h4 className="font-mono text-[10px] text-white font-black uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyber-cyan" />
              ATTACK PATH
            </h4>
            <div className="space-y-0">
              {hypothesis.steps.map((step, idx) => {
                const isExpanded = expandedStepId === step.id;
                return (
                  <div key={step.id}>
                    {/* Step row */}
                    <button
                      onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                      className="w-full flex items-center gap-3 py-2.5 hover:bg-cyber-hover/40 transition-all cursor-pointer text-left"
                    >
                      {/* Dot + connector */}
                      <div className="flex flex-col items-center shrink-0 w-4">
                        <span className={`w-2.5 h-2.5 rounded-full border border-cyber-surface ${STEP_DOT_COLOR[step.status]}`} />
                        {idx < hypothesis.steps.length - 1 && (
                          <span className="w-px h-5 bg-cyber-border/50 mt-0.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] text-white font-semibold font-sans block leading-tight truncate">{step.name}</span>
                      </div>
                      <span className={`font-mono text-[8px] font-black px-1.5 py-0.5 border uppercase shrink-0 ${STEP_STATUS_COLOR[step.status]}`}>
                        {step.status.toUpperCase()}
                      </span>
                      {isExpanded ? <ChevronDown className="w-3 h-3 text-cyber-muted shrink-0" /> : <ChevronRight className="w-3 h-3 text-cyber-muted shrink-0" />}
                    </button>
                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="ml-7 mb-2 p-3 border-l-2 border-cyber-border/40 bg-cyber-bg text-[10px] font-sans text-cyber-muted leading-relaxed animate-drop-in">
                        <p className="mb-2">{step.description}</p>
                        {step.status !== "confirmed" && step.status !== "supported" && (
                          <p className="text-cyber-amber/80 font-mono text-[9px] italic">
                            {step.missingEvidenceReason || "Requires additional telemetry to verify."}
                          </p>
                        )}
                        {step.evidenceIds.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {step.evidenceIds.map(id => (
                              <span key={id} className="font-mono text-[9px] text-cyber-cyan border border-cyber-cyan/20 bg-cyber-cyan/5 px-1.5 py-0.5">{id}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* WHY IS THIS ALIVE */}
          <div>
            <h4 className="font-mono text-[10px] text-white font-black uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" />
              WHY IS THIS HYPOTHESIS ALIVE?
            </h4>
            <div className="space-y-1.5">
              {hypothesis.supportingEvidence.map((evId) => {
                const ev = state.evidenceEvents.find(e => e.id === evId);
                return ev ? (
                  <div key={evId} className="flex items-start gap-2.5 text-[10px] font-sans">
                    <span className="text-cyber-green font-mono shrink-0 mt-0.5">✓</span>
                    <div>
                      <span className="font-mono text-[9px] text-cyber-cyan block">{ev.id}</span>
                      <span className="text-cyber-text/80 leading-relaxed">{ev.description}</span>
                    </div>
                  </div>
                ) : null;
              })}
              {hypothesis.supportingEvidence.length === 0 && (
                <p className="text-[10px] text-cyber-muted italic font-sans">No direct supporting evidence — hypothesis survives by elimination.</p>
              )}
            </div>
          </div>

          {/* WHAT WOULD DISPROVE IT */}
          <div>
            <button
              onClick={() => setShowFalsification(v => !v)}
              className="w-full flex items-center justify-between py-2 cursor-pointer group"
            >
              <h4 className="font-mono text-[10px] text-white font-black uppercase tracking-wider flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-cyber-amber" />
                WHAT WOULD DISPROVE THIS?
              </h4>
              {showFalsification ? <ChevronDown className="w-3.5 h-3.5 text-cyber-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-cyber-muted" />}
            </button>
            {showFalsification && (
              <div className="space-y-1.5 mt-1.5 animate-drop-in">
                {falsification.map((condition, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[10px] font-sans">
                    <span className="text-cyber-amber font-mono shrink-0 mt-0.5">•</span>
                    <span className="text-cyber-text/80 leading-relaxed">{condition}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Evidence */}
          {hypothesis.missingEvidence.length > 0 && (
            <div>
              <h4 className="font-mono text-[10px] text-white font-black uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-cyber-red" />
                MISSING EVIDENCE
              </h4>
              <div className="space-y-1.5">
                {hypothesis.missingEvidence.map((me, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[10px] font-sans">
                    <span className="text-cyber-red font-mono shrink-0 mt-0.5">✗</span>
                    <span className="text-cyber-text/80 leading-relaxed">{me}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-cyber-border/40 p-4 flex gap-2">
          <button
            onClick={handleOpenInvestigation}
            className="flex-1 py-2.5 bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan font-mono text-[11px] font-black uppercase tracking-wider hover:bg-cyber-cyan hover:text-cyber-bg transition-all cursor-pointer"
          >
            OPEN INVESTIGATION VIEW
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-cyber-border text-cyber-muted font-mono text-[10px] hover:text-white hover:border-cyber-muted transition-all cursor-pointer">
            CLOSE
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};
