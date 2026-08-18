import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import { 
  Cpu, RotateCcw, MonitorPlay
} from "lucide-react";
import { SCENARIOS } from "../../data/scenarios";

export const SystemView: React.FC = () => {
  const { 
    state, 
    switchScenario, 
    resetDemo, 
    setPresentationMode 
  } = useSimulation();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyber-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
            SYSTEM DIAGNOSTICS & CONTROLS
          </h2>
          <p className="text-xs text-cyber-muted mt-0.5">
            Configure mock environment parameters and inspect local inference engine statuses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE SCENARIOS SELECTOR */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-cyber-surface border border-cyber-border/50 p-6 rounded-sm relative">
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyber-cyan" />
            <span className="font-mono text-[10px] text-cyber-muted uppercase tracking-widest block mb-4">
              DEMONSTRATION SCENARIOS SELECTOR
            </span>

            <div className="space-y-4">
              {(["alpha", "bravo", "charlie"] as const).map((scenId) => {
                const s = SCENARIOS[scenId];
                const isActive = state.activeScenario === scenId;
                return (
                  <div 
                    key={scenId}
                    onClick={() => switchScenario(scenId)}
                    className={`p-4 border rounded-sm transition-all cursor-pointer flex justify-between items-start gap-4 ${isActive ? 'bg-cyber-cyan/5 border-cyber-cyan shadow-md shadow-cyber-cyan/5' : 'bg-cyber-bg border-cyber-border hover:border-cyber-border/80 hover:bg-cyber-hover/20'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm border ${isActive ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan' : 'bg-cyber-panel border-cyber-border text-cyber-muted'}`}>
                          SCENARIO {scenId.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-white text-xs uppercase tracking-wide font-mono">
                          {s.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-cyber-muted mt-2 leading-relaxed font-sans max-w-xl">
                        {s.description}
                      </p>
                      <div className="mt-3 font-mono text-[9px] text-cyber-muted">
                        Target Subnet: <strong className="text-cyber-text uppercase">{s.networkSegment}</strong>
                      </div>
                    </div>

                    {isActive && (
                      <span className="text-[10px] font-mono text-cyber-cyan-text font-black uppercase">
                        [ SELECTED ]
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ENGINE PARAMETERS */}
          <div className="bg-cyber-surface border border-cyber-border/50 p-6 rounded-sm">
            <span className="font-mono text-[10px] text-cyber-muted uppercase tracking-widest block mb-4">
              SIMULATION ENGINE STATE OVERVIEW
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="bg-cyber-bg p-3.5 border border-cyber-border/50 rounded-sm">
                <span className="block text-[10px] text-cyber-muted font-mono uppercase">TELEMETRY DEGRADATION INDEX</span>
                <strong className="text-white text-base font-bold mt-1 block">
                  {state.telemetryIntegrity === 100 ? "0% LOSS (COMPLETE)" : state.telemetryIntegrity === 70 ? "30% LOSS (PARTIAL)" : "60% LOSS (SEVERE)"}
                </strong>
                <span className="text-[10px] text-cyber-muted mt-1 block">
                  Derived from active network segment telemetry throughput logs.
                </span>
              </div>

              <div className="bg-cyber-bg p-3.5 border border-cyber-border/50 rounded-sm">
                <span className="block text-[10px] text-cyber-muted font-mono uppercase">LEADING PROBABLE CAUSE</span>
                <strong className="text-white text-base font-bold mt-1 block uppercase">
                  {state.activeHypotheses.find(h => h.status === 'leading')?.name || 'UNKNOWN'}
                </strong>
                <span className="text-[10px] text-cyber-muted mt-1 block">
                  Scored based on currently matching direct evidence logs.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DIAGNOSTICS & SYSTEM RESETS (1 col) */}
        <div className="space-y-4">
          <div className="bg-cyber-surface border border-cyber-border/50 p-5 rounded-sm space-y-4">
            <h4 className="text-white text-xs font-bold font-mono tracking-wider uppercase border-b border-cyber-border/40 pb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              SYSTEM DIAGNOSTICS
            </h4>

            <div className="space-y-3 font-mono text-[11px] text-cyber-muted">
              
              <div className="flex justify-between items-center py-1">
                <span>LOCAL ENGINE STATUS</span>
                <span className="text-cyber-green font-bold">ACTIVE_OK</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span>INFERENCE ALGORITHM</span>
                <span className="text-white">BAYESIAN_EVIDENCE</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span>IN-MEMORY LOG BUFFER</span>
                <span className="text-white">{state.evidenceEvents.length} Packets</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span>NETWORK CONTROLLER</span>
                <span className="text-cyber-red font-bold">DISCONNECTED</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span>LOCAL SECURITY SIGNATURE</span>
                <span className="text-cyber-cyan">EBHE-992-01</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span>AIR-GAPPED COMPLIANCE</span>
                <span className="text-cyber-green font-bold">VERIFIED_SECURE</span>
              </div>

            </div>

            <div className="border-t border-cyber-border/40 pt-4 space-y-2">
              <span className="block text-[10px] text-cyber-muted uppercase font-mono mb-2">QUICK SYSTEM CONTROLS</span>
              
              <button
                onClick={resetDemo}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyber-bg border border-cyber-border hover:border-cyber-muted text-white font-mono text-[11px] font-bold uppercase rounded-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                RESET ENTIRE PROTOCOLS
              </button>

              <button
                onClick={() => setPresentationMode(!state.presentationMode)}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 border font-mono text-[11px] font-bold uppercase rounded-sm transition-all cursor-pointer ${state.presentationMode ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan' : 'bg-cyber-bg border-cyber-border hover:border-cyber-muted text-white'}`}
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                TOGGLE PRESENTATION VIEW
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
