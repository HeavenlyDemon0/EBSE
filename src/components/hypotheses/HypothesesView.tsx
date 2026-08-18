import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { 
  BarChart2, ShieldAlert
} from "lucide-react";

interface MatrixCellDetail {
  title: string;
  hypothesis: string;
  evidence: string;
  status: "SUPPORTED" | "UNRESOLVED" | "CONTRADICTED";
  explanation: string;
  requiredLog: string;
}

export const HypothesesView: React.FC = () => {
  const { state } = useSimulation();
  
  const [selectedCell, setSelectedCell] = useState<MatrixCellDetail | null>(null);

  const isResolved = state.investigatedLogs.length > 0;

  // Define rows and columns of comparison matrix based on state
  const rows = [
    {
      id: "vpn_auth",
      label: "VPN Authentication",
      alpha: {
        A: { status: "SUPPORTED", explanation: "AUTH-1832 verifies VPN ingress using svc_logistics credentials.", log: "VPN Gateway Authentication Log" },
        B: { status: "SUPPORTED", explanation: "External connection from VPN allows initial entry payload delivery.", log: "VPN Gateway Authentication Log" },
        C: { status: "SUPPORTED", explanation: "Legitimate login by credential holder via standard VPN client.", log: "VPN Gateway Authentication Log" }
      }
    },
    {
      id: "cred_reuse",
      label: "Credential Reuse",
      alpha: {
        A: { status: "SUPPORTED", explanation: "Credentials validated on secondary host WS-041 indicating reuse.", log: "Local Security Log" },
        B: { status: "UNRESOLVED", explanation: "Malware might use local memory dump token extraction instead.", log: "WS-041 Token Telemetry Log" },
        C: { status: "UNRESOLVED", explanation: "Insider might use native session without cross-boundary reuse.", log: "Local Console Auth Log" }
      }
    },
    {
      id: "lateral_mov",
      label: "Lateral Movement (SMB)",
      alpha: {
        A: { status: "SUPPORTED", explanation: "NET-8841 confirms active SMB session established to LOG-SRV-12.", log: "LOG-SRV-12 Network Session Logs" },
        B: { status: "SUPPORTED", explanation: "SMB connection confirms malware propagation attempt over port 445.", log: "LOG-SRV-12 Network Session Logs" },
        C: { status: "UNRESOLVED", explanation: "Backup user profile atypical for cross-network SMB sharing operations.", log: "LOG-SRV-12 Network Session Logs" }
      }
    },
    {
      id: "priv_esc",
      label: "Privilege Escalation",
      alpha: {
        A: { 
          status: isResolved ? "SUPPORTED" : "UNRESOLVED", 
          explanation: isResolved 
            ? "DC-03-AUTH confirms Kerberos ticket request for elevated account svc_admin." 
            : "Missing: DC-03 security logs. Privilege escalation unverified during gap.", 
          log: "DC-03 Security Log" 
        },
        B: { status: "SUPPORTED", explanation: "PROC-9012 confirms PowerShell executing system commands.", log: "LOG-SRV-12 Process Auditing Log" },
        C: { status: "CONTRADICTED", explanation: "Command prompt execution conflicts with basic backup automation credentials.", log: "LOG-SRV-12 Process Auditing Log" }
      }
    },
    {
      id: "data_stage",
      label: "Data Access (Staging)",
      alpha: {
        A: { 
          status: state.telemetryIntegrity === 100 ? "SUPPORTED" : "UNRESOLVED", 
          explanation: state.telemetryIntegrity === 100 
            ? "DATA-1102 directly confirms zip temporary directory staging." 
            : "Missing: server NTFS logs. File archive staging unconfirmed.", 
          log: "LOG-SRV-12 NTFS Journal" 
        },
        B: { status: "UNRESOLVED", explanation: "Exfiltration tools staging directory could not be verified.", log: "LOG-SRV-12 NTFS Journal" },
        C: { status: "UNRESOLVED", explanation: "Insider volume retrieval staging remains offline.", log: "LOG-SRV-12 NTFS Journal" }
      }
    }
  ];

  const getCellBadge = (status: "SUPPORTED" | "UNRESOLVED" | "CONTRADICTED") => {
    switch (status) {
      case "SUPPORTED":
        return <span className="text-[10px] font-mono font-bold text-cyber-green-text bg-cyber-green/10 px-2 py-0.5 rounded-sm border border-cyber-green/20">✓ SUPPORTED</span>;
      case "UNRESOLVED":
        return <span className="text-[10px] font-mono font-bold text-cyber-amber-text bg-cyber-amber/10 px-2 py-0.5 rounded-sm border border-cyber-amber/20">? UNRESOLVED</span>;
      case "CONTRADICTED":
        return <span className="text-[10px] font-mono font-bold text-cyber-red-text bg-cyber-red/10 px-2 py-0.5 rounded-sm border border-cyber-red/35">× CONTRADICTED</span>;
    }
  };

  const getCellColor = (status: "SUPPORTED" | "UNRESOLVED" | "CONTRADICTED") => {
    switch (status) {
      case "SUPPORTED": return "hover:bg-cyber-green/5";
      case "UNRESOLVED": return "hover:bg-cyber-amber/5";
      case "CONTRADICTED": return "hover:bg-cyber-red/5";
    }
  };

  const handleCellClick = (rowLabel: string, hypName: string, cellData: any) => {
    setSelectedCell({
      title: `${hypName} / ${rowLabel}`,
      hypothesis: hypName,
      evidence: rowLabel,
      status: cellData.status,
      explanation: cellData.explanation,
      requiredLog: cellData.log
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyber-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
            HYPOTHESIS MATRIX COMPARISON
          </h2>
          <p className="text-xs text-cyber-muted mt-0.5">
            Cross-referencing network indicators across active theories to identify resolving evidence vectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MATRIX MATRIX GRID (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-cyber-surface border border-cyber-border/50 p-6 rounded-sm relative overflow-x-auto">
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-cyber-cyan" />
            <span className="font-mono text-[10px] text-cyber-muted uppercase tracking-widest block mb-4">
              CROSS-CORRELATION MATRIX TABLE
            </span>

            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-cyber-border/40">
                  <th className="py-3 px-4 font-mono text-[10px] text-cyber-muted uppercase tracking-wider">EVIDENCE LAYER</th>
                  <th className="py-3 px-4 font-mono text-[10px] text-cyber-cyan uppercase tracking-wider">H-A: CREDENTIAL</th>
                  <th className="py-3 px-4 font-mono text-[10px] text-cyber-amber uppercase tracking-wider">H-B: MALWARE</th>
                  <th className="py-3 px-4 font-mono text-[10px] text-cyber-muted uppercase tracking-wider">H-C: INSIDER</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-cyber-border/20 hover:bg-cyber-hover/10 transition-colors">
                    <td className="py-4 px-4 font-bold text-white uppercase font-mono text-[11px]">{row.label}</td>
                    
                    {/* Hypothesis A */}
                    <td 
                      onClick={() => handleCellClick(row.label, "Credential Compromise (H-A)", row.alpha.A)}
                      className={`py-4 px-4 cursor-pointer transition-all ${getCellColor(row.alpha.A.status as any)}`}
                    >
                      {getCellBadge(row.alpha.A.status as any)}
                    </td>

                    {/* Hypothesis B */}
                    <td 
                      onClick={() => handleCellClick(row.label, "Malware Introduction (H-B)", row.alpha.B)}
                      className={`py-4 px-4 cursor-pointer transition-all ${getCellColor(row.alpha.B.status as any)}`}
                    >
                      {getCellBadge(row.alpha.B.status as any)}
                    </td>

                    {/* Hypothesis C */}
                    <td 
                      onClick={() => handleCellClick(row.label, "Insider Misuse (H-C)", row.alpha.C)}
                      className={`py-4 px-4 cursor-pointer transition-all ${getCellColor(row.alpha.C.status as any)}`}
                    >
                      {getCellBadge(row.alpha.C.status as any)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 text-[10px] font-mono text-cyber-muted text-right italic">
              * Click on any status cell to inspect evidentiary derivation.
            </div>
          </div>
        </div>

        {/* CELL INSPECTOR DETAIL SIDEBAR (1 col) */}
        <div className="space-y-4">
          <div className="bg-cyber-surface border border-cyber-border/50 p-5 rounded-sm min-h-[300px] flex flex-col justify-between">
            <div>
              <h4 className="text-white text-xs font-bold font-mono tracking-wider uppercase border-b border-cyber-border/40 pb-2 flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-cyber-cyan" />
                CELL EXPLORER
              </h4>

              {selectedCell ? (
                <div className="space-y-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] text-cyber-muted font-mono uppercase block">CHECKPOINT</span>
                    <strong className="text-white text-sm uppercase mt-0.5 block">{selectedCell.title}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-cyber-muted font-mono uppercase block">VERDICT STATE</span>
                    <div className="mt-1">{getCellBadge(selectedCell.status)}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-cyber-muted font-mono uppercase block">REASONING ASSESSMENT</span>
                    <p className="text-cyber-text leading-relaxed mt-1 text-[11px]">
                      {selectedCell.explanation}
                    </p>
                  </div>

                  <div className="border-t border-cyber-border/30 pt-3">
                    <span className="text-[10px] text-cyber-muted font-mono uppercase block">TARGET LOG SOURCE</span>
                    <span className="font-mono text-[10px] text-cyber-cyan mt-1 block">
                      {selectedCell.requiredLog}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-cyber-muted font-sans text-xs">
                  <ShieldAlert className="w-8 h-8 text-cyber-border mx-auto mb-3" />
                  <p>Click on any intersection matrix cell to verify log evidence correlation rules.</p>
                </div>
              )}
            </div>

            {selectedCell && (
              <div className="bg-cyber-bg p-3 border border-cyber-border/40 rounded-sm font-mono text-[9px] text-cyber-muted leading-relaxed mt-4">
                <strong>Verifying Rule:</strong> EBHE binds hypotheses directly to observed telemetry logs. If a log disappears, the status falls back to UNRESOLVED or CONTRADICTED.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
