import React from "react";
import { Shield, Activity } from "lucide-react";

interface EntryScreenProps {
  onEnter: () => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-cyber-bg grid-hud flex flex-col justify-between p-8 text-cyber-text font-sans selection:bg-cyber-green/30 selection:text-white relative overflow-hidden">
      {/* Visual background lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-surface/10 to-cyber-bg pointer-events-none" />
      
      {/* Top Banner */}
      <div className="flex justify-between items-center border-b border-cyber-border/40 pb-4 z-10">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-cyber-green" />
          <span className="font-mono text-xs tracking-widest text-cyber-muted uppercase">
            SECURE INTEL CHANNEL // CLASSIFIED DERIVATION
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] text-cyber-muted">
          <span>HOST: AIR-GAPPED-DEV-01</span>
          <span className="text-cyber-green animate-pulse-soft">● ONLINE</span>
        </div>
      </div>

      {/* Main Cinematic Content */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto text-center py-12 z-10">
        {/* Logo/Shield Emblem */}
        <div className="w-20 h-20 border border-cyber-green/30 bg-cyber-surface flex items-center justify-center mb-8 relative rounded-sm shadow-2xl">
          <Shield className="w-10 h-10 text-cyber-green glow-green" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-green" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyber-green" />
        </div>

        {/* Brand */}
        <h1 className="text-6xl font-extrabold tracking-wider font-sans text-white mb-2 uppercase">
          EBHE
        </h1>
        <p className="text-sm font-mono tracking-[0.3em] text-cyber-green uppercase mb-6">
          Evidence-Bounded Hypothesis Engine
        </p>

        {/* Mission Statement */}
        <h2 className="text-xl md:text-2xl font-light tracking-wide text-cyber-text/90 max-w-2xl mb-8 leading-relaxed">
          AI Cyber Defence for Military Networks Under Severe Telemetry Degradation
        </h2>

        {/* Pillars of EBHE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mb-12 text-left">
          <div className="border border-cyber-border bg-cyber-surface/80 p-5 rounded-sm relative">
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyber-green" />
            <span className="font-mono text-xs text-cyber-green block mb-2 font-semibold">01 / BOUNDED LOGIC</span>
            <p className="text-xs text-cyber-muted leading-relaxed">
              Maintains multiple possible attack narratives. Never invents missing events to fill telemetry gaps.
            </p>
          </div>

          <div className="border border-cyber-border bg-cyber-surface/80 p-5 rounded-sm relative">
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyber-amber" />
            <span className="font-mono text-xs text-cyber-amber block mb-2 font-semibold">02 / DEBT TRACKING</span>
            <p className="text-xs text-cyber-muted leading-relaxed">
              Quantifies intelligence uncertainty dynamically as Evidence Debt, shifting seamlessly as telemetry fluctuates.
            </p>
          </div>

          <div className="border border-cyber-border bg-cyber-surface/80 p-5 rounded-sm relative">
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyber-cyan" />
            <span className="font-mono text-xs text-cyber-cyan block mb-2 font-semibold">03 / COGNITIVE DESIGN</span>
            <p className="text-xs text-cyber-muted leading-relaxed">
              Distinguishes facts from inferences, guiding operators to the specific telemetry checks that resolve ambiguity.
            </p>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={onEnter}
          className="group relative px-10 py-4 bg-cyber-green/10 border border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-cyber-bg transition-all duration-300 font-mono text-sm tracking-widest font-semibold uppercase rounded-sm cursor-pointer shadow-md hover:shadow-cyber-green/20"
        >
          [ ENTER COMMAND CENTER ]
          <span className="absolute -top-1 -left-1 w-2 h-2 bg-cyber-green group-hover:bg-cyber-bg transition-colors" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-cyber-green group-hover:bg-cyber-bg transition-colors" />
        </button>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-cyber-border/40 pt-4 font-mono text-[10px] text-cyber-muted z-10">
        <div>
          <span>LOCAL WORKSTATION SIMULATION v0.1</span>
        </div>
        <div className="flex items-center gap-6">
          <span>STATUS: NO EXTERNAL CONNS</span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyber-green animate-pulse" />
            AIR-GAPPED COMPLIANT
          </span>
        </div>
      </div>
    </div>
  );
};
