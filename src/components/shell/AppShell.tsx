import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  Terminal, Eye, Database, BarChart2,
  Shield, Cpu, RefreshCw, MonitorPlay, Server, Play, Radio
} from "lucide-react";
import { SCENARIOS } from "../../data/scenarios";

interface AppShellProps { children: React.ReactNode; }

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    state, activeView,
    setActiveView, resetDemo, switchScenario,
    setDemoActive, setPresentationMode
  } = useSimulation();

  const currentScenario = SCENARIOS[state.activeScenario];

  const navItems = [
    { id: "command-center" as const, label: "COMMAND CENTER", icon: Terminal },
    { id: "investigation" as const, label: "INVESTIGATION",   icon: Eye },
    { id: "evidence"       as const, label: "EVIDENCE",       icon: Database },
    { id: "hypotheses"     as const, label: "HYPOTHESIS MATRIX", icon: BarChart2 },
  ];

  // Breadcrumb path
  const breadcrumb = activeView === "command-center" ? ["COMMAND CENTER"]
    : activeView === "investigation" ? ["COMMAND CENTER", "INVESTIGATION"]
    : activeView === "evidence"      ? ["COMMAND CENTER", "EVIDENCE"]
    : activeView === "hypotheses"    ? ["COMMAND CENTER", "HYPOTHESIS MATRIX"]
    : ["COMMAND CENTER", "SYSTEM"];

  return (
    <div className="h-screen flex flex-col bg-cyber-bg text-cyber-text overflow-hidden">

      {/* ─── TOP STATUS BAR ─── */}
      <header className="h-11 shrink-0 border-b border-cyber-border/40 bg-cyber-surface flex items-center justify-between px-5 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-cyber-border/40 pr-4">
            <Radio className="w-3 h-3 text-cyber-red animate-pulse" />
            <span className="font-mono text-[10px] font-black tracking-widest text-cyber-red uppercase">
              EBHE-0427
            </span>
          </div>
          <span className="font-mono text-[10px] text-cyber-muted hidden md:flex items-center gap-1.5">
            <span className="text-cyber-muted/60">SEGMENT</span>
            <strong className="text-white">{currentScenario.networkSegment}</strong>
          </span>
          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[9px] text-cyber-muted border-l border-cyber-border/40 pl-4">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={crumb}>
                {i > 0 && <span className="text-cyber-border">/</span>}
                <span className={i === breadcrumb.length - 1 ? "text-white font-bold" : "text-cyber-muted/60"}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-3 font-mono text-[9px] text-cyber-muted border-r border-cyber-border/40 pr-3 mr-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse-soft" />
              ENGINE ACTIVE
            </span>
            <span>AIR-GAPPED</span>
          </div>
          <button
            onClick={() => setPresentationMode(!state.presentationMode)}
            title="Toggle Presentation Mode"
            className={`p-1.5 border transition-all cursor-pointer ${state.presentationMode ? "border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10" : "border-cyber-border text-cyber-muted hover:text-white hover:border-cyber-muted"}`}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetDemo}
            title="Reset Demo"
            className="p-1.5 border border-cyber-border text-cyber-muted hover:text-white hover:border-cyber-muted transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ─── BODY ─── */}
      <div className="flex-1 flex overflow-hidden">

        {/* SIDEBAR */}
        {!state.presentationMode && (
          <aside className="w-52 shrink-0 border-r border-cyber-border/40 bg-cyber-surface flex flex-col z-20">

            {/* Brand */}
            <div className="px-4 py-4 border-b border-cyber-border/30 flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-cyber-green shrink-0" />
              <div>
                <span className="font-black text-white tracking-widest text-sm uppercase block leading-none">EBHE</span>
                <span className="font-mono text-[8px] text-cyber-muted/60 uppercase tracking-wide">Evidence-Bounded</span>
              </div>
            </div>

            {/* Main Nav */}
            <nav className="p-2 flex-1">
              <span className="font-mono text-[8px] text-cyber-muted/50 uppercase tracking-widest block px-2 pt-2 pb-1.5 font-bold">
                INVESTIGATION
              </span>
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveView(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 font-mono text-[10px] transition-all text-left cursor-pointer rounded-[1px] mb-0.5 ${activeView === id
                    ? "bg-cyber-green/10 text-cyber-green-text border-l-2 border-cyber-green font-bold"
                    : "text-cyber-muted hover:text-white hover:bg-cyber-hover"}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </button>
              ))}

              <div className="my-3 border-t border-cyber-border/30" />
              <span className="font-mono text-[8px] text-cyber-muted/50 uppercase tracking-widest block px-2 pb-1.5 font-bold">
                SYSTEM
              </span>

              <button
                onClick={() => setActiveView("system")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 font-mono text-[10px] transition-all text-left cursor-pointer mb-3 ${activeView === "system"
                  ? "bg-cyber-green/10 text-cyber-green-text border-l-2 border-cyber-green font-bold"
                  : "text-cyber-muted hover:text-white hover:bg-cyber-hover"}`}
              >
                <Cpu className="w-3.5 h-3.5 shrink-0" />
                SYSTEM STATUS
              </button>

              {/* Scenario Switcher */}
              <span className="font-mono text-[8px] text-cyber-muted/50 uppercase tracking-widest block px-2 pb-1.5 font-bold">
                SCENARIOS
              </span>
              {(["alpha", "bravo", "charlie"] as const).map(id => (
                <button
                  key={id}
                  onClick={() => switchScenario(id)}
                  className={`w-full text-left px-3 py-1.5 font-mono text-[10px] transition-all cursor-pointer mb-0.5 ${state.activeScenario === id
                    ? "bg-cyber-cyan/10 text-cyber-cyan border-l-2 border-cyber-cyan font-bold"
                    : "text-cyber-muted hover:text-white hover:bg-cyber-hover"}`}
                >
                  SCENARIO {id.toUpperCase()}
                  {state.activeScenario === id && <span className="ml-1 text-[8px]">●</span>}
                </button>
              ))}

              {/* Demo toggle */}
              <div className="mt-3 pt-3 border-t border-cyber-border/30">
                <button
                  onClick={() => setDemoActive(!state.isDemoActive)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 border font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${state.isDemoActive
                    ? "bg-cyber-amber/15 border-cyber-amber text-cyber-amber-text"
                    : "border-cyber-border/60 text-cyber-muted hover:border-cyber-muted hover:text-white"}`}
                >
                  <Play className="w-3 h-3" />
                  {state.isDemoActive ? "EXIT DEMO" : "GUIDED DEMO"}
                </button>
              </div>
            </nav>

            {/* Footer status */}
            <div className="px-4 py-3 border-t border-cyber-border/30 space-y-1 font-mono text-[9px] text-cyber-muted">
              <div className="flex items-center gap-2">
                <Server className="w-3 h-3 text-cyber-green" />
                <span>AIR-GAPPED READY</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-cyber-green animate-pulse-soft" />
                <span>LOCAL ENGINE ACTIVE</span>
              </div>
            </div>
          </aside>
        )}

        {/* Presentation mode float nav */}
        {state.presentationMode && (
          <div className="fixed bottom-4 left-4 z-50 flex items-center gap-1 bg-cyber-surface/95 border border-cyber-cyan/30 px-2 py-1.5 shadow-2xl font-mono text-[10px]">
            <span className="text-cyber-cyan font-bold border-r border-cyber-border/40 pr-2 mr-1">PRESENT</span>
            {(["command-center", "investigation", "evidence", "hypotheses"] as const).map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-2 py-0.5 cursor-pointer transition-all ${activeView === v ? "bg-cyber-cyan/15 text-cyber-cyan font-bold" : "text-cyber-muted hover:text-white"}`}
              >
                {v === "command-center" ? "CMD" : v === "investigation" ? "INV" : v === "evidence" ? "LOG" : "HYP"}
              </button>
            ))}
            <button
              onClick={() => setPresentationMode(false)}
              className="ml-2 px-2 py-0.5 border border-cyber-border text-cyber-muted hover:text-white text-[9px] cursor-pointer"
            >EXIT</button>
          </div>
        )}

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto grid-hud">
          <div className="p-5 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
