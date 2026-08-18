import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  Terminal, Shield, Eye, Database,
  BarChart2, RefreshCw, Play, Cpu, MonitorPlay, Radio, Server
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
    { id: "investigation" as const, label: "INVESTIGATION", icon: Eye },
    { id: "evidence" as const, label: "EVIDENCE TIMELINE", icon: Database },
    { id: "hypotheses" as const, label: "HYPOTHESIS MATRIX", icon: BarChart2 },
  ];

  return (
    <div className="h-screen flex flex-col bg-cyber-bg text-cyber-text overflow-hidden">

      {/* ─── TOP BAR ─── */}
      <header className="h-12 shrink-0 border-b border-cyber-border/40 bg-cyber-surface flex items-center justify-between px-5 z-30">
        {/* Left: Incident tracking */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 border-r border-cyber-border/40 pr-5">
            <Radio className="w-3.5 h-3.5 text-cyber-red animate-pulse" />
            <span className="font-mono text-[10px] font-black tracking-widest text-cyber-red uppercase">
              INCIDENT EBHE-0427
            </span>
          </div>
          <span className="font-mono text-[10px] text-cyber-muted hidden md:block">
            SEGMENT: <strong className="text-white">{currentScenario.networkSegment}</strong>
          </span>
          <span className="font-mono text-[10px] text-cyber-green font-bold animate-pulse-soft hidden lg:block">
            ● ACTIVE INVESTIGATION
          </span>
        </div>

        {/* Right: System indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-4 font-mono text-[9px] text-cyber-muted border-r border-cyber-border/40 pr-4">
            <span>NETWORK: <strong className="text-white">AIR-GAPPED</strong></span>
            <span>DATA: <strong className="text-white">SIMULATED</strong></span>
            <span>ENGINE: <strong className="text-white">EBHE v0.1</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPresentationMode(!state.presentationMode)}
              title="Toggle Presentation Mode"
              className={`p-1.5 border transition-all cursor-pointer ${state.presentationMode ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10' : 'border-cyber-border text-cyber-muted hover:text-white hover:border-cyber-muted'}`}
            >
              <MonitorPlay className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetDemo}
              title="Reset Demo State"
              className="p-1.5 border border-cyber-border text-cyber-muted hover:text-white hover:border-cyber-muted transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-cyber-green border border-cyber-green/30 bg-cyber-green/5 px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
              OPERATIONAL
            </div>
          </div>
        </div>
      </header>

      {/* ─── BODY: SIDEBAR + MAIN ─── */}
      <div className="flex-1 flex overflow-hidden">

        {/* SIDEBAR */}
        {!state.presentationMode && (
          <aside className="w-56 shrink-0 border-r border-cyber-border/40 bg-cyber-surface flex flex-col justify-between z-20 overflow-y-auto">

            {/* Brand */}
            <div>
              <div className="px-4 py-4 border-b border-cyber-border/30">
                <div className="flex items-center gap-2.5 mb-0.5">
                  <Shield className="w-4 h-4 text-cyber-green" />
                  <span className="font-black text-white tracking-widest text-sm uppercase">EBHE</span>
                </div>
                <span className="font-mono text-[8px] text-cyber-muted uppercase tracking-wider">
                  Evidence-Bounded Hypothesis Engine
                </span>
              </div>

              {/* Nav */}
              <nav className="p-3 space-y-0.5">
                <span className="font-mono text-[8px] text-cyber-muted/60 uppercase tracking-widest block px-2 py-2 font-bold">
                  COMMAND
                </span>
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveView(id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 font-mono text-[10px] transition-all text-left cursor-pointer ${activeView === id
                      ? 'bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green font-bold'
                      : 'text-cyber-muted hover:text-white hover:bg-cyber-hover'}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </button>
                ))}

                <span className="font-mono text-[8px] text-cyber-muted/60 uppercase tracking-widest block px-2 pt-4 pb-2 font-bold">
                  CONFIG
                </span>
                <button
                  onClick={() => setActiveView("system")}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 font-mono text-[10px] transition-all text-left cursor-pointer ${activeView === "system"
                    ? 'bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green font-bold'
                    : 'text-cyber-muted hover:text-white hover:bg-cyber-hover'}`}
                >
                  <Cpu className="w-3.5 h-3.5 shrink-0" />
                  SYSTEM STATUS
                </button>
              </nav>

              {/* Scenario Switcher */}
              <div className="px-3 pb-3">
                <span className="font-mono text-[8px] text-cyber-muted/60 uppercase tracking-widest block px-2 py-2 font-bold">
                  SCENARIOS
                </span>
                {(["alpha", "bravo", "charlie"] as const).map(id => (
                  <button
                    key={id}
                    onClick={() => switchScenario(id)}
                    className={`w-full text-left px-2.5 py-1.5 font-mono text-[10px] transition-all cursor-pointer mb-0.5 ${state.activeScenario === id
                      ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 font-bold'
                      : 'text-cyber-muted hover:text-white hover:bg-cyber-hover'}`}
                  >
                    SCENARIO {id.toUpperCase()}
                    {state.activeScenario === id && <span className="ml-1 text-[8px]">●</span>}
                  </button>
                ))}
              </div>

              {/* Demo mode button */}
              <div className="px-3 pb-3">
                <button
                  onClick={() => setDemoActive(!state.isDemoActive)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 border font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${state.isDemoActive
                    ? 'bg-cyber-amber/15 border-cyber-amber text-cyber-amber-text'
                    : 'border-cyber-border text-cyber-muted hover:border-cyber-muted hover:text-white bg-cyber-bg'}`}
                >
                  <Play className="w-3 h-3" />
                  {state.isDemoActive ? "EXIT DEMO" : "GUIDED DEMO"}
                </button>
              </div>
            </div>

            {/* Bottom status */}
            <div className="p-3 border-t border-cyber-border/30 space-y-1.5 font-mono text-[9px] text-cyber-muted">
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
            <span className="text-cyber-cyan font-bold border-r border-cyber-border/40 pr-2 mr-1">PRESENTATION</span>
            {["command-center", "investigation", "evidence"].map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v as any)}
                className={`px-2 py-0.5 cursor-pointer transition-all ${activeView === v ? 'bg-cyber-cyan/15 text-cyber-cyan font-bold' : 'text-cyber-muted hover:text-white'}`}
              >
                {v === "command-center" ? "CMD" : v === "investigation" ? "INVEST" : "LOGS"}
              </button>
            ))}
            <button
              onClick={() => setPresentationMode(false)}
              className="ml-2 px-2 py-0.5 border border-cyber-border text-cyber-muted hover:text-white text-[9px] cursor-pointer"
            >EXIT</button>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto grid-hud">
          <div className="p-5 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
