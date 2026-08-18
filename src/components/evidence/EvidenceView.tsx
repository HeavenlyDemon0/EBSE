import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { Play, Pause } from "lucide-react";
import type { EvidenceStatus, EvidenceEvent } from "../../types";

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
  DNS:     "text-cyber-cyan/80 border-cyber-cyan/20 bg-cyber-cyan/5",
  VPN:     "text-cyber-green/80 border-cyber-green/20 bg-cyber-green/5",
};

export const EvidenceView: React.FC = () => {
  const { state, togglePauseStream, clearLiveBuffer, selectedSourceEvidenceId, setSelectedSourceEvidenceId } = useSimulation();
  const [activeTab, setActiveTab] = useState<"live" | "investigation" | "archived">("live");

  const segment = state.activeScenario === "alpha" ? "MIL-LOG-NET-07"
    : state.activeScenario === "bravo" ? "MIL-OPS-NET-09" : "MIL-SEC-DATA-01";

  const displayEvents: EvidenceEvent[] =
    activeTab === "live"
      ? state.liveEventsBuffer
      : activeTab === "investigation"
      ? state.evidenceEvents
      : [...state.recentEvents, ...state.archivedEvents];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-3 pb-4 border-b border-cyber-border/30">
        <div>
          <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest block mb-1">
            EVIDENCE EXPLORER & TELEMETRY STREAM
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">SYNTHETIC TELEMETRY EXPLORER</h2>
          <p className="text-[11px] text-cyber-muted mt-0.5 font-sans">
            Audit logs & real-time telemetry packets for network segment <strong className="text-white font-mono">{segment}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-[10px] text-cyber-muted border border-cyber-border/40 bg-cyber-surface px-3 py-1.5 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${state.isStreamPaused ? "bg-cyber-amber" : "bg-cyber-green animate-pulse"}`} />
            <span>REAL-TIME STREAM: <strong className={state.isStreamPaused ? "text-cyber-amber-text" : "text-cyber-green-text"}>{state.isStreamPaused ? "PAUSED" : "ACTIVE"}</strong></span>
          </div>

          <button
            onClick={togglePauseStream}
            className={`px-3 py-1.5 border font-mono text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              state.isStreamPaused ? "border-cyber-amber text-cyber-amber-text bg-cyber-amber/10" : "border-cyber-border text-cyber-muted hover:text-white"
            }`}
          >
            {state.isStreamPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {state.isStreamPaused ? "RESUME" : "PAUSE"}
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-cyber-border/30 pb-3">
        {[
          { id: "live" as const, label: `LIVE STREAM (${state.liveEventsBuffer.length})` },
          { id: "investigation" as const, label: `INVESTIGATION TELEMETRY (${state.evidenceEvents.length})` },
          { id: "archived" as const, label: `ARCHIVED STORE (${state.recentEvents.length + state.archivedEvents.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`font-mono text-[10px] font-bold uppercase px-3.5 py-1.5 border transition-all cursor-pointer ${
              activeTab === t.id
                ? "border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan"
                : "border-cyber-border text-cyber-muted hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TELEMETRY TABLE EXPLORER */}
      <div className="bg-cyber-surface border border-cyber-border/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] text-white font-bold uppercase">
            {activeTab === "live" ? "REAL-TIME ROLLING BUFFER (MOST RECENT 30-60s)" : activeTab === "investigation" ? "INCIDENT EVIDENCE TELEMETRY" : "HISTORICAL ARCHIVE STORE"}
          </span>
          {activeTab === "live" && (
            <button
              onClick={clearLiveBuffer}
              className="font-mono text-[9px] text-cyber-muted hover:text-white cursor-pointer uppercase border border-cyber-border px-2 py-1"
            >
              CLEAR LIVE BUFFER
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-cyber-border/40 text-cyber-muted text-[9px] uppercase">
                <th className="py-2 px-3">TIME</th>
                <th className="py-2 px-3">TYPE</th>
                <th className="py-2 px-3">SOURCE</th>
                <th className="py-2 px-3">DESTINATION</th>
                <th className="py-2 px-3">ACCOUNT</th>
                <th className="py-2 px-3">EVENT DESCRIPTION</th>
                <th className="py-2 px-3">STATUS</th>
                <th className="py-2 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {displayEvents.map((event) => {
                const isSelected = selectedSourceEvidenceId === event.id;
                return (
                  <React.Fragment key={event.id}>
                    <tr className={`border-b border-cyber-border/20 hover:bg-cyber-hover/40 transition-colors ${
                      isSelected ? "bg-cyber-cyan/10 border-l-2 border-cyber-cyan" : ""
                    }`}>
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">{event.timestamp}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 border uppercase font-bold text-[9px] ${TYPE_COLOR[event.type] || TYPE_COLOR.ENGINE}`}>
                          {event.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-white font-bold whitespace-nowrap">{event.source}</td>
                      <td className="py-2.5 px-3 text-cyber-muted whitespace-nowrap">{event.destination || "—"}</td>
                      <td className="py-2.5 px-3 text-cyber-cyan font-semibold whitespace-nowrap">{event.account || "system"}</td>
                      <td className="py-2.5 px-3 text-cyber-text">{event.description}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 border uppercase font-bold text-[9px] ${STATUS_COLOR[event.status]}`}>
                          {event.status === "missing" ? "NO TELEMETRY" : event.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSourceEvidenceId(isSelected ? null : event.id)}
                          className="text-cyber-cyan hover:underline font-bold text-[9px] cursor-pointer"
                        >
                          {isSelected ? "HIDE" : "INSPECT"}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Event Details */}
                    {isSelected && (
                      <tr className="bg-cyber-bg border-b border-cyber-border/40">
                        <td colSpan={8} className="p-4">
                          <div className="border border-cyber-cyan/40 p-3 space-y-2">
                            <div className="flex justify-between items-center text-cyber-cyan font-bold">
                              <span>SYNTHETIC TELEMETRY PACKET DETAILS // ID: {event.id}</span>
                              <span>RELIABILITY: {(event.reliability * 100).toFixed(0)}%</span>
                            </div>
                            <p className="text-white text-xs font-sans">{event.description}</p>
                            {event.details && (
                              <p className="text-cyber-muted text-[10px] font-mono bg-cyber-surface p-2 border border-cyber-border/30">
                                {event.details}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {displayEvents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-cyber-muted font-sans text-xs">
                    No telemetry events currently in this store tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
