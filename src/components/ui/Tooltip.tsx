import React, { useState, useRef } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  maxWidth?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  maxWidth = "200px",
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;
    if (position === "top") {
      top = rect.top - 8;
      left = rect.left + rect.width / 2;
    } else if (position === "bottom") {
      top = rect.bottom + 8;
      left = rect.left + rect.width / 2;
    }
    setCoords({ top, left });
    setVisible(true);
  };

  return (
    <span
      ref={triggerRef}
      className="relative inline-block cursor-help"
      onMouseEnter={show}
      onMouseLeave={() => setVisible(false)}
      onFocus={show}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          className="fixed z-[100] pointer-events-none"
          style={{ top: coords.top, left: coords.left, transform: position === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)" }}
        >
          <span
            className="block bg-[#1a2028] border border-cyber-border text-cyber-text text-[10px] font-sans leading-relaxed px-2.5 py-2 shadow-xl"
            style={{ maxWidth, width: "max-content" }}
          >
            {content}
          </span>
        </span>
      )}
    </span>
  );
};

// Inline tooltip trigger with a ? icon
interface TermTooltipProps {
  term: string;
  explanation: string;
}
export const TermTooltip: React.FC<TermTooltipProps> = ({ term, explanation }) => (
  <Tooltip content={explanation} position="top">
    <span className="border-b border-dashed border-cyber-muted/40 text-inherit">
      {term}
    </span>
  </Tooltip>
);
