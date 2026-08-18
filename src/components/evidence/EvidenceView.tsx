import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { Shield, AlertTriangle, X } from "lucide-react";
import type { EvidenceStatus } from "../../types";

const STATUS_COLOR: Record<EvidenceStatus, string> = {
  verified:      "text-cyber-green-text bg-cyber-green/10 border-cyber-green/30",
  delayed:       "text-cyber-amber-text bg-cyber-amber/10 border-cyber-amber/30",
  missing:       "text-cyber-red-text bg-cyber-red/10 border-cyber-red/30",
  contradictory: "text-cyber-red-text bg-cyber-red/15 border-cyber-red/50",
  unverified:    "text-cyber-muted bg-cyber-border/20 border-cyber-border",
};

const TYPE_COLOR: Record<string, string> = {
  AUTH:    "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5",
  NETWORK: "text-cyber-green-text border-cyber-green/30 bg-cyber-green/5",
  PROCESS: "text-cyber-amber-text border-cyber-amber/30 bg-cyber-amber/5",
  DATA:    "text-white border-cyber-border bg-cyber-bg",
  SYSTEM:  "text-cyber-red-text border-cyber-red/30 bg-cyber-red/5",
  ENGINE:  "text-cyber-muted border-cyber-border bg-cyber-bg",
};

export const EvidenceView: React.FC = () => {
  const { state } = useSimulation();
  const [showGapExplainer, setShowGapExplainer] = useState(false);

  const showGap = state.telemetryIntegrity === 40 && state.investigatedLogs.length === 0;

  // Evidence quality stats
  const qc = (() => {
    if (state.telemetryIntegrity === 100)
      return { verified: 31, delayed: 0, missing: 0, contradictory: 0, unverified: 5 };
    if (state.telemetryIntegrity === 70)
      return { verified: 22, delayed: 7, missing: 4, contradictory: 1, unverified: 6 };
    const resolved = state.investigatedLogs.length > 0;
    return resolved
      ? { verified: 26, delayed: 4, missing: 8, contradictory: 1, unverified: 5 }
      : { verified: 12, delayed: 14, missing: 18, contradictory: 1, unverified: 8 };
  })();

  const segment = state.activeScenario === "alpha" ? "MIL-LOG-NET-07"
    : state.activeScenario === "bravo" ? "MIL-OPS-NET-09" : "MIL-SEC-DATA-01";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-3 pb-4 border-b border-cyber-border/30">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">EVIDENCE TIMELINE</h2>
          <p className="text-[11px] text-cyber-muted mt-0.5 font-sans">
            Audit log chronology for segment <strong className="text-white font-mono">{segment}</strong>.
            {showGap && (
              <span className="text-cyber-red-text ml-2 font-mono text-[10px] font-bold">
                ⚠ TELEMETRY GAP DETECTED — 14:34–14:37 UTC
              </span>
            )}
          </p>
        </div>
        <div className="font-mono text-[11px] text-cyber-muted border border-cyber-border/40 bg-cyber-surface px-3 py-1.5">
          {state.evidenceEvents.length} events ingested
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* TIMELINE COLUMN (2/3) */}
        <div className="lg:col-span-2">
          <div className="bg-cyber-surface border border-cyber-border/40 p-5 relative">
            <div className="absolute top-0 left-0 h-0.5 w-8 bg-cyber-green" />
            <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest block mb-5">
              INGESTED TELEMETRY CHRONOLOGY
            </span>

            <div className="relative pl-5 border-l border-cyber-border/30 ml-1 space-y-0">
              {state.evidenceEvents.map((event) => {
                const isGapPlacement = showGap && event.id === "PROC-9012";
                return (
                  <React.Fragment key={event.id}>
                    {/* TELEMETRY GAP — clickable */}
                    {isGapPlacement && (
                      <div className="my-5 relative -ml-[22px]">
                        {/* Gap marker dot */}
                        <div className="absolute top-1/2 left-0 w-2.5 h-2.5 rounded-full bg-cyber-red border-2 border-cyber-bg -translate-y-1/2 animate-pulse" />

                        <button
                          onClick={() => setShowGapExplainer(true)}
                          className="ml-6 block w-full text-left cursor-pointer group"
                        >
                          <div className="border border-dashed border-cyber-red/50 bg-cyber-red/5 p-4 hover:bg-cyber-red/8 transition-all">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-[10px] text-cyber-red font-black uppercase tracking-widest">
                                ━━ TELEMETRY GAP ━━ 14:34 – 14:37 UTC
                              </span>
                              <span className="font-mono text-[9px] text-cyber-red/60 group-hover:text-cyber-red transition-colors uppercase">
                                WHY DOES THIS MATTER? →
                              </span>
                            </div>
                            <p className="text-[10px] text-cyber-muted font-sans">
                              No telemetry packets received from subnet sensor. Evidence gap prevents confirmation of privilege escalation.
                            </p>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Event row */}
                    <div className="relative mb-4 group">
                      <div className={`absolute top-3 -left-[22px] w-2.5 h-2.5 rounded-full border-2 border-cyber-bg ${event.status === "verified" ? "bg-cyber-green" : "bg-cyber-amber animate-pulse"}`} />

                      <div className="bg-cyber-bg border border-cyber-border/40 hover:border-cyber-border/70 p-3.5 transition-all">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-[11px] text-white font-bold">{event.timestamp} UTC</span>
                            <span className={`font-mono text-[9px] px-1.5 py-0.5 border uppercase font-bold ${TYPE_COLOR[event.type] || TYPE_COLOR.ENGINE}`}>
                              {event.type}
                            </span>
                            <span className="font-mono text-[9px] text-cyber-muted">{event.id}</span>
                          </div>
                          <span className={`font-mono text-[9px] px-1.5 py-0.5 border uppercase font-bold shrink-0 ${STATUS_COLOR[event.status]}`}>
                            {event.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-cyber-text font-sans leading-relaxed">{event.description}</p>

                        <div className="mt-2 pt-2 border-t border-cyber-border/20 flex flex-wrap justify-between text-[9px] font-mono text-cyber-muted gap-2">
                          <span>
                            <span className="text-cyber-muted/60">SRC</span> <strong className="text-white">{event.source}</strong>
                            {event.destination && (
                              <> <span className="mx-1 text-cyber-border">→</span> <span className="text-cyber-muted/60">DST</span> <strong className="text-white">{event.destination}</strong></>
                            )}
                          </span>
                          <span className="text-cyber-muted/60">
                            RELIABILITY <strong className="text-cyber-cyan">{(event.reliability * 100).toFixed(0)}%</strong>
                          </span>
                        </div>

                        {event.details && (
                          <div className="mt-2 bg-cyber-surface/60 border-l border-cyber-cyan/30 pl-2.5 py-1.5 font-mono text-[9px] text-cyber-muted">
                            {event.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* QUALITY SIDEBAR (1/3) */}
        <div className="space-y-4">
          <div className="bg-cyber-surface border border-cyber-border/40 p-5">
            <h4 className="font-mono text-[10px] text-white font-black uppercase tracking-wider flex items-center gap-2 border-b border-cyber-border/40 pb-2.5 mb-4">
              <Shield className="w-3.5 h-3.5 text-cyber-cyan" />
              EVIDENCE QUALITY
            </h4>
            <div className="space-y-2.5 font-mono text-[11px]">
              {[
                { label: "VERIFIED",       val: qc.verified,      color: "text-cyber-green-text bg-cyber-green/10 border-cyber-green/30" },
                { label: "DELAYED",        val: qc.delayed,       color: "text-cyber-amber-text bg-cyber-amber/10 border-cyber-amber/30" },
                { label: "MISSING",        val: qc.missing,       color: "text-cyber-red-text bg-cyber-red/10 border-cyber-red/30" },
                { label: "CONTRADICTORY",  val: qc.contradictory, color: "text-cyber-red-text bg-cyber-red/15 border-cyber-red/40" },
                { label: "UNVERIFIED",     val: qc.unverified,    color: "text-cyber-muted bg-cyber-border/20 border-cyber-border" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-cyber-muted text-[10px] uppercase">{item.label}</span>
                  <span className={`font-black px-2 py-0.5 border text-[10px] ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-cyber-border/30 text-[10px] font-sans text-cyber-muted leading-relaxed">
              {state.telemetryIntegrity === 100
                ? "Full sensor capacity. Minimal delay. Evidence debt nominal."
                : state.telemetryIntegrity === 70
                ? "Subnet controller queue delay. Multiple events buffered."
                : "Sensor link blocked. 14:34–14:37 telemetry dropped. Key theories unverified."}
            </div>
          </div>
        </div>
      </div>

      {/* Gap explainer modal */}
      {showGapExplainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-bg/70 backdrop-blur-[2px]">
          <div className="w-full max-w-md bg-cyber-surface border-2 border-cyber-red/50 shadow-2xl relative mx-4">
            <div className="h-0.5 w-full bg-cyber-red" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-cyber-red shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-[10px] text-cyber-red font-black uppercase tracking-widest mb-1">
                    TELEMETRY GAP · 14:34–14:37 UTC
                  </div>
                  <h3 className="text-white text-base font-black uppercase mb-3">Why Does This Matter?</h3>
                  <div className="space-y-2.5 text-[11px] font-sans text-cyber-text/85">
                    <p>
                      This 3-minute gap prevents EBHE from confirming whether{" "}
                      <strong className="text-white">privilege escalation occurred</strong>.
                    </p>
                    <p>
                      The DC-03 authentication log — which would confirm or deny this — was not received during this window.
                    </p>
                    <p className="text-cyber-amber/90 border border-cyber-amber/20 bg-cyber-amber/5 p-3">
                      EBHE does not fill this gap with assumptions. It tracks the uncertainty explicitly as{" "}
                      <strong>Evidence Debt</strong> and surfaces the gap for operator action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowGapExplainer(false)}
              className="absolute top-3 right-3 p-1 text-cyber-muted hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
