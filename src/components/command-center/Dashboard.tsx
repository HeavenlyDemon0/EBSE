import React, { useState, useEffect, useRef } from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  CheckCircle2, XCircle, ChevronRight,
  HelpCircle, ChevronDown, Loader2, ExternalLink, Play, Pause
} from "lucide-react";
import { DemoController } from "../demo/DemoController";
import { HypothesisDrawer } from "../ui/HypothesisDrawer";
import { ReasoningTraceDrawer } from "../ui/ReasoningTraceDrawer";
import { FalsificationPanel } from "../ui/FalsificationPanel";
import { Tooltip } from "../ui/Tooltip";
import type { Hypothesis } from "../../types";

const MiniAttackPath: React.FC<{ steps: Hypothesis["steps"] }> = ({ steps }) => (
  <div className="flex items-center gap-1 flex-wrap mt-2">
    {steps.map((step, i) => (
      <React.Fragment key={step.id}>
        <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 border ${
          step.status === "confirmed" ? "border-cyber-green/30 text-cyber-green-text bg-cyber-green/5"
          : step.status === "supported" ? "border-cyber-cyan/30 text-cyber-cyan bg-cyber-cyan/5"
          : step.status === "unverified" ? "border-cyber-amber/30 text-cyber-amber-text bg-cyber-amber/5"
          : "border-cyber-red/30 text-cyber-red-text bg-cyber-red/5"
        }`}>
          {step.name.split(" ")[0]}
        </span>
        {i < steps.length - 1 && (
          <ChevronRight className="w-2.5 h-2.5 text-cyber-border shrink-0" />
        )}
      </React.Fragment>
    ))}
  </div>
);

const DebtBreakdown: React.FC<{ debt: number; show: boolean }> = ({ debt, show }) => {
  if (!show) return null;
  const missing = Math.round(debt * 0.42);
  const delayed = Math.round(debt * 0.22);
  const unverified = Math.round(debt * 0.24);
  const contradictions = debt - missing - delayed - unverified;
  return (
    <div className="mt-3 border-t border-cyber-border/40 pt-3 space-y-1.5 animate-drop-in">
      <div className="font-mono text-[9px] text-cyber-muted uppercase tracking-wider mb-2">WHY DEBT IS {debt}?</div>
      {[
        { label: "Missing telemetry events", value: missing, color: "text-cyber-red-text" },
        { label: "Delayed stream buffers", value: delayed, color: "text-cyber-amber-text" },
        { label: "Unverified logical inferences", value: unverified, color: "text-cyber-amber-text" },
        { label: "Contradictory evidence", value: contradictions, color: "text-cyber-red-text" },
      ].map(item => (
        <div key={item.label} className="flex items-center justify-between font-mono text-[10px]">
          <span className="text-cyber-muted">{item.label}</span>
          <span className={`font-bold ${item.color}`}>+{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const {
    state,
    setActiveView,
    setTelemetryIntegrity,
    investigateLog,
    isSimulatingInvestigation,
    togglePauseStream,
    clearLiveBuffer,
    openReasoningTrace
  } = useSimulation();

  const [drawerHyp, setDrawerHyp] = useState<Hypothesis | null>(null);
  const [showDebtBreakdown, setShowDebtBreakdown] = useState(false);

  const prevDebt = useRef(state.evidenceDebt);
  const [debtFlash, setDebtFlash] = useState(false);

  useEffect(() => {
    if (prevDebt.current !== state.evidenceDebt) {
      setDebtFlash(true);
      setTimeout(() => setDebtFlash(false), 700);
      prevDebt.current = state.evidenceDebt;
      setShowDebtBreakdown(false);
    }
  }, [state.evidenceDebt]);

  // Derived metrics
  const debt = state.evidenceDebt;
  const completeness = state.evidenceCompleteness;
  const isResolved = state.investigatedLogs.length > 0;
  const atLoss = state.telemetryIntegrity === 40;

  const barColor = state.telemetryIntegrity >= 90 ? "bg-cyber-green" : state.telemetryIntegrity >= 60 ? "bg-cyber-amber" : "bg-cyber-red";
  const telLabel = state.telemetryIntegrity >= 90 ? "100% COMPLETE" : state.telemetryIntegrity >= 60 ? "70% PARTIAL" : "40% SEVERELY INCOMPLETE";
  const telTextColor = state.telemetryIntegrity >= 90 ? "text-cyber-green-text" : state.telemetryIntegrity >= 60 ? "text-cyber-amber-text" : "text-cyber-red-text";

  const debtSeverity = debt <= 15 ? "LOW UNCERTAINTY" : debt <= 40 ? "MODERATE UNCERTAINTY" : "CRITICAL UNCERTAINTY";
  const debtColor = debt <= 15 ? "text-cyber-green-text" : debt <= 40 ? "text-cyber-amber-text" : "text-cyber-red-text";
  const debtBg = debt <= 15 ? "border-cyber-green/40 bg-cyber-green/5" : debt <= 40 ? "border-cyber-amber/40 bg-cyber-amber/5" : "border-cyber-red/50 bg-cyber-red/5";

  const leadingHyp = state.activeHypotheses.find(h => h.status === "leading") ?? state.activeHypotheses[0];
  const otherHyps = state.activeHypotheses.filter(h => h.id !== leadingHyp?.id);
  const topRec = state.recommendedEvidence[0];

  const scenarioName = state.activeScenario === "alpha"
    ? "Suspected Lateral Movement & Credential Compromise"
    : state.activeScenario === "bravo"
    ? "Active Subnet Propagation — Service Exploitation"
    : "Out-of-Hours Database Exfiltration";
  const segment = state.activeScenario === "alpha" ? "MIL-LOG-NET-07" : state.activeScenario === "bravo" ? "MIL-OPS-NET-09" : "MIL-SEC-DATA-01";

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── Guided Demo Controller ── */}
      <DemoController />

      {/* ═══ SECTION A: INCIDENT HEADER ═══ */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 pb-5 border-b border-cyber-border/30">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-cyber-red/40 bg-cyber-red/10 font-mono text-[10px] font-black uppercase tracking-widest text-cyber-red-text">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-red animate-pulse" />
              ACTIVE INCIDENT INVESTIGATION
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] font-black uppercase tracking-widest ${completeness < 90 ? "border-cyber-amber/30 bg-cyber-amber/5 text-cyber-amber-text" : "border-cyber-green/30 bg-cyber-green/5 text-cyber-green-text"}`}>
              {completeness < 90 ? "EVIDENCE INCOMPLETE" : "EVIDENCE RESOLVED"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight uppercase mb-1.5">
            {scenarioName}
          </h1>
          <p className="font-mono text-[11px] text-cyber-muted">
            Incident <strong className="text-white">EBHE-0427</strong>
            {" · "}Network Segment: <strong className="text-white">{segment}</strong>
            {" · "}Logistics Subnet
          </p>
        </div>

        <div className="flex gap-6 font-mono text-[11px] shrink-0">
          <div className="text-right">
            <span className="block text-[9px] text-cyber-muted uppercase tracking-wider">LIVE SYSTEM CLOCK</span>
            <span className="text-cyber-green font-bold text-base block mt-0.5">● {state.currentTimeStr}</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-cyber-muted uppercase tracking-wider">INCIDENT STARTED</span>
            <span className="text-white font-bold block mt-0.5">{state.incidentStartTimeStr}</span>
          </div>
        </div>
      </div>

      {/* ═══ SECTION B: TELEMETRY INTEGRITY HERO ═══ */}
      <div className="bg-cyber-surface border border-cyber-border/40 p-5 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
          <div>
            <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest block mb-1">
              HOW MUCH EVIDENCE DO WE HAVE?
            </span>
            <h3 className="text-white text-base font-black uppercase tracking-wide flex items-center gap-2">
              TELEMETRY INTEGRITY — {completeness}% AVAILABLE
            </h3>
            <p className="text-[11px] text-cyber-muted font-sans mt-1 max-w-md">
              Incoming sensor stream quality for {segment}. Triggering telemetry loss simulates network link failure or log blockage.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`font-mono text-3xl font-black ${telTextColor}`}>{state.telemetryIntegrity}%</span>
            <span className={`font-mono text-[10px] font-bold uppercase px-2.5 py-1 border ${telTextColor} ${state.telemetryIntegrity >= 90 ? "border-cyber-green/40 bg-cyber-green/5" : state.telemetryIntegrity >= 60 ? "border-cyber-amber/40 bg-cyber-amber/5" : "border-cyber-red/40 bg-cyber-red/5"}`}>
              {telLabel}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-5 w-full bg-cyber-bg border border-cyber-border overflow-hidden relative mb-1.5">
          <div
            className={`h-full transition-all duration-700 ease-in-out ${barColor}`}
            style={{ width: `${state.telemetryIntegrity}%` }}
          />
          <div className="absolute inset-0 flex items-center px-2.5 font-mono text-[9px] font-bold pointer-events-none">
            <span className="text-white mix-blend-difference">LIVE SENSOR STREAM — {state.telemetryIntegrity}% INTEGRITY ({completeness}% AVAILABLE)</span>
          </div>
        </div>

        <div className="text-[9px] font-mono text-cyber-muted mb-4">
          Critical Gaps: <strong className={state.criticalGaps > 0 ? "text-cyber-red-text" : "text-cyber-green-text"}>{state.criticalGaps}</strong>
          {"   ·   "}
          Stream Status: <strong className={state.isStreamPaused ? "text-cyber-amber-text" : "text-cyber-green-text"}>{state.isStreamPaused ? "PAUSED" : "CONTINUOUS STREAM ACTIVE"}</strong>
        </div>

        {/* ACTION CONTROL BUTTONS */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-cyber-border/30">
          <button
            onClick={() => setTelemetryIntegrity(40)}
            disabled={state.telemetryIntegrity === 40}
            className="px-5 py-2.5 bg-cyber-red/10 border border-cyber-red text-cyber-red-text hover:bg-cyber-red hover:text-white transition-all font-mono text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            SIMULATE TELEMETRY LOSS
          </button>
          {atLoss && !isResolved && (
            <button
              onClick={() => setTelemetryIntegrity(100)}
              className="px-4 py-2.5 border border-cyber-border text-cyber-muted hover:text-white hover:border-cyber-muted transition-all font-mono text-[11px] font-bold uppercase cursor-pointer"
            >
              RESTORE TO BASELINE
            </button>
          )}
          {isResolved && (
            <span className="font-mono text-[10px] text-cyber-green-text font-bold">
              ✓ Evidence retrieved — assessment updated
            </span>
          )}
        </div>
      </div>

      {/* ═══ SECTION C: CURRENT ASSESSMENT & EVIDENCE DEBT ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* C1: CURRENT ASSESSMENT — LEADING EXPLANATION */}
        <div className="lg:col-span-2 bg-cyber-surface border-2 border-cyber-cyan/30 p-5 relative">
          <div className="absolute top-0 left-0 h-0.5 w-16 bg-cyber-cyan" />
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[9px] text-cyber-cyan uppercase tracking-widest block font-bold">
              CURRENT ASSESSMENT
            </span>
            <span className="font-mono text-[9px] text-cyber-muted italic">SUPPORT IS NOT CONFIRMATION</span>
          </div>

          {leadingHyp ? (
            <>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-xl font-black uppercase tracking-tight leading-tight mb-1.5">
                    {leadingHyp.name}
                  </h2>
                  <p className="text-[11px] text-cyber-muted font-sans leading-relaxed">
                    {leadingHyp.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-[8px] text-cyber-muted font-mono uppercase mb-0.5">CURRENT SUPPORT</span>
                  <span className="text-5xl font-black text-white leading-none block">{leadingHyp.confidence}%</span>
                  <span className="font-mono text-[9px] text-cyber-cyan font-bold block mt-1 uppercase">
                    {leadingHyp.confidence >= 80 ? "STRONGLY SUPPORTED" : "LEADING EXPLANATION"}
                  </span>
                </div>
              </div>

              {/* FEATURE #1: REASONING TRACE BUTTON */}
              <div className="my-4 p-3 bg-cyber-bg border border-cyber-cyan/30 flex items-center justify-between gap-4">
                <div className="text-[11px] text-cyber-text font-sans">
                  <strong>Why this assessment?</strong> Inspect the 5-step explicit reasoning chain from raw evidence to interpretation.
                </div>
                <button
                  onClick={() => openReasoningTrace(leadingHyp.id)}
                  className="px-4 py-2 bg-cyber-cyan text-cyber-bg hover:bg-white font-mono text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  [ WHY THIS ASSESSMENT? ]
                </button>
              </div>

              {/* Mini attack path */}
              <MiniAttackPath steps={leadingHyp.steps} />

              {/* OTHER EXPLANATIONS */}
              {otherHyps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-cyber-border/30">
                  <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-wider block mb-2.5">
                    ALTERNATIVE SURVIVING EXPLANATIONS ({otherHyps.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {otherHyps.map(hyp => (
                      <button
                        key={hyp.id}
                        onClick={() => setDrawerHyp(hyp)}
                        className="text-left p-3 border border-cyber-border/50 hover:border-cyber-border bg-cyber-bg hover:bg-cyber-hover/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-[11px] text-white font-bold uppercase font-sans truncate">{hyp.name}</span>
                          <span className="text-xl font-black text-cyber-amber-text shrink-0 leading-none">{hyp.confidence}%</span>
                        </div>
                        <MiniAttackPath steps={hyp.steps.slice(0, 3)} />
                        <span className="font-mono text-[9px] text-cyber-muted/70 mt-2 block group-hover:text-cyber-muted transition-colors">
                          INSPECT EXPLANATION →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-cyber-muted text-sm">No active hypothesis.</p>
          )}
        </div>

        {/* C2: UNCERTAINTY FROM MISSING EVIDENCE (EVIDENCE DEBT) */}
        <div className={`bg-cyber-surface border-2 p-5 relative flex flex-col justify-between ${debtBg}`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-cyber-muted">
                <Tooltip content="Unresolved uncertainty caused by incomplete telemetry. Higher score = less reliable assessment." position="top">
                  UNCERTAINTY FROM MISSING EVIDENCE
                </Tooltip>
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-cyber-muted/50 cursor-help" />
            </div>

            <div className="mb-2">
              <span className="text-[9px] font-mono text-cyber-muted block uppercase mb-1">Evidence Debt</span>
              <div className={`text-6xl font-black leading-none transition-all duration-500 ${debtFlash ? "value-changed" : ""} ${debtColor}`}>
                {debt} <span className="text-sm font-normal text-cyber-muted">/ 100</span>
              </div>
            </div>

            <div className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-black uppercase px-2.5 py-1 border mt-2 ${debtColor} ${debt <= 15 ? "border-cyber-green/40 bg-cyber-green/10" : debt <= 40 ? "border-cyber-amber/40 bg-cyber-amber/10" : "border-cyber-red/40 bg-cyber-red/10"}`}>
              {debtSeverity}
            </div>

            <DebtBreakdown debt={debt} show={showDebtBreakdown} />
          </div>

          <div className="mt-4 pt-4 border-t border-cyber-border/30 space-y-2">
            <p className="text-[10px] text-cyber-muted font-sans leading-relaxed">
              {debt <= 15
                ? "Assessment is well-supported with low uncertainty."
                : debt <= 40
                ? "Moderate unresolved telemetry conditions present."
                : "Critical uncertainty. Assessment cannot be confirmed without telemetry."}
            </p>
            <button
              onClick={() => setShowDebtBreakdown(v => !v)}
              className="flex items-center gap-1.5 font-mono text-[10px] text-cyber-muted hover:text-white transition-colors cursor-pointer"
            >
              {showDebtBreakdown ? "HIDE BREAKDOWN" : "VIEW UNCERTAINTY BREAKDOWN"}
              {showDebtBreakdown ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ FEATURE #2: WHAT WOULD CHANGE THIS ASSESSMENT? ═══ */}
      {leadingHyp && (
        <FalsificationPanel
          hypothesis={leadingHyp}
          onCheckEvidence={() => {
            if (topRec) investigateLog(topRec.id);
          }}
        />
      )}

      {/* ═══ SECTION D: KNOWN / UNRESOLVED ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 border-l-2 border-cyber-green bg-cyber-surface">
          <h4 className="font-mono text-[10px] text-cyber-green font-black uppercase tracking-widest mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            OBSERVED FACTS — WHAT WE KNOW
          </h4>
          <ul className="space-y-2">
            {state.whatWeKnow.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[11px] font-sans">
                <span className="text-cyber-green font-mono font-bold shrink-0 mt-0.5">✓</span>
                <span className="text-cyber-text leading-relaxed">{item.replace(/^✓\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 border-l-2 border-cyber-amber bg-cyber-surface">
          <h4 className="font-mono text-[10px] text-cyber-amber font-black uppercase tracking-widest mb-3 flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5" />
            UNRESOLVED — WHAT WE DON'T KNOW
            <Tooltip content="Events EBHE cannot confirm due to missing telemetry. Not invented." position="top">
              <HelpCircle className="w-3 h-3 text-cyber-muted/60 ml-0.5" />
            </Tooltip>
          </h4>
          <ul className="space-y-2">
            {state.whatWeDontKnow.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[11px] font-sans">
                <span className="text-cyber-amber font-mono font-bold shrink-0 mt-0.5">?</span>
                <span className="text-cyber-text leading-relaxed">{item.replace(/^\?\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ═══ SECTION E: WHAT SHOULD WE CHECK NEXT? (ACTION CENTER) ═══ */}
      {topRec && (
        <div className="bg-cyber-surface border border-cyber-cyan/30 p-5 relative">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1 min-w-0">
              <span className="font-mono text-[9px] text-cyber-cyan uppercase tracking-widest font-black block mb-1">
                ACTION RECOMMENDATION
              </span>
              <h3 className="text-white text-lg font-black uppercase mb-1 leading-tight">
                WHAT SHOULD WE CHECK NEXT? — {topRec.title}
              </h3>
              <p className="text-[11px] text-cyber-muted font-sans leading-relaxed mb-3 max-w-xl">
                {topRec.reason}
              </p>

              <div className="flex flex-wrap items-center gap-4 font-mono text-[10px]">
                <span className={`font-black uppercase ${topRec.impact === "HIGH" ? "text-cyber-red-text" : "text-cyber-amber-text"}`}>
                  VALUE: {topRec.impact}
                </span>
                <span className="text-cyber-muted">
                  HOW USEFUL WOULD THIS BE?{" "}
                  <Tooltip content="Expected Information Gain (0.0 to 1.0) — ability to distinguish between surviving hypotheses." position="top">
                    <strong className="text-white border-b border-dashed border-cyber-muted/40">{topRec.informationGain}</strong>
                  </Tooltip>
                </span>
                <span className="text-cyber-muted">
                  Target Log: <strong className="text-white">{topRec.targetLogSource}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 self-start md:self-center">
              <button
                onClick={() => investigateLog(topRec.id)}
                disabled={isSimulatingInvestigation || !atLoss || isResolved}
                className="px-6 py-3 bg-cyber-cyan text-cyber-bg font-mono text-[12px] font-black uppercase tracking-wider hover:bg-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed min-w-[200px] text-center shadow-md"
              >
                {isSimulatingInvestigation ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> RETRIEVING EVIDENCE…
                  </span>
                ) : isResolved ? (
                  "✓ EVIDENCE RETRIEVED"
                ) : !atLoss ? (
                  "SIMULATE TELEMETRY LOSS FIRST"
                ) : (
                  "CHECK THIS EVIDENCE"
                )}
              </button>
              <button
                onClick={() => setActiveView("evidence")}
                className="flex items-center justify-center gap-1.5 font-mono text-[9px] text-cyber-muted hover:text-white transition-colors cursor-pointer py-1"
              >
                <ExternalLink className="w-3 h-3" /> VIEW EVIDENCE EXPLORER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SECTION F: LIVE SYNTHETIC TELEMETRY STREAM (REAL-TIME ENGINE) ═══ */}
      <div className="bg-cyber-surface border border-cyber-border/40 p-4">
        <div className="flex items-center justify-between mb-3 border-b border-cyber-border/30 pb-2">
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${state.isStreamPaused ? "bg-cyber-amber" : "bg-cyber-green animate-pulse"}`} />
            <span className="font-mono text-[10px] text-white uppercase tracking-wider font-bold">
              REAL-TIME SYNTHETIC TELEMETRY STREAM
            </span>
            <span className="font-mono text-[9px] text-cyber-muted">
              ({state.liveEventsBuffer.length} buffer events)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePauseStream}
              className={`px-2.5 py-1 border font-mono text-[9px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                state.isStreamPaused
                  ? "border-cyber-amber text-cyber-amber-text bg-cyber-amber/10"
                  : "border-cyber-border text-cyber-muted hover:text-white"
              }`}
            >
              {state.isStreamPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {state.isStreamPaused ? "RESUME STREAM" : "PAUSE STREAM"}
            </button>

            <button
              onClick={clearLiveBuffer}
              title="Clear visible rolling buffer without erasing investigation history"
              className="px-2.5 py-1 border border-cyber-border text-cyber-muted hover:text-white font-mono text-[9px] uppercase cursor-pointer"
            >
              CLEAR BUFFER
            </button>
          </div>
        </div>

        {/* Live Rolling Stream Table */}
        <div className="bg-cyber-bg border border-cyber-border/40 h-36 overflow-y-auto font-mono text-[10px]">
          {state.liveEventsBuffer.length > 0 ? (
            <div className="p-2 space-y-1">
              {state.liveEventsBuffer.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 py-1 px-1.5 border-b border-cyber-border/20 ${
                    log.status === "missing" ? "text-cyber-red-text bg-cyber-red/5" : "text-cyber-text"
                  }`}
                >
                  <span className="text-cyber-green font-bold shrink-0">{log.timestamp}</span>
                  <span className="text-cyber-cyan/80 font-bold shrink-0 w-16">[{log.type}]</span>
                  <span className="text-white font-bold shrink-0">{log.source}{log.destination ? ` → ${log.destination}` : ""}</span>
                  <span className="text-cyber-muted/70 shrink-0">({log.account || "system"})</span>
                  <span className="flex-1 truncate">{log.description}</span>
                  <span className={`font-bold shrink-0 text-[9px] uppercase ${
                    log.status === "verified" ? "text-cyber-green-text" : "text-cyber-red-text"
                  }`}>
                    {log.status === "missing" ? "NO TELEMETRY" : "VERIFIED"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-cyber-muted font-sans text-xs">
              No live buffer events. Synthetic telemetry engine generating next event...
            </div>
          )}
        </div>
      </div>

      {/* Drawers */}
      <HypothesisDrawer
        hypothesis={drawerHyp}
        onClose={() => setDrawerHyp(null)}
      />

      <ReasoningTraceDrawer />
    </div>
  );
};
