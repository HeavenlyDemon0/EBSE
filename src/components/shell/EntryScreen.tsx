import React from "react";
import { Shield, Activity } from "lucide-react";

interface EntryScreenProps { onEnter: () => void; }

export const EntryScreen: React.FC<EntryScreenProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-cyber-bg grid-hud flex flex-col justify-between p-8 text-cyber-text font-sans overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-surface/5 to-cyber-bg/80 pointer-events-none" />

      {/* Top Banner */}
      <div className="flex justify-between items-center border-b border-cyber-border/40 pb-4 z-10">
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-cyber-green" />
          <span className="font-mono text-[10px] tracking-widest text-cyber-muted uppercase">
            SECURE INTEL CHANNEL // CLASSIFIED DERIVATION
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] text-cyber-muted">
          <span>HOST: AIR-GAPPED-DEV-01</span>
          <span className="text-cyber-green animate-pulse-soft">● ONLINE</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-3xl mx-auto text-center py-12 z-10">

        {/* Shield emblem */}
        <div className="w-16 h-16 border border-cyber-green/30 bg-cyber-surface flex items-center justify-center mb-8 relative">
          <Shield className="w-8 h-8 text-cyber-green" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-green" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyber-green" />
        </div>

        {/* Brand */}
        <h1 className="text-6xl font-extrabold tracking-wider text-white mb-2 uppercase">EBHE</h1>
        <p className="font-mono tracking-[0.3em] text-cyber-green text-sm uppercase mb-2">
          Evidence-Bounded Hypothesis Engine
        </p>
        <p className="text-sm font-mono text-cyber-muted uppercase tracking-wider mb-8">
          Smart India Hackathon · PS14 · AI Cyber Defence
        </p>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-2xl mb-10 text-left">
          {[
            { accent: "border-cyber-green text-cyber-green-text", label: "01 / BOUNDED", text: "Maintains multiple attack narratives. Never invents missing events." },
            { accent: "border-cyber-amber text-cyber-amber-text", label: "02 / DEBT",    text: "Quantifies uncertainty as Evidence Debt. Adjusts as telemetry changes." },
            { accent: "border-cyber-cyan text-cyber-cyan",        label: "03 / GUIDED",  text: "Directs operators to the specific evidence that would resolve ambiguity." },
          ].map(p => (
            <div key={p.label} className={`border-l-2 ${p.accent.split(" ")[0]} bg-cyber-surface/60 p-4`}>
              <span className={`font-mono text-[10px] font-bold uppercase block mb-1.5 ${p.accent.split(" ")[1]}`}>{p.label}</span>
              <p className="text-[11px] text-cyber-muted leading-relaxed font-sans">{p.text}</p>
            </div>
          ))}
        </div>

        {/* Enter button */}
        <button
          onClick={onEnter}
          className="group relative px-10 py-4 bg-cyber-green/10 border border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-cyber-bg transition-all duration-300 font-mono text-sm tracking-widest font-black uppercase cursor-pointer mb-6"
        >
          ENTER COMMAND CENTER
          <span className="absolute -top-1 -left-1 w-2 h-2 bg-cyber-green group-hover:bg-cyber-bg transition-colors" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-cyber-green group-hover:bg-cyber-bg transition-colors" />
        </button>

        {/* First-use guidance */}
        <div className="border border-cyber-cyan/20 bg-cyber-cyan/5 px-6 py-4 max-w-sm text-left">
          <div className="font-mono text-[10px] text-cyber-cyan font-black uppercase tracking-wider mb-2">
            START HERE
          </div>
          <p className="text-[11px] text-cyber-muted font-sans leading-relaxed mb-2">
            EBHE currently has complete evidence. Once inside, try:
          </p>
          <p className="font-mono text-[10px] text-white font-bold uppercase">
            SIMULATE TELEMETRY LOSS
          </p>
          <p className="text-[10px] text-cyber-muted font-sans mt-1">
            to see how the system responds when evidence disappears.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-cyber-border/40 pt-4 font-mono text-[10px] text-cyber-muted z-10">
        <span>LOCAL SIMULATION v0.1 · NO EXTERNAL CONNECTIVITY</span>
        <span className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-cyber-green animate-pulse" />
          AIR-GAPPED COMPLIANT
        </span>
      </div>
    </div>
  );
};
