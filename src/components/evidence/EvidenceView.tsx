import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import { Shield } from "lucide-react";
import type { EvidenceStatus } from "../../types";

export const EvidenceView: React.FC = () => {
  const { state } = useSimulation();

  const getStatusColor = (status: EvidenceStatus) => {
    switch (status) {
      case "verified": return "text-cyber-green bg-cyber-green/10 border-cyber-green/20";
      case "delayed": return "text-cyber-amber bg-cyber-amber/10 border-cyber-amber/20";
      case "missing": return "text-cyber-red bg-cyber-red/10 border-cyber-red/20";
      case "contradictory": return "text-cyber-red bg-cyber-red/10 border-cyber-red/40";
      case "unverified": return "text-cyber-muted bg-cyber-border/40 border-cyber-border";
      default: return "text-cyber-muted bg-cyber-border border-cyber-border";
    }
  };

  const getLogTypeBadgeColor = (type: string) => {
    switch (type) {
      case "AUTH": return "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5";
      case "NETWORK": return "text-cyber-green border-cyber-green/30 bg-cyber-green/5";
      case "PROCESS": return "text-cyber-amber border-cyber-amber/30 bg-cyber-amber/5";
      case "DATA": return "text-white border-cyber-border bg-cyber-bg";
      case "SYSTEM": return "text-cyber-red border-cyber-red/30 bg-cyber-red/5";
      default: return "text-cyber-muted border-cyber-border bg-cyber-bg";
    }
  };

  // Compute counts for Evidence Quality Breakdown
  const getQualityCounts = () => {
    // Determine counts based on active scenario and telemetry integrity
    // To make it look realistic and dynamic:
    if (state.telemetryIntegrity === 100) {
      return { verified: 31, delayed: 0, missing: 0, contradictory: 0, unverified: 5 };
    } else if (state.telemetryIntegrity === 70) {
      return { verified: 22, delayed: 7, missing: 4, contradictory: 1, unverified: 6 };
    } else {
      // 40% Telemetry
      const resolved = state.investigatedLogs.length > 0;
      return resolved 
        ? { verified: 26, delayed: 4, missing: 8, contradictory: 1, unverified: 5 }
        : { verified: 12, delayed: 14, missing: 18, contradictory: 1, unverified: 8 };
    }
  };

  const qc = getQualityCounts();

  // Flag indicating if we need to show the telemetry gap segment on timeline
  const showTelemetryGap = state.telemetryIntegrity === 40 && state.investigatedLogs.length === 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyber-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
            EVIDENCE TIMELINE EXPLORER
          </h2>
          <p className="text-xs text-cyber-muted mt-0.5">
            Audit logs ingested in real-time. Showing records for network segment <strong className="text-white font-mono">{state.activeScenario === 'alpha' ? 'MIL-LOG-NET-07' : state.activeScenario === 'bravo' ? 'MIL-OPS-NET-09' : 'MIL-SEC-DATA-01'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-cyber-muted">INGESTED LOG COUNT:</span>
          <span className="font-mono text-xs text-white border border-cyber-border bg-cyber-surface px-2 py-0.5 rounded-sm font-semibold">
            {state.evidenceEvents.length} Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* VERTICAL TIMELINE PANEL (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-cyber-surface border border-cyber-border/50 p-6 rounded-sm relative">
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyber-green" />
            <span className="font-mono text-[10px] text-cyber-muted uppercase tracking-widest block mb-6">
              INGESTED TELEMETRY CHRONOLOGY
            </span>

            {/* Timeline Vertical Stack */}
            <div className="space-y-0 relative pl-4 border-l border-cyber-border/40 ml-2">
              
              {state.evidenceEvents.map((event) => {
                // If it's Scenario Alpha and telemetry integrity is 40% (not resolved), 
                // we insert the Telemetry Gap segment between NET-8841 (SMB connection) and PROC-9012 (PowerShell)
                const isGapPlacement = showTelemetryGap && event.id === "PROC-9012";

                return (
                  <React.Fragment key={event.id}>
                    {/* Telemetry Gap Segment */}
                    {isGapPlacement && (
                      <div className="my-6 relative -ml-[17px] pl-6 border-l border-dashed border-cyber-red/60 py-2">
                        {/* Gap marker badge */}
                        <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-cyber-red -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        
                        <div className="bg-cyber-red/5 border border-cyber-red/30 rounded-sm p-4 text-center max-w-lg">
                          <span className="font-mono text-[10px] text-cyber-red font-black tracking-widest block uppercase">
                            14:34 — 14:37 UTC
                          </span>
                          <div className="h-[1px] bg-cyber-red/30 w-full my-2" />
                          <span className="font-mono text-[11px] text-cyber-red-text font-bold block uppercase tracking-wider">
                            ━━━━━━━━━ TELEMETRY GAP ━━━━━━━━━
                          </span>
                          <p className="text-[10px] text-cyber-muted mt-1 font-sans">
                            No telemetry packets received from segment sensor. Log buffering or link disruption active.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Timeline Event Node */}
                    <div className="relative mb-6 group">
                      {/* Timeline dot marker */}
                      <div className={`absolute top-2.5 -left-[21px] w-3 h-3 rounded-full border border-cyber-bg transition-colors ${
                        event.status === 'verified' ? 'bg-cyber-green' : 'bg-cyber-amber animate-pulse'
                      }`} />

                      {/* Event Card */}
                      <div className="bg-cyber-bg border border-cyber-border hover:border-cyber-border/80 p-4 rounded-sm transition-all">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-white font-bold tracking-tight">
                              {event.timestamp} UTC
                            </span>
                            <span className={`font-mono text-[9px] px-2 py-0.5 rounded-sm border uppercase font-semibold ${getLogTypeBadgeColor(event.type)}`}>
                              {event.type}
                            </span>
                            <span className="font-mono text-[9px] text-cyber-muted">
                              ID: {event.id}
                            </span>
                          </div>
                          
                          <span className={`font-mono text-[9px] px-2 py-0.5 rounded-sm border uppercase font-bold ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>

                        <p className="text-xs text-cyber-text leading-relaxed font-sans">
                          {event.description}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-cyber-border/20 flex flex-wrap justify-between items-center text-[9px] font-mono text-cyber-muted gap-2">
                          <div>
                            <span>SOURCE HOST:</span> <strong className="text-white uppercase">{event.source}</strong>
                            {event.destination && (
                              <>
                                <span className="mx-1">→</span>
                                <span>DESTINATION:</span> <strong className="text-white uppercase">{event.destination}</strong>
                              </>
                            )}
                          </div>
                          <div>
                            <span>RELIABILITY COEFFICIENT:</span> <strong className="text-cyber-cyan">{event.reliability}</strong>
                          </div>
                        </div>

                        {/* Extra detail info if present */}
                        {event.details && (
                          <div className="bg-cyber-surface/70 border-l border-cyber-cyan p-2 mt-2 rounded-sm font-mono text-[9px] text-cyber-muted">
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

        {/* EVIDENCE QUALITY METRICS PANEL (1 col) */}
        <div className="space-y-4">
          
          {/* Quality breakdown */}
          <div className="bg-cyber-surface border border-cyber-border/50 p-5 rounded-sm space-y-4">
            <h4 className="text-white text-xs font-bold font-mono tracking-wider uppercase border-b border-cyber-border/40 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyber-cyan" />
              EVIDENCE QUALITY ANALYSIS
            </h4>
            
            <p className="text-[11px] text-cyber-muted leading-relaxed font-sans">
              Dynamic statistics of ingested telemetry packets categorized by certainty classifications:
            </p>

            <div className="space-y-3 font-mono text-xs">
              
              {/* Verified */}
              <div className="flex justify-between items-center border-b border-cyber-border/20 pb-2">
                <span className="text-cyber-green-text font-bold">VERIFIED DIRECTLY</span>
                <span className="bg-cyber-green/10 border border-cyber-green/30 px-2 py-0.5 text-cyber-green-text font-bold rounded-sm">
                  {qc.verified}
                </span>
              </div>

              {/* Delayed */}
              <div className="flex justify-between items-center border-b border-cyber-border/20 pb-2">
                <span className="text-cyber-amber-text font-bold">DELAYED / BUFFERED</span>
                <span className="bg-cyber-amber/10 border border-cyber-amber/30 px-2 py-0.5 text-cyber-amber-text font-bold rounded-sm">
                  {qc.delayed}
                </span>
              </div>

              {/* Missing */}
              <div className="flex justify-between items-center border-b border-cyber-border/20 pb-2">
                <span className="text-cyber-red-text font-bold">MISSING / DROPPED</span>
                <span className="bg-cyber-red/10 border border-cyber-red/30 px-2 py-0.5 text-cyber-red-text font-bold rounded-sm">
                  {qc.missing}
                </span>
              </div>

              {/* Contradictory */}
              <div className="flex justify-between items-center border-b border-cyber-border/20 pb-2">
                <span className="text-cyber-red-text font-bold uppercase">CONTRADICTORY</span>
                <span className="bg-cyber-red/20 border border-cyber-red/40 px-2 py-0.5 text-cyber-red-text font-bold rounded-sm">
                  {qc.contradictory}
                </span>
              </div>

              {/* Unverified */}
              <div className="flex justify-between items-center pb-2">
                <span className="text-cyber-muted">UNVERIFIED INFERENCES</span>
                <span className="bg-cyber-surface border border-cyber-border px-2 py-0.5 text-cyber-muted font-bold rounded-sm">
                  {qc.unverified}
                </span>
              </div>

            </div>

            <div className="bg-cyber-bg p-3 border border-cyber-border/40 rounded-sm font-sans text-[10px] text-cyber-muted leading-relaxed">
              <strong className="text-white block mb-1">Telemetry Integrity Mapping:</strong>
              {state.telemetryIntegrity === 100 
                ? "Direct sensors reporting at 100% capacity. Minimal sensor delay. Evidence debt is nominal." 
                : state.telemetryIntegrity === 70 
                ? "Subnet controller exhibiting queue delay. Multiple filesystem events placed in buffer." 
                : "Sensor link blockage detected. 14:34-14:37 telemetry dropped. Leading theories unverified due to log insufficiency."
              }
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
