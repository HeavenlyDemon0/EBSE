import React, { useState, useEffect, useRef } from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  CheckCircle2, XCircle, AlertCircle, ChevronRight,
  HelpCircle, ChevronDown, Loader2, ExternalLink
} from "lucide-react";
import { DemoController } from "../demo/DemoController";
import { HypothesisDrawer } from "../ui/HypothesisDrawer";
import { Tooltip } from "../ui/Tooltip";
import type { Hypothesis } from "../../types";

// ─── Mini attack path for hypothesis card ────────────────────────────────────
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

// ─── Evidence Debt "Why?" expandable ─────────────────────────────────────────
const DebtBreakdown: React.FC<{ debt: number; show: boolean }> = ({ debt, show }) => {
  if (!show) return null;
  const missing = Math.round(debt * 0.42);
  const delayed = Math.round(debt * 0.22);
  const unverified = Math.round(debt * 0.24);
  const contradictions = debt - missing - delayed - unverified;
  return (
    <div className="mt-3 border-t border-cyber-border/40 pt-3 space-y-1.5 animate-drop-in">
      <div className="font-mono text-[9px] text-cyber-muted uppercase tracking-wider mb-2">WHY {debt}?</div>
      {[
        { label: "Missing events", value: missing, color: "text-cyber-red-text" },
        { label: "Delayed telemetry", value: delayed, color: "text-cyber-amber-text" },
        { label: "Unverified relationships", value: unverified, color: "text-cyber-amber-text" },
        { label: "Contradictions", value: contradictions, color: "text-cyber-red-text" },
      ].map(item => (
        <div key={item.label} className="flex items-center justify-between font-mono text-[10px]">
          <span className="text-cyber-muted">{item.label}</span>
          <span className={`font-bold ${item.color}`}>+{item.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const {
    state,
    setActiveView,
    setTelemetryIntegrity,
    investigateLog,
    isSimulatingInvestigation,
  } = useSimulation();

  const [drawerHyp, setDrawerHyp] = useState<Hypothesis | null>(null);
  const [showDebtBreakdown, setShowDebtBreakdown] = useState(false);
  const [liveCollapsed, setLiveCollapsed] = useState(true);
  const [tickerLogs, setTickerLogs] = useState<Array<{ id: number; time: string; type: string; text: string; isAlert: boolean }>>([]);
  const tickerIdRef = useRef(0);

  const prevDebt = useRef(state.evidenceDebt);
  const [debtFlash, setDebtFlash] = useState(false);

  // Flash debt when it changes
  useEffect(() => {
    if (prevDebt.current !== state.evidenceDebt) {
      setDebtFlash(true);
      setTimeout(() => setDebtFlash(false), 700);
      prevDebt.current = state.evidenceDebt;
      // Auto-collapse breakdown on change
      setShowDebtBreakdown(false);
    }
  }, [state.evidenceDebt]);

  // Live ticker
  useEffect(() => {
    const seed = [
      { type: "AUTH", text: "WS-041 → VPN auth session verified", isAlert: false },
      { type: "NET",  text: "WS-041 → LOG-SRV-12 SMB packet observed", isAlert: false },
      { type: "PROC", text: "PowerShell execution detected on LOG-SRV-12", isAlert: true },
      { type: "SYS",  text: "Telemetry link degradation on subnet MIL-LOG-07", isAlert: true },
      { type: "ENGINE", text: "Hypothesis confidence recalculated", isAlert: false },
    ];
    setTickerLogs(seed.map((s, i) => ({ id: i, time: new Date().toISOString().slice(11, 19), ...s })));
    tickerIdRef.current = seed.length;

    const extras = [
      { type: "NET",    text: "GATEWAY-01 session packet received", isAlert: false },
      { type: "AUTH",   text: "svc_logistics token validated", isAlert: false },
      { type: "SYS",    text: "Telemetry buffer queue: normal", isAlert: false },
      { type: "ENGINE", text: "Evidence debt recalculated", isAlert: false },
    ];
    const interval = setInterval(() => {
      const pick = extras[Math.floor(Math.random() * extras.length)];
      setTickerLogs(prev => [{ id: tickerIdRef.current++, time: new Date().toISOString().slice(11,19), ...pick }, ...prev.slice(0, 6)]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // ── Derived values ──
  const debt = state.evidenceDebt;
  const completeness = state.evidenceCompleteness;
  const isResolved = state.investigatedLogs.length > 0;
  const atLoss = state.telemetryIntegrity === 40;

  const barColor = state.telemetryIntegrity >= 90 ? "bg-cyber-green" : state.telemetryIntegrity >= 60 ? "bg-cyber-amber" : "bg-cyber-red";
  const telLabel = state.telemetryIntegrity >= 90 ? "COMPLETE" : state.telemetryIntegrity >= 60 ? "PARTIAL" : "SEVERELY INCOMPLETE";
  const telTextColor = state.telemetryIntegrity >= 90 ? "text-cyber-green-text" : state.telemetryIntegrity >= 60 ? "text-cyber-amber-text" : "text-cyber-red-text";

  const debtSeverity = debt <= 15 ? "LOW" : debt <= 40 ? "MODERATE" : "CRITICAL";
  const debtColor = debt <= 15 ? "text-cyber-green-text" : debt <= 40 ? "text-cyber-amber-text" : "text-cyber-red-text";
  const debtBg = debt <= 15 ? "border-cyber-green/40 bg-cyber-green/5" : debt <= 40 ? "border-cyber-amber/40 bg-cyber-amber/5" : "border-cyber-red/50 bg-cyber-red/5";

  const leadingHyp = state.activeHypotheses.find(h => h.status === "leading") ?? state.activeHypotheses[0];
  const otherHyps = state.activeHypotheses.filter(h => h.id !== leadingHyp?.id);
  const topRec = state.recommendedEvidence[0];
  const otherRecs = state.recommendedEvidence.slice(1);

  const scenarioName = state.activeScenario === "alpha"
    ? "Suspected Lateral Movement & Credential Compromise"
    : state.activeScenario === "bravo"
    ? "Active Subnet Propagation — Service Exploitation"
    : "Out-of-Hours Database Exfiltration";
  const segment = state.activeScenario === "alpha" ? "MIL-LOG-NET-07" : state.activeScenario === "bravo" ? "MIL-OPS-NET-09" : "MIL-SEC-DATA-01";

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── Demo Controller ── */}
      <DemoController />

      {/* ═══ SECTION A: INCIDENT HEADER ═══ */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 pb-5 border-b border-cyber-border/30">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-cyber-red/40 bg-cyber-red/10 font-mono text-[10px] font-black uppercase tracking-widest text-cyber-red-text">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-red animate-pulse" />
              ACTIVE INVESTIGATION
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
            {" · "}Network: <strong className="text-white">{segment}</strong>
            {" · "}Logistics Infrastructure
          </p>
        </div>
        <div className="flex gap-6 font-mono text-[11px] shrink-0">
          <div className="text-right">
            <span className="block text-[9px] text-cyber-muted uppercase tracking-wider">First Observed</span>
            <span className="text-white font-bold mt-0.5 block">14:32:07 UTC</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-cyber-muted uppercase tracking-wider">Last Evidence</span>
            <span className="text-white font-bold mt-0.5 block">14:41:15 UTC</span>
          </div>
        </div>
      </div>

      {/* ═══ SECTION B: TELEMETRY INTEGRITY — HERO CONTROL ═══ */}
      <div className="bg-cyber-surface border border-cyber-border/40 p-5 relative">
        {/* Corner marks */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-cyber-green/40" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyber-green/40" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyber-green/40" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-cyber-green/40" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest block mb-1">Evidence Source</span>
            <h3 className="text-white text-base font-black uppercase tracking-wide">TELEMETRY INTEGRITY</h3>
            <p className="text-[11px] text-cyber-muted font-sans mt-1 max-w-md">
              Live sensor stream quality for network segment {segment}. Loss simulates sensor failure or link disruption.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`font-mono text-3xl font-black ${telTextColor}`}>{state.telemetryIntegrity}%</span>
            <span className={`font-mono text-[10px] font-bold uppercase px-2 py-1 border ${telTextColor} ${state.telemetryIntegrity >= 90 ? "border-cyber-green/40 bg-cyber-green/5" : state.telemetryIntegrity >= 60 ? "border-cyber-amber/40 bg-cyber-amber/5" : "border-cyber-red/40 bg-cyber-red/5"}`}>
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
            <span className="text-white mix-blend-difference">ACTIVE SENSOR STREAM — {state.telemetryIntegrity}% INTEGRITY</span>
          </div>
        </div>
        <div className="text-[9px] font-mono text-cyber-muted mb-4">
          Completeness: <strong className={telTextColor}>{completeness}%</strong>
          {"   ·   "}
          Critical Gaps: <strong className={state.criticalGaps > 0 ? "text-cyber-red-text" : "text-cyber-green-text"}>{state.criticalGaps}</strong>
          {"   ·   "}
          Evidence Events: <strong className="text-white">{state.evidenceEvents.length}</strong>
        </div>

        {/* ACTION BUTTONS */}
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
          {state.telemetryIntegrity !== 100 && (
            <span className="font-mono text-[9px] text-cyber-muted italic">
              Telemetry at {state.telemetryIntegrity}% — investigate recommended evidence to resolve uncertainty
            </span>
          )}
          {isResolved && (
            <span className="font-mono text-[10px] text-cyber-green-text font-bold">
              ✓ Evidence retrieved — assessment updated
            </span>
          )}
        </div>
      </div>

      {/* ═══ SECTION C: PRIMARY ASSESSMENT ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* C1: Leading Hypothesis — largest card */}
        <div className="lg:col-span-2 bg-cyber-surface border-2 border-cyber-cyan/30 p-5 relative">
          <div className="absolute top-0 left-0 h-0.5 w-16 bg-cyber-cyan" />
          <span className="font-mono text-[9px] text-cyber-cyan uppercase tracking-widest block mb-3">
            LEADING HYPOTHESIS
          </span>

          {leadingHyp ? (
            <>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-xl font-black uppercase tracking-tight leading-tight mb-1.5">
                    {leadingHyp.name}
                  </h2>
                  <p className="text-[11px] text-cyber-muted font-sans leading-relaxed line-clamp-2">
                    {leadingHyp.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-[9px] text-cyber-muted font-mono uppercase mb-1">Confidence</span>
                  <span className="text-5xl font-black text-white leading-none block">{leadingHyp.confidence}%</span>
                  <span className="font-mono text-[9px] text-cyber-cyan font-bold block mt-1 uppercase">{leadingHyp.status}</span>
                </div>
              </div>

              {/* Mini attack path */}
              <MiniAttackPath steps={leadingHyp.steps} />

              <div className="mt-4 pt-3 border-t border-cyber-border/30 flex items-center justify-between">
                <div className="font-mono text-[10px] text-cyber-muted">
                  Evidence: <strong className="text-white">{leadingHyp.supportingEvidence.length}</strong>
                  {"  ·  "}
                  Missing: <strong className="text-cyber-amber-text">{leadingHyp.missingEvidence.length}</strong>
                  {"  ·  "}
                  Debt: <strong className={debtColor}>{leadingHyp.evidenceDebt}</strong>
                </div>
                <button
                  onClick={() => setDrawerHyp(leadingHyp)}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-cyber-cyan hover:text-white transition-colors cursor-pointer font-bold"
                >
                  VIEW DETAIL <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Other hypotheses */}
              {otherHyps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-cyber-border/30">
                  <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-wider block mb-2.5">
                    OTHER SURVIVING HYPOTHESES
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
                          VIEW DETAIL →
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

        {/* C2: Evidence Debt */}
        <div className={`bg-cyber-surface border-2 p-5 relative flex flex-col justify-between ${debtBg}`}>
          <div className="absolute top-0 right-0 h-0.5 w-16 bg-cyber-amber" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-cyber-muted">
                <Tooltip content="Unresolved uncertainty caused by missing, delayed, contradictory, or insufficient evidence. Higher = less reliable assessment." position="top">
                  EVIDENCE DEBT
                </Tooltip>
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-cyber-muted/50 cursor-help" />
            </div>

            <div className="mb-4">
              <div className={`text-7xl font-black leading-none transition-all duration-500 ${debtFlash ? "value-changed" : ""} ${debtColor}`}>
                {debt}
              </div>
              <div className="font-mono text-[10px] text-cyber-muted mt-1">/ 100</div>
            </div>

            <div className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-black uppercase px-2.5 py-1 border ${debtColor} ${debt <= 15 ? "border-cyber-green/40 bg-cyber-green/10" : debt <= 40 ? "border-cyber-amber/40 bg-cyber-amber/10" : "border-cyber-red/40 bg-cyber-red/10"}`}>
              {debtSeverity}
            </div>

            <DebtBreakdown debt={debt} show={showDebtBreakdown} />
          </div>

          <div className="mt-4 pt-4 border-t border-cyber-border/30 space-y-2">
            <p className="text-[10px] text-cyber-muted font-sans leading-relaxed">
              {debt <= 15
                ? "Assessment is well-supported. No critical gaps."
                : debt <= 40
                ? "Moderate unresolved conditions. Key evidence gaps exist."
                : "Critical uncertainty. Assessment may be unreliable."}
            </p>
            <button
              onClick={() => setShowDebtBreakdown(v => !v)}
              className="flex items-center gap-1.5 font-mono text-[10px] text-cyber-muted hover:text-white transition-colors cursor-pointer"
            >
              {showDebtBreakdown ? "HIDE BREAKDOWN" : "VIEW BREAKDOWN"}
              {showDebtBreakdown ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ SECTION D: KNOWN / UNRESOLVED ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 border-l-2 border-cyber-green bg-cyber-surface">
          <h4 className="font-mono text-[10px] text-cyber-green font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            KNOWN — OBSERVED FACTS
          </h4>
          <ul className="space-y-2.5">
            {state.whatWeKnow.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[11px] font-sans">
                <span className="text-cyber-green font-mono font-bold shrink-0 mt-0.5">✓</span>
                <span className="text-cyber-text leading-relaxed">{item.replace(/^✓\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 border-l-2 border-cyber-amber bg-cyber-surface">
          <h4 className="font-mono text-[10px] text-cyber-amber font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5" />
            UNRESOLVED
            <Tooltip content="Events or relationships EBHE cannot confirm due to missing or insufficient telemetry. Not inferred." position="top">
              <HelpCircle className="w-3 h-3 text-cyber-muted/60 ml-0.5" />
            </Tooltip>
          </h4>
          <ul className="space-y-2.5">
            {state.whatWeDontKnow.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[11px] font-sans">
                <span className="text-cyber-amber font-mono font-bold shrink-0 mt-0.5">?</span>
                <span className="text-cyber-text leading-relaxed">{item.replace(/^\?\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ═══ SECTION E: NEXT BEST EVIDENCE — ACTION CENTER ═══ */}
      {topRec && (
        <div className="bg-cyber-surface border border-cyber-cyan/25 p-5 relative">
          <div className="absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-cyber-cyan/50 to-transparent" />

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1 min-w-0">
              <span className="font-mono text-[9px] text-cyber-cyan uppercase tracking-widest font-black block mb-1.5">
                NEXT BEST EVIDENCE
              </span>
              <h3 className="text-white text-lg font-black uppercase mb-1.5 leading-tight">
                {topRec.title}
              </h3>
              <p className="text-[11px] text-cyber-muted font-sans leading-relaxed mb-3 max-w-xl">
                {topRec.reason}
              </p>

              <div className="flex flex-wrap items-center gap-4 font-mono text-[10px]">
                <span className={`font-black uppercase ${topRec.impact === "HIGH" ? "text-cyber-red-text" : "text-cyber-amber-text"}`}>
                  {topRec.impact} IMPACT
                </span>
                <span className="text-cyber-muted">
                  Information Gain:{" "}
                  <Tooltip content="How strongly this evidence could distinguish between the surviving hypotheses. Higher = more resolving." position="top">
                    <strong className="text-white border-b border-dashed border-cyber-muted/40">{topRec.informationGain}</strong>
                  </Tooltip>
                </span>
                <span className="text-cyber-muted">
                  Target: <strong className="text-white">{topRec.targetLogSource}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 self-start md:self-center">
              <button
                onClick={() => investigateLog(topRec.id)}
                disabled={isSimulatingInvestigation || !atLoss || isResolved}
                className="px-6 py-3 bg-cyber-cyan text-cyber-bg font-mono text-[12px] font-black uppercase tracking-wider hover:bg-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed min-w-[200px] text-center"
              >
                {isSimulatingInvestigation ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> RETRIEVING…
                  </span>
                ) : isResolved ? (
                  "✓ EVIDENCE RETRIEVED"
                ) : !atLoss ? (
                  "SIMULATE LOSS FIRST"
                ) : (
                  "INVESTIGATE EVIDENCE"
                )}
              </button>
              <button
                onClick={() => setActiveView("evidence")}
                className="flex items-center justify-center gap-1.5 font-mono text-[9px] text-cyber-muted hover:text-white transition-colors cursor-pointer py-1"
              >
                <ExternalLink className="w-3 h-3" /> VIEW EVIDENCE TIMELINE
              </button>
            </div>
          </div>

          {/* Secondary recommendations */}
          {otherRecs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-cyber-border/30 flex flex-wrap gap-x-6 gap-y-2">
              <span className="font-mono text-[9px] text-cyber-muted uppercase w-full">Also worth checking:</span>
              {otherRecs.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => setActiveView("evidence")}
                  className="font-mono text-[10px] text-cyber-muted hover:text-cyber-cyan transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3 h-3" />
                  {rec.title}
                  <span className={rec.impact === "HIGH" ? "text-cyber-red-text" : "text-cyber-amber-text"}>({rec.impact})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ SECTION F: LIVE FEED — TERTIARY, COLLAPSIBLE ═══ */}
      <div className="bg-cyber-surface border border-cyber-border/30">
        <button
          onClick={() => setLiveCollapsed(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-cyber-hover/40 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
            <span className="font-mono text-[10px] text-cyber-muted uppercase tracking-wider font-bold">LIVE EVIDENCE STREAM</span>
          </div>
          <div className="flex items-center gap-2 text-cyber-muted">
            <span className="font-mono text-[9px]">{liveCollapsed ? "SHOW" : "HIDE"}</span>
            {liveCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 rotate-180" />}
          </div>
        </button>

        {!liveCollapsed && (
          <div className="border-t border-cyber-border/30 px-4 pb-3 animate-drop-in">
            <div className="space-y-1 py-2">
              {tickerLogs.slice(0, 4).map(log => (
                <div key={log.id} className={`flex items-start gap-2 font-mono text-[10px] py-0.5 ${log.isAlert ? "text-cyber-amber-text" : "text-cyber-muted"}`}>
                  <span className="text-cyber-border shrink-0">&gt;</span>
                  <span className="text-cyber-muted/60 shrink-0">{log.time}</span>
                  <span className={`shrink-0 ${log.type === "AUTH" ? "text-cyber-cyan/70" : log.type === "PROC" ? "text-cyber-amber/70" : "text-cyber-muted/60"}`}>[{log.type}]</span>
                  <span className="flex-1">{log.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveView("evidence")}
              className="font-mono text-[9px] text-cyber-cyan hover:underline cursor-pointer mt-1"
            >
              VIEW ALL EVIDENCE →
            </button>
          </div>
        )}
      </div>

      {/* Hypothesis Drawer */}
      <HypothesisDrawer
        hypothesis={drawerHyp}
        onClose={() => setDrawerHyp(null)}
      />
    </div>
  );
};
