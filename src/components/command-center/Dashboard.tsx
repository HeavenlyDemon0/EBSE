import React, { useState, useEffect, useRef } from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  AlertCircle, HelpCircle, ChevronRight, CheckCircle2, XCircle,
  FileText, Terminal, Cpu, Database, ShieldAlert
} from "lucide-react";
import { DemoController } from "../demo/DemoController";

export const Dashboard: React.FC = () => {
  const {
    state,
    setActiveView,
    setTelemetryIntegrity,
    investigateLog,
    restoreDelayedEvidence,
    setSelectedHypothesisId,
    isSimulatingInvestigation
  } = useSimulation();

  const prevDebt = useRef(state.evidenceDebt);
  const [debtFlash, setDebtFlash] = useState(false);

  const [tickerLogs, setTickerLogs] = useState<Array<{ id: number; time: string; type: string; text: string; isAlert: boolean }>>([]);
  const tickerIdRef = useRef(0);

  // Animate Evidence Debt number when it changes
  useEffect(() => {
    if (prevDebt.current !== state.evidenceDebt) {
      setDebtFlash(true);
      setTimeout(() => setDebtFlash(false), 600);
      prevDebt.current = state.evidenceDebt;
    }
  }, [state.evidenceDebt]);

  // Live ticker feed
  useEffect(() => {
    const seed = [
      { type: "AUTH", text: "WS-041 → VPN auth session verified", isAlert: false },
      { type: "NET", text: "WS-041 → LOG-SRV-12 SMB packet observed", isAlert: false },
      { type: "PROC", text: "PowerShell execution detected on LOG-SRV-12", isAlert: true },
      { type: "SYS", text: "Telemetry link degradation on subnet MIL-LOG-07", isAlert: true },
      { type: "ENGINE", text: "Hypothesis confidence recalculated", isAlert: false },
    ];
    const initial = seed.map((s, i) => ({
      id: i,
      time: new Date().toISOString().slice(11, 19),
      ...s
    }));
    setTickerLogs(initial);
    tickerIdRef.current = seed.length;

    const randomItems = [
      { type: "NET", text: "GATEWAY-01 session packet received", isAlert: false },
      { type: "AUTH", text: "svc_logistics token validated", isAlert: false },
      { type: "SYS", text: "Telemetry buffer queue: normal", isAlert: false },
      { type: "ENGINE", text: "Evidence debt recalculated", isAlert: false },
      { type: "SYS", text: "Log archive sync: complete", isAlert: false },
    ];

    const interval = setInterval(() => {
      const pick = randomItems[Math.floor(Math.random() * randomItems.length)];
      const now = new Date().toISOString().slice(11, 19);
      setTickerLogs(prev => [{ id: tickerIdRef.current++, time: now, ...pick }, ...prev.slice(0, 7)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // ─── Derived helpers ───
  const completeness = state.evidenceCompleteness;
  const debt = state.evidenceDebt;
  const isResolved = state.investigatedLogs.length > 0;

  const barColor = completeness >= 90 ? "bg-cyber-green" : completeness >= 60 ? "bg-cyber-amber" : "bg-cyber-red";
  const completenessLabel = completeness >= 90 ? "COMPLETE" : completeness >= 60 ? "PARTIAL" : "SEVERELY INCOMPLETE";
  const completenessTextColor = completeness >= 90 ? "text-cyber-green-text" : completeness >= 60 ? "text-cyber-amber-text" : "text-cyber-red-text";

  const debtSeverity = debt <= 15 ? "LOW" : debt <= 40 ? "MODERATE" : "CRITICAL";
  const debtBorderColor = debt <= 15 ? "border-cyber-green/50 bg-cyber-green/5" : debt <= 40 ? "border-cyber-amber/50 bg-cyber-amber/5" : "border-cyber-red/50 bg-cyber-red/5";
  const debtTextColor = debt <= 15 ? "text-cyber-green-text" : debt <= 40 ? "text-cyber-amber-text" : "text-cyber-red-text";

  const confidenceLabel = completeness >= 90 ? "HIGH" : completeness >= 60 ? "MODERATE" : "LOW";

  const handleExportSummary = () => {
    const leading = state.activeHypotheses.find(h => h.status === 'leading');
    alert(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `INVESTIGATION SUMMARY — EBHE-0427\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Network Segment : ${state.activeScenario === 'alpha' ? 'MIL-LOG-NET-07' : state.activeScenario === 'bravo' ? 'MIL-OPS-NET-09' : 'MIL-SEC-DATA-01'}\n` +
      `Telemetry State : ${state.telemetryIntegrity}%\n` +
      `Evidence Debt   : ${debt}/100 (${debtSeverity})\n` +
      `Completeness    : ${completeness}%\n` +
      `Active Hyp.     : ${state.activeHypotheses.length}\n\n` +
      `LEADING HYPOTHESIS\n` +
      `  ${leading?.name ?? 'None'}\n` +
      `  Confidence: ${leading?.confidence ?? 0}%\n\n` +
      `CRITICAL UNRESOLVED\n` +
      `${state.whatWeDontKnow.map(q => `  ${q}`).join('\n')}\n\n` +
      `NOTE: No conclusion classified as CONFIRMED\n` +
      `without direct supporting evidence.\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );
  };

  return (
    <div className="space-y-5">

      {/* Demo walkthrough bar */}
      <DemoController />

      {/* ─── INVESTIGATION HEADER ─── */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-3 pb-4 border-b border-cyber-border/40">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="status-pill border-cyber-red/40 bg-cyber-red/10 text-cyber-red-text">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-red animate-pulse" />
              ACTIVE INVESTIGATION
            </span>
            <span className="status-pill border-cyber-amber/30 bg-cyber-amber/5 text-cyber-amber-text">
              {completeness < 90 ? "EVIDENCE INCOMPLETE" : "EVIDENCE RESOLVED"}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-sans uppercase leading-tight">
            {state.activeScenario === 'alpha' ? "Suspected Lateral Movement & Credential Compromise"
              : state.activeScenario === 'bravo' ? "Active Subnet Propagation — Service Exploitation"
              : "Out-of-Hours Database Exfiltration"}
          </h1>
          <p className="text-[11px] text-cyber-muted mt-1 font-mono">
            Incident EBHE-0427 · Network: <span className="text-cyber-text font-semibold">{state.activeScenario === 'alpha' ? 'MIL-LOG-NET-07' : state.activeScenario === 'bravo' ? 'MIL-OPS-NET-09' : 'MIL-SEC-DATA-01'}</span> · Logistics Infrastructure
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-6 font-mono text-[11px] shrink-0">
          <div className="text-right">
            <span className="block text-[9px] text-cyber-muted uppercase tracking-wider mb-0.5">First Observed</span>
            <span className="text-white font-bold">14:32:07 UTC</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-cyber-muted uppercase tracking-wider mb-0.5">Last Evidence</span>
            <span className="text-white font-bold">14:41:15 UTC</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-cyber-muted uppercase tracking-wider mb-0.5">Evidence Completeness</span>
            <span className={`text-lg font-black ${completenessTextColor}`}>{completeness}%</span>
          </div>
        </div>
      </div>

      {/* ─── TOP METRIC STRIP ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

        <div className="bg-cyber-surface border border-cyber-border/50 p-4">
          <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest block">Active Hypotheses</span>
          <div className="flex items-end justify-between mt-2">
            <span className={`text-4xl font-black text-white leading-none transition-all duration-300`}>
              0{state.activeHypotheses.length}
            </span>
            <span className="font-mono text-[9px] text-cyber-muted pb-1">SURVIVING</span>
          </div>
        </div>

        <div className="bg-cyber-surface border border-cyber-border/50 p-4">
          <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest block">Evidence Events</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-4xl font-black text-white leading-none">{state.evidenceEvents.length}</span>
            <span className="font-mono text-[9px] text-cyber-muted pb-1">INGESTED</span>
          </div>
        </div>

        <div className="bg-cyber-surface border border-cyber-border/50 p-4">
          <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest block">Evidence Completeness</span>
          <div className="flex items-end justify-between mt-2">
            <span className={`text-4xl font-black leading-none transition-all duration-500 ${completenessTextColor}`}>{completeness}%</span>
            <span className={`font-mono text-[8px] font-bold pb-1 ${completenessTextColor}`}>{completenessLabel}</span>
          </div>
        </div>

        {/* EVIDENCE DEBT — THE HERO METRIC */}
        <div className={`border p-4 transition-all duration-500 ${debtBorderColor} relative`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest font-bold">Evidence Debt</span>
            <span title="Unresolved uncertainty caused by missing, delayed, contradictory, or insufficient evidence.">
              <HelpCircle className="w-3 h-3 opacity-50 cursor-help" />
            </span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <span className={`text-4xl font-black leading-none transition-all duration-500 ${debtFlash ? 'value-changed' : ''} ${debtTextColor}`}>
              {debt}
            </span>
            <div className="pb-1 text-right">
              <span className="font-mono text-[9px] text-cyber-muted block">/ 100</span>
              <span className={`font-mono text-[9px] font-black ${debtTextColor}`}>{debtSeverity}</span>
            </div>
          </div>
        </div>

        <div className="bg-cyber-surface border border-cyber-border/50 p-4">
          <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest block">Critical Gaps</span>
          <div className="flex items-end justify-between mt-2">
            <span className={`text-4xl font-black leading-none transition-all duration-300 ${state.criticalGaps >= 3 ? 'text-cyber-red-text' : state.criticalGaps >= 1 ? 'text-cyber-amber-text' : 'text-cyber-green-text'}`}>
              0{state.criticalGaps}
            </span>
            <span className="font-mono text-[9px] text-cyber-muted pb-1">MISSING</span>
          </div>
        </div>

      </div>

      {/* ─── TELEMETRY INTEGRITY HERO ─── */}
      <div className="bg-cyber-surface border border-cyber-border/50 p-5 relative">
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-cyber-green/30" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-cyber-green/30" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-cyber-green/30" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-cyber-green/30" />

        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <h3 className="text-white text-sm font-bold tracking-wider font-mono flex items-center gap-2 uppercase">
              <Database className="w-4 h-4 text-cyber-cyan shrink-0" />
              TELEMETRY INTEGRITY
            </h3>
            <p className="text-[10px] text-cyber-muted mt-0.5 font-sans max-w-lg">
              Incoming network telemetry represents the evidence available for hypothesis evaluation. Reducing integrity simulates sensor failure, network disruption, or link blockage.
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {[100, 70, 40].map(level => (
              <button
                key={level}
                onClick={() => setTelemetryIntegrity(level)}
                className={`px-3 py-1.5 font-mono text-[11px] font-bold border transition-all cursor-pointer ${state.telemetryIntegrity === level
                  ? level === 100 ? 'bg-cyber-green/15 border-cyber-green text-cyber-green-text'
                  : level === 70 ? 'bg-cyber-amber/15 border-cyber-amber text-cyber-amber-text'
                  : 'bg-cyber-red/15 border-cyber-red text-cyber-red-text'
                  : 'border-cyber-border text-cyber-muted hover:border-cyber-muted hover:text-white'}`}
              >
                {level}%
              </button>
            ))}
          </div>
        </div>

        {/* Large progress bar */}
        <div className="mb-3">
          <div className="h-7 w-full bg-cyber-bg border border-cyber-border overflow-hidden relative">
            <div
              className={`h-full transition-all duration-700 ease-in-out ${barColor}`}
              style={{ width: `${state.telemetryIntegrity}%` }}
            />
            {/* Overlay text */}
            <div className="absolute inset-0 flex items-center justify-between px-3 font-mono text-[10px] font-bold pointer-events-none">
              <span className="text-white mix-blend-difference">ACTIVE SENSOR STREAM</span>
              <span className="text-white mix-blend-difference">{state.telemetryIntegrity}% INTEGRITY</span>
            </div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-cyber-muted mt-1.5">
            <span>STATUS: <strong className={completenessTextColor}>{completenessLabel}</strong></span>
            <span>CONFIDENCE INDEX: <strong className={debtTextColor}>{confidenceLabel}</strong></span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2.5 pt-3 border-t border-cyber-border/30">
          <button
            onClick={() => setTelemetryIntegrity(40)}
            className="px-4 py-2 bg-cyber-red/10 border border-cyber-red hover:bg-cyber-red hover:text-cyber-bg transition-all text-cyber-red-text font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
          >
            [ SIMULATE TELEMETRY LOSS (40%) ]
          </button>
          <button
            onClick={restoreDelayedEvidence}
            disabled={state.telemetryIntegrity !== 40 || isResolved || isSimulatingInvestigation}
            className="px-4 py-2 bg-cyber-green/10 border border-cyber-green hover:bg-cyber-green hover:text-cyber-bg transition-all text-cyber-green-text font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSimulatingInvestigation ? "[ RETRIEVING EVIDENCE... ]" : "[ RESTORE DELAYED EVIDENCE ]"}
          </button>
        </div>
      </div>

      {/* ─── MAIN TWO-COLUMN GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT 2 cols: SURVIVING ATTACK HYPOTHESES */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-cyber-border/40">
            <h3 className="text-white text-[11px] font-bold font-mono tracking-wider uppercase flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-cyber-amber" />
              SURVIVING ATTACK HYPOTHESES
            </h3>
            <span className="font-mono text-[9px] text-cyber-muted italic">CONFIDENCE ≠ CERTAINTY</span>
          </div>

          <div className="space-y-2.5">
            {state.activeHypotheses.map((hyp) => {
              const isSelected = state.selectedHypothesisId === hyp.id;
              const confBar = hyp.confidence;

              return (
                <div
                  key={hyp.id}
                  onClick={() => setSelectedHypothesisId(hyp.id)}
                  className={`bg-cyber-surface border transition-all cursor-pointer relative overflow-hidden group ${isSelected ? 'border-cyber-cyan/50 shadow-lg shadow-cyber-cyan/5' : 'border-cyber-border/60 hover:border-cyber-border/90'}`}
                >
                  {/* Confidence bar stripe */}
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 transition-all duration-700 ${hyp.status === 'leading' ? 'bg-cyber-cyan' : hyp.status === 'plausible' ? 'bg-cyber-amber' : 'bg-cyber-border'}`}
                    style={{ width: `${confBar}%` }}
                  />

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-[9px] px-1.5 py-0.5 border font-bold uppercase tracking-wider shrink-0 ${statusColor}">
                            {hyp.status.toUpperCase()}
                          </span>
                          <h4 className="text-sm font-black text-white uppercase tracking-wide truncate font-sans">
                            {hyp.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-cyber-muted leading-relaxed font-sans pr-4 line-clamp-2">
                          {hyp.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-[8px] text-cyber-muted font-mono uppercase">Confidence</span>
                        <span className={`text-2xl font-black font-sans leading-tight ${hyp.status === 'leading' ? 'text-white' : hyp.status === 'plausible' ? 'text-cyber-amber-text' : 'text-cyber-muted'}`}>
                          {hyp.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-cyber-border/20 flex items-center justify-between">
                      <div className="flex gap-4 font-mono text-[10px]">
                        <span>
                          <span className="text-cyber-muted">Evidence: </span>
                          <strong className="text-white">{hyp.supportingEvidence.length} logs</strong>
                        </span>
                        <span>
                          <span className="text-cyber-muted">Debt: </span>
                          <strong className={debtTextColor}>{hyp.evidenceDebt}</strong>
                        </span>
                        {hyp.missingEvidence.length > 0 && (
                          <span>
                            <span className="text-cyber-muted">Missing: </span>
                            <strong className="text-cyber-amber-text">{hyp.missingEvidence.length}</strong>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedHypothesisId(hyp.id); setActiveView("investigation"); }}
                        className="flex items-center gap-1 font-mono text-[9px] text-cyber-cyan hover:underline cursor-pointer"
                      >
                        DEEP DIVE <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 1 col: NEXT BEST EVIDENCE */}
        <div className="space-y-3">
          <div className="pb-1.5 border-b border-cyber-border/40">
            <h3 className="text-white text-[11px] font-bold font-mono tracking-wider uppercase flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-cyber-cyan" />
              NEXT EVIDENCE TO CHECK
            </h3>
          </div>

          <div className="bg-cyber-surface border border-cyber-border/50 p-4 space-y-3">
            <p className="text-[10px] text-cyber-muted leading-relaxed font-sans border-b border-cyber-border/30 pb-3">
              Evidence ranked by expected information gain — the ability to distinguish between surviving hypotheses.
            </p>

            {state.recommendedEvidence.map((rec, i) => (
              <div
                key={rec.id}
                className={`p-3 border transition-all ${i === 0 ? 'border-cyber-cyan/30 bg-cyber-cyan/5' : 'border-cyber-border/40 bg-cyber-bg'}`}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="font-mono text-[10px] font-black text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-1.5 py-0.5 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h5 className="font-mono text-[10px] text-white font-bold uppercase leading-tight flex-1">
                    {rec.title}
                  </h5>
                </div>

                <p className="text-[10px] text-cyber-muted leading-relaxed font-sans mb-3">
                  {rec.reason}
                </p>

                <div className="flex items-center justify-between text-[9px] font-mono">
                  <div className="flex items-center gap-3">
                    <span className={rec.impact === 'HIGH' ? 'text-cyber-red-text font-bold' : 'text-cyber-amber-text font-bold'}>
                      {rec.impact} IMPACT
                    </span>
                    <span className="text-cyber-muted">
                      GAIN: <strong className="text-white">{rec.informationGain}</strong>
                    </span>
                  </div>
                  {i === 0 && (
                    <button
                      onClick={() => investigateLog(rec.id)}
                      disabled={isSimulatingInvestigation || state.telemetryIntegrity !== 40 || isResolved}
                      className="px-3 py-1.5 bg-cyber-cyan text-cyber-bg hover:bg-cyber-cyan/90 font-mono text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isSimulatingInvestigation ? "RETRIEVING..." : "[ INVESTIGATE ]"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── WHAT WE KNOW / WHAT WE DON'T KNOW ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-cyber-surface border border-cyber-green/25 p-5 relative">
          <div className="absolute top-0 left-0 h-0.5 w-12 bg-cyber-green" />
          <h4 className="text-white text-[11px] font-bold font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyber-green" />
            WHAT WE KNOW — OBSERVED FACTS
          </h4>
          <ul className="space-y-2">
            {state.whatWeKnow.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-[11px] text-cyber-text font-sans leading-relaxed">
                <span className="text-cyber-green font-bold font-mono shrink-0 mt-0.5">✓</span>
                <span>{item.replace(/^✓\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-cyber-surface border border-cyber-amber/25 p-5 relative">
          <div className="absolute top-0 left-0 h-0.5 w-12 bg-cyber-amber" />
          <h4 className="text-white text-[11px] font-bold font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-cyber-amber" />
            WHAT WE DON'T KNOW — UNCERTAINTY GAPS
          </h4>
          <ul className="space-y-2">
            {state.whatWeDontKnow.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-[11px] text-cyber-text font-sans leading-relaxed">
                <span className="text-cyber-amber font-bold font-mono shrink-0 mt-0.5">?</span>
                <span>{item.replace(/^\?\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── BOTTOM ROW: LIVE STREAM + SYSTEM ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Live stream */}
        <div className="lg:col-span-2 bg-cyber-surface border border-cyber-border/40 p-4">
          <h4 className="text-[10px] text-cyber-muted font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            LIVE AIR-GAPPED EVIDENCE STREAM
          </h4>
          <div className="bg-cyber-bg border border-cyber-border/40 h-36 overflow-hidden">
            <div className="p-2 space-y-1">
              {tickerLogs.map(log => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 font-mono text-[10px] py-0.5 px-1 animate-drop-in ${log.isAlert ? 'text-cyber-amber-text' : 'text-cyber-muted'}`}
                >
                  <span className="text-cyber-cyan/60 shrink-0">&gt;&gt;</span>
                  <span className="text-cyber-muted/60 shrink-0">{log.time}</span>
                  <span className={`shrink-0 font-semibold ${log.type === 'AUTH' ? 'text-cyber-cyan/70' : log.type === 'PROC' ? 'text-cyber-amber/70' : 'text-cyber-muted/60'}`}>
                    [{log.type}]
                  </span>
                  <span className="flex-1">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status & Export */}
        <div className="bg-cyber-surface border border-cyber-border/40 p-4 space-y-3">
          <h4 className="text-[10px] text-cyber-muted font-mono font-bold uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            SYSTEM STATUS
          </h4>

          <div className="grid grid-cols-2 gap-2 font-mono text-[9px]">
            {[
              { label: "EBHE ENGINE", value: "OPERATIONAL", color: "text-cyber-green" },
              { label: "LOCAL PROCESSING", value: "ACTIVE", color: "text-cyber-green" },
              { label: "EXT. CONNECTIVITY", value: "DISCONNECTED", color: "text-cyber-red" },
              { label: "SIMULATION MODE", value: "ACTIVE", color: "text-cyber-cyan" },
            ].map(item => (
              <div key={item.label} className="bg-cyber-bg border border-cyber-border/40 p-2">
                <span className="text-cyber-muted/70 text-[8px] block uppercase">{item.label}</span>
                <span className={`font-bold ${item.color} text-[9px]`}>● {item.value}</span>
              </div>
            ))}
          </div>

          {/* Investigation Summary */}
          <div className="bg-cyber-bg border border-cyber-border/40 p-3 text-[10px] font-sans space-y-1.5">
            <div className="font-mono text-[9px] text-cyber-muted uppercase font-bold border-b border-cyber-border/30 pb-1.5 mb-1.5">
              CURRENT ASSESSMENT
            </div>
            <p className="text-cyber-text leading-relaxed">
              {state.activeHypotheses.find(h => h.status === 'leading')?.name || 'No leading hypothesis'} remains the leading hypothesis.
            </p>
            <div className="pt-1 border-t border-cyber-border/30 mt-2 text-[9px] font-mono text-cyber-muted italic">
              No conclusion is classified as confirmed without direct supporting evidence.
            </div>
          </div>

          <button
            onClick={handleExportSummary}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-cyber-border hover:border-cyber-muted text-cyber-text font-mono text-[10px] font-bold uppercase transition-all cursor-pointer bg-cyber-bg hover:bg-cyber-hover"
          >
            <FileText className="w-3.5 h-3.5" />
            EXPORT INVESTIGATION SUMMARY
          </button>
        </div>

      </div>

    </div>
  );
};
