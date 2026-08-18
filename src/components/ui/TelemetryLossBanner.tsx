import React, { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface TelemetryLossBannerProps {
  show: boolean;
  hypothesisCount: number;
  debtBefore: number;
  debtAfter: number;
  onDismiss: () => void;
}

export const TelemetryLossBanner: React.FC<TelemetryLossBannerProps> = ({
  show,
  hypothesisCount,
  debtBefore,
  debtAfter,
  onDismiss,
}) => {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("gone");

  useEffect(() => {
    if (show) {
      setPhase("visible");
      const fadeTimer = setTimeout(() => setPhase("fading"), 4000);
      const goneTimer = setTimeout(() => { setPhase("gone"); onDismiss(); }, 4600);
      return () => { clearTimeout(fadeTimer); clearTimeout(goneTimer); };
    } else {
      setPhase("gone");
    }
  }, [show]);

  if (phase === "gone") return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
      style={{ opacity: phase === "fading" ? 0 : 1, transition: "opacity 0.6s ease-out" }}
    >
      <div className="pointer-events-auto w-full max-w-md mx-4 bg-cyber-surface border-2 border-cyber-red/60 shadow-2xl shadow-cyber-red/20 relative">
        {/* Red accent bar */}
        <div className="h-1 w-full bg-cyber-red" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-cyber-red/40 bg-cyber-red/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-cyber-red" />
            </div>
            <div className="flex-1">
              <div className="font-mono text-[10px] text-cyber-red font-black uppercase tracking-widest mb-1">
                EBHE RESPONSE
              </div>
              <h3 className="text-white font-black text-base uppercase mb-3 leading-tight">
                Telemetry Availability Decreased
              </h3>

              <div className="space-y-1.5 text-[11px] font-sans text-cyber-text/85 mb-4">
                <p className="flex items-start gap-2">
                  <span className="text-cyber-green font-bold font-mono mt-0.5 shrink-0">✓</span>
                  EBHE will <strong className="text-white">not infer missing events</strong>.
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-cyber-amber font-bold font-mono mt-0.5 shrink-0">→</span>
                  Maintaining <strong className="text-white">{hypothesisCount} surviving hypotheses</strong>.
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-cyber-red font-bold font-mono mt-0.5 shrink-0">↑</span>
                  Evidence Debt increased: <strong className="text-cyber-amber-text">{debtBefore} → {debtAfter}</strong>
                </p>
              </div>

              <div className="bg-cyber-bg border border-cyber-amber/20 p-3">
                <div className="font-mono text-[9px] text-cyber-amber font-black uppercase tracking-wider mb-1">
                  WHY THIS MATTERS
                </div>
                <p className="text-[10px] text-cyber-muted leading-relaxed font-sans">
                  A complete attack narrative can no longer be justified by available evidence. EBHE preserves competing explanations instead of filling the gap.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 text-cyber-muted hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="absolute bottom-0 left-0 h-0.5 bg-cyber-red/40 animate-[shrink_4s_linear_forwards]" style={{ width: "100%" }} />
      </div>
    </div>
  );
};
