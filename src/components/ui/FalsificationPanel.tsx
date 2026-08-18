import React from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import type { Hypothesis } from "../../types";
import { Tooltip } from "./Tooltip";

interface FalsificationPanelProps {
  hypothesis: Hypothesis;
  onCheckEvidence?: () => void;
}

export const FalsificationPanel: React.FC<FalsificationPanelProps> = ({ hypothesis, onCheckEvidence }) => {
  const fal = hypothesis.falsification;

  if (!fal) return null;

  return (
    <div className="bg-cyber-surface border border-cyber-border/50 p-5 space-y-4 relative">
      <div className="flex items-center justify-between border-b border-cyber-border/40 pb-2.5">
        <div>
          <span className="font-mono text-[9px] text-cyber-cyan uppercase tracking-widest block font-bold">
            FEATURE #2 · COUNTERFACTUAL REASONING
          </span>
          <h3 className="text-white text-xs font-black uppercase tracking-wider font-mono mt-0.5">
            WHAT WOULD CHANGE THIS ASSESSMENT?
          </h3>
        </div>
        <Tooltip content="Shows conditions that would strengthen or disprove this hypothesis, plus the single most decisive evidence check." position="top">
          <HelpCircle className="w-3.5 h-3.5 text-cyber-muted/60" />
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WOULD STRENGTHEN */}
        <div className="p-3.5 border border-cyber-green/30 bg-cyber-green/5 space-y-2">
          <h4 className="font-mono text-[10px] font-bold text-cyber-green-text uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green shrink-0" />
            WOULD STRENGTHEN
          </h4>
          <ul className="space-y-1.5 text-[10px] font-sans">
            {fal.wouldStrengthen.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-cyber-text/90">
                <span className="text-cyber-green font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{item.replace(/^✓\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WOULD WEAKEN */}
        <div className="p-3.5 border border-cyber-amber/30 bg-cyber-amber/5 space-y-2">
          <h4 className="font-mono text-[10px] font-bold text-cyber-amber-text uppercase flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-cyber-amber shrink-0" />
            WOULD WEAKEN
          </h4>
          <ul className="space-y-1.5 text-[10px] font-sans">
            {fal.wouldWeaken.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-cyber-text/90">
                <span className="text-cyber-amber font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{item.replace(/^×\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* MOST DECISIVE EVIDENCE */}
      <div className="bg-cyber-bg border border-cyber-cyan/30 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[10px]">
        <div>
          <span className="text-cyber-muted uppercase block text-[9px]">MOST DECISIVE EVIDENCE</span>
          <strong className="text-white text-xs uppercase font-bold block mt-0.5">{fal.mostDecisiveEvidence}</strong>
          <span className="text-cyber-muted/70 text-[9px] block">Target Source: {fal.targetLogSource}</span>
        </div>

        {onCheckEvidence && (
          <button
            onClick={onCheckEvidence}
            className="px-3.5 py-2 bg-cyber-cyan text-cyber-bg hover:bg-white font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
          >
            CHECK THIS EVIDENCE
          </button>
        )}
      </div>
    </div>
  );
};
