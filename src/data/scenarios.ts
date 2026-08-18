import type { EvidenceEvent, Hypothesis, EvidenceRecommendation } from "../types";

export interface ScenarioData {
  id: string;
  name: string;
  networkSegment: string;
  description: string;
  states: {
    [key: number]: { // 100, 70, 40
      evidenceCompleteness: number;
      evidenceDebt: number;
      criticalGaps: number;
      investigationStatus: string;
      events: EvidenceEvent[];
      hypotheses: Hypothesis[];
      recommendations: EvidenceRecommendation[];
      whatWeKnow: string[];
      whatWeDontKnow: string[];
    };
    "40_resolved": { // State after investigating the top recommendation
      evidenceCompleteness: number;
      evidenceDebt: number;
      criticalGaps: number;
      investigationStatus: string;
      events: EvidenceEvent[];
      hypotheses: Hypothesis[];
      recommendations: EvidenceRecommendation[];
      whatWeKnow: string[];
      whatWeDontKnow: string[];
      restoredEvent: EvidenceEvent;
    };
  };
}

export const SCENARIOS: Record<string, ScenarioData> = {
  alpha: {
    id: "alpha",
    name: "Credential Compromise & Lateral Movement",
    networkSegment: "MIL-LOG-NET-07",
    description: "Suspicious authentication and lateral movement detected between WS-041 and LOG-SRV-12, followed by a sudden telemetry drop from the subnet controller.",
    states: {
      100: {
        evidenceCompleteness: 100,
        evidenceDebt: 8,
        criticalGaps: 1,
        investigationStatus: "STABLE",
        whatWeKnow: [
          "WS-041 authenticated to the network using svc_logistics credentials",
          "VPN connection originated from authorized external gateway IP",
          "Active SMB session established from WS-041 to LOG-SRV-12",
          "PowerShell activity detected executing system diagnostics script",
          "DC-03 authenticated svc_admin from WS-041 at 14:36:02 UTC"
        ],
        whatWeDontKnow: [
          "Whether svc_logistics credentials were leaked in prior breach",
          "If the diagnostic script executed unauthorized memory dump"
        ],
        recommendations: [
          {
            id: "rec_alpha_100_1",
            title: "LOG-SRV-12 PROCESS TELEMETRY",
            reason: "Verifying exact command execution arguments of PowerShell script PROC-9012.",
            impact: "MEDIUM",
            informationGain: 0.45,
            associatedHypothesis: "hyp_alpha_A",
            targetLogSource: "LOG-SRV-12 Process Log"
          }
        ],
        events: [
          {
            id: "AUTH-1832",
            timestamp: "14:31:02",
            type: "AUTH",
            source: "GATEWAY-01",
            description: "Successful VPN authentication for account 'svc_logistics' from external IP",
            status: "verified",
            reliability: 0.95
          },
          {
            id: "NET-8841",
            timestamp: "14:33:18",
            type: "NETWORK",
            source: "WS-041",
            destination: "LOG-SRV-12",
            description: "SMB session established using account 'svc_logistics'",
            status: "verified",
            reliability: 0.90
          },
          {
            id: "DC-9921",
            timestamp: "14:36:02",
            type: "AUTH",
            source: "DC-03",
            description: "Privileged authentication for 'svc_admin' initiated from WS-041",
            status: "verified",
            reliability: 0.98
          },
          {
            id: "PROC-9012",
            timestamp: "14:37:10",
            type: "PROCESS",
            source: "LOG-SRV-12",
            description: "PowerShell activity detected executing local diagnostics script as 'svc_admin'",
            status: "verified",
            reliability: 0.85
          },
          {
            id: "DATA-1102",
            timestamp: "14:39:45",
            type: "DATA",
            source: "LOG-SRV-12",
            description: "Temporary zip file staging detected in C:\\Windows\\Temp",
            status: "verified",
            reliability: 0.80
          }
        ],
        hypotheses: [
          {
            id: "hyp_alpha_A",
            name: "CREDENTIAL COMPROMISE",
            description: "External actor obtained 'svc_logistics' credentials, performed SMB lateral movement, and escalated privileges to 'svc_admin'.",
            confidence: 78,
            evidenceDebt: 8,
            status: "leading",
            supportingEvidence: ["AUTH-1832", "NET-8841", "DC-9921", "PROC-9012"],
            missingEvidence: [],
            conflictingEvidence: [],
            steps: [
              { id: "step_1", phase: "INITIAL_ACCESS", name: "VPN Authentication", description: "VPN ingress via 'svc_logistics' account", status: "confirmed", evidenceIds: ["AUTH-1832"] },
              { id: "step_2", phase: "CREDENTIAL_ACCESS", name: "Credential Reuse", description: "Valid account details reused across network boundaries", status: "confirmed", evidenceIds: ["AUTH-1832", "NET-8841"] },
              { id: "step_3", phase: "LATERAL_MOVEMENT", name: "SMB Connection", description: "Remote connection to Logistics Server 12", status: "confirmed", evidenceIds: ["NET-8841"] },
              { id: "step_4", phase: "PRIVILEGE_ESC", name: "Admin Privilege Escalation", description: "Transition to 'svc_admin' verified on DC-03", status: "confirmed", evidenceIds: ["DC-9921"] },
              { id: "step_5", phase: "DATA_ACCESS", name: "Data Staging", description: "Diagnostic archive prepared in Temp directory", status: "supported", evidenceIds: ["DATA-1102"] }
            ]
          }
        ]
      },
      70: {
        evidenceCompleteness: 70,
        evidenceDebt: 31,
        criticalGaps: 2,
        investigationStatus: "PARTIAL EVIDENCE",
        whatWeKnow: [
          "WS-041 authenticated to the network using svc_logistics credentials",
          "VPN connection originated from authorized external gateway IP",
          "Active SMB session established from WS-041 to LOG-SRV-12",
          "PowerShell activity was observed running on LOG-SRV-12"
        ],
        whatWeDontKnow: [
          "Whether privilege escalation occurred (missing DC-03 auth logs)",
          "If the PowerShell script ran under compromised administrator session",
          "Whether data staging occurred on LOG-SRV-12 (delayed filesystem logs)"
        ],
        recommendations: [
          {
            id: "rec_alpha_70_1",
            title: "DOMAIN CONTROLLER AUTHENTICATION LOGS",
            reason: "Verifying if privilege escalation occurred during the 14:34-14:37 telemetry delay.",
            impact: "HIGH",
            informationGain: 0.76,
            associatedHypothesis: "hyp_alpha_A",
            targetLogSource: "DC-03 Security Log"
          },
          {
            id: "rec_alpha_70_2",
            title: "LOG-SRV-12 FILE SYSTEM MONITOR",
            reason: "Confirming if local compression or archiving occurred on the target server.",
            impact: "MEDIUM",
            informationGain: 0.52,
            associatedHypothesis: "hyp_alpha_B",
            targetLogSource: "LOG-SRV-12 NTFS Journal"
          }
        ],
        events: [
          {
            id: "AUTH-1832",
            timestamp: "14:31:02",
            type: "AUTH",
            source: "GATEWAY-01",
            description: "Successful VPN authentication for account 'svc_logistics' from external IP",
            status: "verified",
            reliability: 0.95
          },
          {
            id: "NET-8841",
            timestamp: "14:33:18",
            type: "NETWORK",
            source: "WS-041",
            destination: "LOG-SRV-12",
            description: "SMB session established using account 'svc_logistics'",
            status: "verified",
            reliability: 0.90
          },
          {
            id: "DC-9921-GAP",
            timestamp: "14:36:02",
            type: "SYSTEM",
            source: "DC-03",
            description: "Privileged authentication logs - DELAYED/UNAVAILABLE",
            status: "delayed",
            reliability: 0.0
          },
          {
            id: "PROC-9012",
            timestamp: "14:37:10",
            type: "PROCESS",
            source: "LOG-SRV-12",
            description: "PowerShell activity detected executing local diagnostics script",
            status: "unverified",
            reliability: 0.60
          }
        ],
        hypotheses: [
          {
            id: "hyp_alpha_A",
            name: "CREDENTIAL COMPROMISE",
            description: "External actor obtained 'svc_logistics' credentials, performed SMB lateral movement, and escalated privileges to 'svc_admin'.",
            confidence: 65,
            evidenceDebt: 24,
            status: "leading",
            supportingEvidence: ["AUTH-1832", "NET-8841"],
            missingEvidence: ["DC-03 security logs (Privilege Escalation verification)"],
            conflictingEvidence: [],
            steps: [
              { id: "step_1", phase: "INITIAL_ACCESS", name: "VPN Authentication", description: "VPN ingress via 'svc_logistics' account", status: "confirmed", evidenceIds: ["AUTH-1832"] },
              { id: "step_2", phase: "CREDENTIAL_ACCESS", name: "Credential Reuse", description: "Valid account details reused across network boundaries", status: "confirmed", evidenceIds: ["AUTH-1832", "NET-8841"] },
              { id: "step_3", phase: "LATERAL_MOVEMENT", name: "SMB Connection", description: "Remote connection to Logistics Server 12", status: "confirmed", evidenceIds: ["NET-8841"] },
              { id: "step_4", phase: "PRIVILEGE_ESC", name: "Admin Privilege Escalation", description: "Transition to 'svc_admin' unverified due to missing telemetry", status: "unverified", evidenceIds: [], missingEvidenceReason: "Missing DC-03 auth log" },
              { id: "step_5", phase: "DATA_ACCESS", name: "Data Staging", description: "No filesystem logs available to verify staging", status: "missing", evidenceIds: [], missingEvidenceReason: "Delayed disk events" }
            ]
          },
          {
            id: "hyp_alpha_B",
            name: "MALWARE INTRODUCTION",
            description: "Automated threat introduced via initial ingress vector, attempting self-propagation via SMB shares.",
            confidence: 48,
            evidenceDebt: 38,
            status: "plausible",
            supportingEvidence: ["NET-8841", "PROC-9012"],
            missingEvidence: ["Process parent-child chain logs", "Local registry alteration events"],
            conflictingEvidence: [],
            steps: [
              { id: "step_1", phase: "INITIAL_ACCESS", name: "Malware Ingress", description: "Initial delivery via unknown medium", status: "unverified", evidenceIds: [] },
              { id: "step_2", phase: "CREDENTIAL_ACCESS", name: "Token Theft", description: "Attempted local token harvesting", status: "unverified", evidenceIds: [] },
              { id: "step_3", phase: "LATERAL_MOVEMENT", name: "SMB Infection Flow", description: "Automated network scans and SMB connection", status: "supported", evidenceIds: ["NET-8841"] },
              { id: "step_4", phase: "PRIVILEGE_ESC", name: "Process Hijack", description: "PowerShell spawned to hijack elevated tokens", status: "supported", evidenceIds: ["PROC-9012"] },
              { id: "step_5", phase: "DATA_ACCESS", name: "Staging and Exfiltration", description: "Malicious payloads staged local workspace", status: "missing", evidenceIds: [] }
            ]
          }
        ]
      },
      40: {
        evidenceCompleteness: 40,
        evidenceDebt: 67,
        criticalGaps: 4,
        investigationStatus: "SEVERE EVIDENCE INSUFFICIENCY",
        whatWeKnow: [
          "✓ WS-041 authenticated to the network using svc_logistics credentials",
          "✓ WS-041 established an SMB connection to LOG-SRV-12 at 14:33:18 UTC",
          "✓ PowerShell activity was observed on LOG-SRV-12 at 14:37:10 UTC"
        ],
        whatWeDontKnow: [
          "? Whether credentials were compromised (no token telemetry)",
          "? Whether privilege escalation occurred (no DC-03 authentication logs)",
          "? Whether LOG-SRV-12 was accessed successfully (filesystem events missing)",
          "? Whether data staging occurred (disk monitor offline)"
        ],
        recommendations: [
          {
            id: "rec_alpha_40_1",
            title: "DOMAIN CONTROLLER AUTHENTICATION LOGS",
            reason: "Would distinguish between credential compromise and insider credential misuse by verifying svc_admin escalation.",
            impact: "HIGH",
            informationGain: 0.82,
            associatedHypothesis: "hyp_alpha_A",
            targetLogSource: "DC-03 Security Log"
          },
          {
            id: "rec_alpha_40_2",
            title: "LOG-SRV-12 PROCESS TELEMETRY",
            reason: "Analyze command arguments to check if PowerShell execution was an automated script or interactive shell.",
            impact: "HIGH",
            informationGain: 0.67,
            associatedHypothesis: "hyp_alpha_B",
            targetLogSource: "LOG-SRV-12 Auditing Log"
          },
          {
            id: "rec_alpha_40_3",
            title: "VPN SESSION HISTORY",
            reason: "Verify login locations and timing parameters of the gateway connection.",
            impact: "MEDIUM",
            informationGain: 0.51,
            associatedHypothesis: "hyp_alpha_C",
            targetLogSource: "VPN Gateway History"
          }
        ],
        events: [
          {
            id: "AUTH-1832",
            timestamp: "14:31:02",
            type: "AUTH",
            source: "GATEWAY-01",
            description: "Successful VPN authentication for account 'svc_logistics' from external IP",
            status: "verified",
            reliability: 0.95
          },
          {
            id: "NET-8841",
            timestamp: "14:33:18",
            type: "NETWORK",
            source: "WS-041",
            destination: "LOG-SRV-12",
            description: "SMB session established using account 'svc_logistics'",
            status: "verified",
            reliability: 0.90
          },
          // 14:34 - 14:37 TELEMETRY GAP
          {
            id: "PROC-9012",
            timestamp: "14:37:10",
            type: "PROCESS",
            source: "LOG-SRV-12",
            description: "PowerShell activity detected executing script",
            status: "delayed",
            reliability: 0.55
          }
        ],
        hypotheses: [
          {
            id: "hyp_alpha_A",
            name: "CREDENTIAL COMPROMISE",
            description: "External actor obtained 'svc_logistics' credentials, performed SMB lateral movement, and escalated privileges to 'svc_admin'.",
            confidence: 52,
            evidenceDebt: 45,
            status: "leading",
            supportingEvidence: ["AUTH-1832", "NET-8841"],
            missingEvidence: [
              "DC-03 privileged auth event (14:36:02)",
              "LOG-SRV-12 process hierarchy metrics"
            ],
            conflictingEvidence: [],
            steps: [
              { id: "step_1", phase: "INITIAL_ACCESS", name: "VPN Authentication", description: "VPN ingress via 'svc_logistics' account", status: "confirmed", evidenceIds: ["AUTH-1832"] },
              { id: "step_2", phase: "CREDENTIAL_ACCESS", name: "Credential Reuse", description: "Valid account details reused across network boundaries", status: "supported", evidenceIds: ["AUTH-1832", "NET-8841"] },
              { id: "step_3", phase: "LATERAL_MOVEMENT", name: "SMB Connection", description: "Remote connection to Logistics Server 12", status: "supported", evidenceIds: ["NET-8841"] },
              { id: "step_4", phase: "PRIVILEGE_ESC", name: "Admin Privilege Escalation", description: "UNVERIFIED: Required evidence 'DC-03 privileged authentication logs' missing during gap", status: "unverified", evidenceIds: [], missingEvidenceReason: "Required: DC-03 privileged authentication logs" },
              { id: "step_5", phase: "DATA_ACCESS", name: "Data Staging", description: "MISSING: File staging logs unavailable due to telemetry failure", status: "missing", evidenceIds: [], missingEvidenceReason: "Required: Server filesystem events" }
            ]
          },
          {
            id: "hyp_alpha_B",
            name: "MALWARE INTRODUCTION",
            description: "Automated threat introduced via initial ingress vector, attempting self-propagation via SMB shares.",
            confidence: 42,
            evidenceDebt: 58,
            status: "plausible",
            supportingEvidence: ["NET-8841", "PROC-9012"],
            missingEvidence: ["Process parent-child chain logs", "Host registry modification events"],
            conflictingEvidence: [],
            steps: [
              { id: "step_1", phase: "INITIAL_ACCESS", name: "Malware Ingress", description: "Infiltration through malicious attachment or download", status: "unverified", evidenceIds: [] },
              { id: "step_2", phase: "CREDENTIAL_ACCESS", name: "Local Credential Harvesting", description: "Memory scraping unverified due to log loss", status: "unverified", evidenceIds: [] },
              { id: "step_3", phase: "LATERAL_MOVEMENT", name: "SMB Share Attack", description: "Automated network scans and SMB connection", status: "supported", evidenceIds: ["NET-8841"] },
              { id: "step_4", phase: "PRIVILEGE_ESC", name: "PowerShell Injection", description: "PowerShell activity observed (delayed log)", status: "supported", evidenceIds: ["PROC-9012"] },
              { id: "step_5", phase: "DATA_ACCESS", name: "Malicious Deployment", description: "No server file logs available", status: "missing", evidenceIds: [] }
            ]
          },
          {
            id: "hyp_alpha_C",
            name: "INSIDER CREDENTIAL MISUSE",
            description: "Authorized logistics user accessing LOG-SRV-12 outside duty hours, misusing administrative capabilities.",
            confidence: 31,
            evidenceDebt: 69,
            status: "weak",
            supportingEvidence: ["AUTH-1832", "NET-8841"],
            missingEvidence: ["Operator shift roster alignment", "Local console interaction logs"],
            conflictingEvidence: ["PROC-9012"], // PowerShell execution is atypical for this user profile
            steps: [
              { id: "step_1", phase: "INITIAL_ACCESS", name: "Internal Access", description: "User accesses local workstation console", status: "supported", evidenceIds: ["AUTH-1832"] },
              { id: "step_2", phase: "CREDENTIAL_ACCESS", name: "Legitimate Account Use", description: "Active session authenticated securely", status: "supported", evidenceIds: ["AUTH-1832"] },
              { id: "step_3", phase: "LATERAL_MOVEMENT", name: "Authorized Share Access", description: "Standard SMB connection to shared resource", status: "supported", evidenceIds: ["NET-8841"] },
              { id: "step_4", phase: "PRIVILEGE_ESC", name: "Unauthorized Privilege Use", description: "Atypical admin command execution", status: "contradicted", evidenceIds: ["PROC-9012"] },
              { id: "step_5", phase: "DATA_ACCESS", name: "Internal Data Staging", description: "No filesystem evidence", status: "missing", evidenceIds: [] }
            ]
          }
        ]
      },
      "40_resolved": {
        evidenceCompleteness: 81,
        evidenceDebt: 21,
        criticalGaps: 1,
        investigationStatus: "EVIDENCE STRENGTHENED",
        whatWeKnow: [
          "✓ WS-041 authenticated to the network using svc_logistics credentials",
          "✓ WS-041 established an SMB connection to LOG-SRV-12 at 14:33:18 UTC",
          "✓ Verified: DC-03 processed elevated credentials for svc_admin from WS-041 at 14:36:02 UTC",
          "✓ PowerShell activity was observed on LOG-SRV-12 at 14:37:10 UTC"
        ],
        whatWeDontKnow: [
          "? Whether data staging or exfiltration occurred on LOG-SRV-12 (filesystem logs remain offline)"
        ],
        recommendations: [
          {
            id: "rec_alpha_res_1",
            title: "LOG-SRV-12 FILE SYSTEM JOURNAL",
            reason: "Required to confirm if ZIP files or staging directories were constructed in C:\\Windows\\Temp.",
            impact: "HIGH",
            informationGain: 0.90,
            associatedHypothesis: "hyp_alpha_A",
            targetLogSource: "LOG-SRV-12 NTFS Journal"
          }
        ],
        events: [
          {
            id: "AUTH-1832",
            timestamp: "14:31:02",
            type: "AUTH",
            source: "GATEWAY-01",
            description: "Successful VPN authentication for account 'svc_logistics' from external IP",
            status: "verified",
            reliability: 0.95
          },
          {
            id: "NET-8841",
            timestamp: "14:33:18",
            type: "NETWORK",
            source: "WS-041",
            destination: "LOG-SRV-12",
            description: "SMB session established using account 'svc_logistics'",
            status: "verified",
            reliability: 0.90
          },
          // New event injected
          {
            id: "DC-03-AUTH",
            timestamp: "14:36:02",
            type: "AUTH",
            source: "DC-03",
            description: "Privileged authentication: account 'svc_admin' verified from WS-041",
            status: "verified",
            reliability: 0.98,
            details: "Authentication type: Kerberos TGT request. User: svc_admin. Source IP: WS-041. Status: Success."
          },
          {
            id: "PROC-9012",
            timestamp: "14:37:10",
            type: "PROCESS",
            source: "LOG-SRV-12",
            description: "PowerShell activity detected executing script",
            status: "verified",
            reliability: 0.85
          }
        ],
        hypotheses: [
          {
            id: "hyp_alpha_A",
            name: "CREDENTIAL COMPROMISE",
            description: "External actor obtained 'svc_logistics' credentials, performed SMB lateral movement, and escalated privileges to 'svc_admin'.",
            confidence: 91,
            evidenceDebt: 10,
            status: "leading",
            supportingEvidence: ["AUTH-1832", "NET-8841", "DC-03-AUTH", "PROC-9012"],
            missingEvidence: ["Filesystem staging logs (C:\\Windows\\Temp access)"],
            conflictingEvidence: [],
            steps: [
              { id: "step_1", phase: "INITIAL_ACCESS", name: "VPN Authentication", description: "VPN ingress via 'svc_logistics' account", status: "confirmed", evidenceIds: ["AUTH-1832"] },
              { id: "step_2", phase: "CREDENTIAL_ACCESS", name: "Credential Reuse", description: "Valid account details reused across network boundaries", status: "confirmed", evidenceIds: ["AUTH-1832", "NET-8841"] },
              { id: "step_3", phase: "LATERAL_MOVEMENT", name: "SMB Connection", description: "Remote connection to Logistics Server 12", status: "confirmed", evidenceIds: ["NET-8841"] },
              { id: "step_4", phase: "PRIVILEGE_ESC", name: "Admin Privilege Escalation", description: "SUPPORTED: Authenticated as 'svc_admin' from WS-041 via DC-03 logs", status: "supported", evidenceIds: ["DC-03-AUTH"] },
              { id: "step_5", phase: "DATA_ACCESS", name: "Data Staging", description: "UNVERIFIED: File staging logs still unavailable due to local network segment latency", status: "unverified", evidenceIds: [], missingEvidenceReason: "Required: LOG-SRV-12 NTFS filesystem records" }
            ]
          },
          {
            id: "hyp_alpha_B",
            name: "MALWARE INTRODUCTION",
            description: "Automated threat introduced via initial ingress vector, attempting self-propagation via SMB shares.",
            confidence: 37,
            evidenceDebt: 45,
            status: "plausible",
            supportingEvidence: ["NET-8841", "PROC-9012"],
            missingEvidence: ["Process parent-child chain logs", "Local registry alteration events"],
            conflictingEvidence: ["DC-03-AUTH"], // Kerberos authentications indicate direct credentials rather than local process exploit
            steps: [
              { id: "step_1", phase: "INITIAL_ACCESS", name: "Malware Ingress", description: "Initial delivery via unknown medium", status: "unverified", evidenceIds: [] },
              { id: "step_2", phase: "CREDENTIAL_ACCESS", name: "Token Theft", description: "Attempted local token harvesting", status: "unverified", evidenceIds: [] },
              { id: "step_3", phase: "LATERAL_MOVEMENT", name: "SMB Infection Flow", description: "Automated network scans and SMB connection", status: "supported", evidenceIds: ["NET-8841"] },
              { id: "step_4", phase: "PRIVILEGE_ESC", name: "Process Hijack", description: "PowerShell spawned to hijack elevated tokens", status: "contradicted", evidenceIds: ["DC-03-AUTH"] },
              { id: "step_5", phase: "DATA_ACCESS", name: "Staging and Exfiltration", description: "Malicious payloads staged local workspace", status: "missing", evidenceIds: [] }
            ]
          },
          {
            id: "hyp_alpha_C",
            name: "INSIDER CREDENTIAL MISUSE",
            description: "Authorized logistics user accessing LOG-SRV-12 outside duty hours, misusing administrative capabilities.",
            confidence: 18,
            evidenceDebt: 72,
            status: "weak",
            supportingEvidence: ["AUTH-1832", "NET-8841"],
            missingEvidence: ["Operator shift roster alignment", "Local console interaction logs"],
            conflictingEvidence: ["PROC-9012", "DC-03-AUTH"], // Highly atypical admin credential escalation from client workstation
            steps: [
              { id: "step_1", phase: "INITIAL_ACCESS", name: "Internal Access", description: "User accesses local workstation console", status: "supported", evidenceIds: ["AUTH-1832"] },
              { id: "step_2", phase: "CREDENTIAL_ACCESS", name: "Legitimate Account Use", description: "Active session authenticated securely", status: "supported", evidenceIds: ["AUTH-1832"] },
              { id: "step_3", phase: "LATERAL_MOVEMENT", name: "Authorized Share Access", description: "Standard SMB connection to shared resource", status: "supported", evidenceIds: ["NET-8841"] },
              { id: "step_4", phase: "PRIVILEGE_ESC", name: "Unauthorized Privilege Use", description: "Atypical admin command execution", status: "contradicted", evidenceIds: ["DC-03-AUTH"] },
              { id: "step_5", phase: "DATA_ACCESS", name: "Internal Data Staging", description: "No filesystem evidence", status: "missing", evidenceIds: [] }
            ]
          }
        ],
        restoredEvent: {
          id: "DC-03-AUTH",
          timestamp: "14:36:02",
          type: "AUTH",
          source: "DC-03",
          description: "Privileged authentication: account 'svc_admin' verified from WS-041",
          status: "verified",
          reliability: 0.98,
          details: "Authentication type: Kerberos TGT request. User: svc_admin. Source IP: WS-041. Status: Success."
        }
      }
    }
  },
  bravo: {
    id: "bravo",
    name: "Lateral Movement & Subnet Propagation",
    networkSegment: "MIL-OPS-NET-09",
    description: "Active scanning on subnet 10.92.4.0/24 from host WS-082. Local firewall logging was suspended during scanning duration.",
    states: {
      100: {
        evidenceCompleteness: 100,
        evidenceDebt: 10,
        criticalGaps: 1,
        investigationStatus: "STABLE",
        whatWeKnow: [
          "WS-082 initiated TCP SYN scan across subnet 10.92.4.0/24",
          "SMB access logs verify connection attempt to LOG-SRV-14",
          "Host process logs on LOG-SRV-14 verify service installation",
          "Firewall records confirm ports 445 and 139 were allowed"
        ],
        whatWeDontKnow: [
          "If the installed service was a legitimate logistics daemon",
          "Whether scanning behavior was triggered by local diagnostic tests"
        ],
        recommendations: [
          {
            id: "rec_bravo_100_1",
            title: "LOG-SRV-14 SERVICE CONFIGURATION",
            reason: "Verifying binary signature of the newly registered system service.",
            impact: "HIGH",
            informationGain: 0.60,
            associatedHypothesis: "hyp_bravo_A",
            targetLogSource: "LOG-SRV-14 Registry Log"
          }
        ],
        events: [
          {
            id: "NET-5511",
            timestamp: "15:02:11",
            type: "NETWORK",
            source: "WS-082",
            description: "Subnet scan detected: TCP ports 139, 445, 3389",
            status: "verified",
            reliability: 0.95
          },
          {
            id: "NET-5512",
            timestamp: "15:04:40",
            type: "NETWORK",
            source: "WS-082",
            destination: "LOG-SRV-14",
            description: "Successful SMB connection established over port 445",
            status: "verified",
            reliability: 0.92
          },
          {
            id: "PROC-5513",
            timestamp: "15:06:12",
            type: "PROCESS",
            source: "LOG-SRV-14",
            description: "System Service registered: 'LogisticsSyncDaemon'",
            status: "verified",
            reliability: 0.96
          }
        ],
        hypotheses: [
          {
            id: "hyp_bravo_A",
            name: "SERVICE EXPLOITATION",
            description: "Compromised subnet client WS-082 used SMB to upload and register a remote access service on LOG-SRV-14.",
            confidence: 84,
            evidenceDebt: 10,
            status: "leading",
            supportingEvidence: ["NET-5511", "NET-5512", "PROC-5513"],
            missingEvidence: [],
            conflictingEvidence: [],
            steps: [
              { id: "step_b1", phase: "INITIAL_ACCESS", name: "Subnet Scan", description: "Scanning of internal assets detected", status: "confirmed", evidenceIds: ["NET-5511"] },
              { id: "step_b2", phase: "CREDENTIAL_ACCESS", name: "SMB Authentication", description: "Authentication over port 445 using administrative credentials", status: "confirmed", evidenceIds: ["NET-5512"] },
              { id: "step_b3", phase: "LATERAL_MOVEMENT", name: "Remote Service Execution", description: "Registration of system service on LOG-SRV-14", status: "confirmed", evidenceIds: ["PROC-5513"] },
              { id: "step_b4", phase: "PRIVILEGE_ESC", name: "SYSTEM Execution", description: "Service running with elevated permissions", status: "supported", evidenceIds: ["PROC-5513"] },
              { id: "step_b5", phase: "DATA_ACCESS", name: "System Control", description: "Awaiting remote control commands", status: "supported", evidenceIds: [] }
            ]
          }
        ]
      },
      70: {
        evidenceCompleteness: 70,
        evidenceDebt: 34,
        criticalGaps: 2,
        investigationStatus: "PARTIAL TELEMETRY",
        whatWeKnow: [
          "WS-082 initiated port scan activity at 15:02:11 UTC",
          "New system service registered on LOG-SRV-14 at 15:06:12 UTC"
        ],
        whatWeDontKnow: [
          "Whether WS-082 successfully completed SMB handshake (missing firewall session tables)",
          "If service creation was triggered via remote RPC or local script"
        ],
        recommendations: [
          {
            id: "rec_bravo_70_1",
            title: "FIREWALL NETWORK SESSION ARCHIVE",
            reason: "Verifying network flow session bytes between WS-082 and LOG-SRV-14.",
            impact: "HIGH",
            informationGain: 0.70,
            associatedHypothesis: "hyp_bravo_A",
            targetLogSource: "Subnet Firewall Archive"
          }
        ],
        events: [
          {
            id: "NET-5511",
            timestamp: "15:02:11",
            type: "NETWORK",
            source: "WS-082",
            description: "Subnet scan detected: TCP ports 139, 445, 3389",
            status: "verified",
            reliability: 0.95
          },
          {
            id: "NET-5512-GAP",
            timestamp: "15:04:40",
            type: "SYSTEM",
            source: "FIREWALL-09",
            description: "Network flow records - DELAYED/MISSING",
            status: "delayed",
            reliability: 0.0
          },
          {
            id: "PROC-5513",
            timestamp: "15:06:12",
            type: "PROCESS",
            source: "LOG-SRV-14",
            description: "System Service registered: 'LogisticsSyncDaemon'",
            status: "verified",
            reliability: 0.96
          }
        ],
        hypotheses: [
          {
            id: "hyp_bravo_A",
            name: "SERVICE EXPLOITATION",
            description: "Compromised subnet client WS-082 used SMB to upload and register a remote access service on LOG-SRV-14.",
            confidence: 60,
            evidenceDebt: 34,
            status: "leading",
            supportingEvidence: ["NET-5511", "PROC-5513"],
            missingEvidence: ["SMB network handshake session log"],
            conflictingEvidence: [],
            steps: [
              { id: "step_b1", phase: "INITIAL_ACCESS", name: "Subnet Scan", description: "Scanning of internal assets detected", status: "confirmed", evidenceIds: ["NET-5511"] },
              { id: "step_b2", phase: "CREDENTIAL_ACCESS", name: "SMB Authentication", description: "UNVERIFIED: Authentication status cannot be determined due to firewall log delay", status: "unverified", evidenceIds: [], missingEvidenceReason: "Missing network session telemetry" },
              { id: "step_b3", phase: "LATERAL_MOVEMENT", name: "Remote Service Execution", description: "Registration of system service on LOG-SRV-14", status: "confirmed", evidenceIds: ["PROC-5513"] },
              { id: "step_b4", phase: "PRIVILEGE_ESC", name: "SYSTEM Execution", description: "Service running with elevated permissions", status: "supported", evidenceIds: ["PROC-5513"] },
              { id: "step_b5", phase: "DATA_ACCESS", name: "System Control", description: "Awaiting remote control commands", status: "missing", evidenceIds: [] }
            ]
          }
        ]
      },
      40: {
        evidenceCompleteness: 40,
        evidenceDebt: 72,
        criticalGaps: 3,
        investigationStatus: "SEVERE TELEMETRY FAILURE",
        whatWeKnow: [
          "✓ Subnet scan activity detected from WS-082 at 15:02:11 UTC"
        ],
        whatWeDontKnow: [
          "? Whether any remote connection was made to LOG-SRV-14 (no firewall logs)",
          "? Whether any process modification occurred on target server (server agent offline)",
          "? What tools were executed locally on WS-082 to conduct scans (host logs missing)"
        ],
        recommendations: [
          {
            id: "rec_bravo_40_1",
            title: "FIREWALL NETWORK SESSION ARCHIVE",
            reason: "Would confirm if SMB connections succeeded between WS-082 and LOG-SRV-14.",
            impact: "HIGH",
            informationGain: 0.85,
            associatedHypothesis: "hyp_bravo_A",
            targetLogSource: "Subnet Firewall Archive"
          },
          {
            id: "rec_bravo_40_2",
            title: "LOG-SRV-14 SERVICE REGISTRY RECORD",
            reason: "Query Windows registry logs to verify if service creation occurred during the loss window.",
            impact: "HIGH",
            informationGain: 0.73,
            associatedHypothesis: "hyp_bravo_A",
            targetLogSource: "LOG-SRV-14 Registry Audit Log"
          },
          {
            id: "rec_bravo_40_3",
            title: "WS-082 PROCESS AUDIT LOGS",
            reason: "Confirm if port scanning tool (nmap/masscan) was triggered by operator or automated payload.",
            impact: "MEDIUM",
            informationGain: 0.58,
            associatedHypothesis: "hyp_bravo_B",
            targetLogSource: "WS-082 Client Audit Log"
          }
        ],
        events: [
          {
            id: "NET-5511",
            timestamp: "15:02:11",
            type: "NETWORK",
            source: "WS-082",
            description: "Subnet scan detected: TCP ports 139, 445, 3389",
            status: "verified",
            reliability: 0.95
          }
          // 15:03 - 15:08 TELEMETRY GAP
        ],
        hypotheses: [
          {
            id: "hyp_bravo_A",
            name: "SERVICE EXPLOITATION",
            description: "Compromised subnet client WS-082 used SMB to upload and register a remote access service on LOG-SRV-14.",
            confidence: 45,
            evidenceDebt: 60,
            status: "leading",
            supportingEvidence: ["NET-5511"],
            missingEvidence: [
              "SMB session logs (15:04:40)",
              "LOG-SRV-14 system service registration log (15:06:12)"
            ],
            conflictingEvidence: [],
            steps: [
              { id: "step_b1", phase: "INITIAL_ACCESS", name: "Subnet Scan", description: "Scanning of internal assets detected", status: "confirmed", evidenceIds: ["NET-5511"] },
              { id: "step_b2", phase: "CREDENTIAL_ACCESS", name: "SMB Authentication", description: "UNVERIFIED: Host and firewall connection records missing during telemetry gap", status: "unverified", evidenceIds: [], missingEvidenceReason: "Required: SMB firewall logs" },
              { id: "step_b3", phase: "LATERAL_MOVEMENT", name: "Remote Service Execution", description: "MISSING: Host registry monitoring offline during events", status: "missing", evidenceIds: [], missingEvidenceReason: "Required: LOG-SRV-14 local registry auditing logs" },
              { id: "step_b4", phase: "PRIVILEGE_ESC", name: "SYSTEM Execution", description: "UNVERIFIED: Process logs unavailable", status: "unverified", evidenceIds: [] },
              { id: "step_b5", phase: "DATA_ACCESS", name: "System Control", description: "MISSING: Exfiltration monitoring offline", status: "missing", evidenceIds: [] }
            ]
          },
          {
            id: "hyp_bravo_B",
            name: "BENIGN MAINTENANCE SCAN",
            description: "Subnet scans conducted as part of automated network asset verification by logistics administrators.",
            confidence: 38,
            evidenceDebt: 65,
            status: "plausible",
            supportingEvidence: ["NET-5511"],
            missingEvidence: ["Admin scheduling records", "Local task scheduler logs"],
            conflictingEvidence: [],
            steps: [
              { id: "step_b_m1", phase: "INITIAL_ACCESS", name: "Scheduled Scan Init", description: "Authorized asset discovery scan", status: "supported", evidenceIds: ["NET-5511"] },
              { id: "step_b_m2", phase: "CREDENTIAL_ACCESS", name: "Admin Token Validation", description: "Legitimate administrator tokens validated", status: "unverified", evidenceIds: [] },
              { id: "step_b_m3", phase: "LATERAL_MOVEMENT", name: "Diagnostic Session", description: "Standard SMB interrogation query", status: "unverified", evidenceIds: [] },
              { id: "step_b_m4", phase: "PRIVILEGE_ESC", name: "Audit Execution", description: "System audit utility executed", status: "unverified", evidenceIds: [] },
              { id: "step_b_m5", phase: "DATA_ACCESS", name: "Inventory Database Update", description: "Discovery results reported back to controller", status: "missing", evidenceIds: [] }
            ]
          }
        ]
      },
      "40_resolved": {
        evidenceCompleteness: 75,
        evidenceDebt: 24,
        criticalGaps: 1,
        investigationStatus: "RESTORED VERIFIED TELEMETRY",
        whatWeKnow: [
          "✓ Subnet scan activity detected from WS-082 at 15:02:11 UTC",
          "✓ Verified: Firewall records confirm successful SMB connection from WS-082 to LOG-SRV-14",
          "✓ Verified: Service registered 'LogisticsSyncDaemon' on LOG-SRV-14"
        ],
        whatWeDontKnow: [
          "? Whether any data staging occurred on LOG-SRV-14 (host disk logs remain offline)"
        ],
        recommendations: [
          {
            id: "rec_bravo_res_1",
            title: "LOG-SRV-14 SYSTEM MEMORY ANALYSIS",
            reason: "Verifying binary signature of system service registered during scan window.",
            impact: "HIGH",
            informationGain: 0.88,
            associatedHypothesis: "hyp_bravo_A",
            targetLogSource: "LOG-SRV-14 Volatility Dump"
          }
        ],
        events: [
          {
            id: "NET-5511",
            timestamp: "15:02:11",
            type: "NETWORK",
            source: "WS-082",
            description: "Subnet scan detected: TCP ports 139, 445, 3389",
            status: "verified",
            reliability: 0.95
          },
          {
            id: "NET-5512-RESTORED",
            timestamp: "15:04:40",
            type: "NETWORK",
            source: "WS-082",
            destination: "LOG-SRV-14",
            description: "SMB session verified: Authentication success for administrator account",
            status: "verified",
            reliability: 0.94,
            details: "Session duration: 18 seconds. Transferred: 1.2MB. Port: 445. Status: Success."
          },
          {
            id: "PROC-5513-RESTORED",
            timestamp: "15:06:12",
            type: "PROCESS",
            source: "LOG-SRV-14",
            description: "System Service registered: 'LogisticsSyncDaemon' executing unsigned binary",
            status: "verified",
            reliability: 0.90
          }
        ],
        hypotheses: [
          {
            id: "hyp_bravo_A",
            name: "SERVICE EXPLOITATION",
            description: "Compromised subnet client WS-082 used SMB to upload and register a remote access service on LOG-SRV-14.",
            confidence: 89,
            evidenceDebt: 15,
            status: "leading",
            supportingEvidence: ["NET-5511", "NET-5512-RESTORED", "PROC-5513-RESTORED"],
            missingEvidence: ["System service binary hash approval status"],
            conflictingEvidence: [],
            steps: [
              { id: "step_b1", phase: "INITIAL_ACCESS", name: "Subnet Scan", description: "Scanning of internal assets detected", status: "confirmed", evidenceIds: ["NET-5511"] },
              { id: "step_b2", phase: "CREDENTIAL_ACCESS", name: "SMB Authentication", description: "SUPPORTED: Successful SMB administration connection verified via firewall logs", status: "supported", evidenceIds: ["NET-5512-RESTORED"] },
              { id: "step_b3", phase: "LATERAL_MOVEMENT", name: "Remote Service Execution", description: "SUPPORTED: Registered service 'LogisticsSyncDaemon' on LOG-SRV-14 verified", status: "supported", evidenceIds: ["PROC-5513-RESTORED"] },
              { id: "step_b4", phase: "PRIVILEGE_ESC", name: "SYSTEM Execution", description: "SUPPORTED: Unsigned binary registered as system service daemon", status: "supported", evidenceIds: ["PROC-5513-RESTORED"] },
              { id: "step_b5", phase: "DATA_ACCESS", name: "System Control", description: "UNVERIFIED: Active system shell connection unconfirmed", status: "unverified", evidenceIds: [] }
            ]
          },
          {
            id: "hyp_bravo_B",
            name: "BENIGN MAINTENANCE SCAN",
            description: "Subnet scans conducted as part of automated network asset verification by logistics administrators.",
            confidence: 21,
            evidenceDebt: 58,
            status: "weak",
            supportingEvidence: ["NET-5511"],
            missingEvidence: ["Admin scheduling records"],
            conflictingEvidence: ["PROC-5513-RESTORED"], // Maintenance scans do not register unsigned system daemons on servers
            steps: [
              { id: "step_b_m1", phase: "INITIAL_ACCESS", name: "Scheduled Scan Init", description: "Authorized asset discovery scan", status: "supported", evidenceIds: ["NET-5511"] },
              { id: "step_b_m2", phase: "CREDENTIAL_ACCESS", name: "Admin Token Validation", description: "Legitimate administrator tokens validated", status: "supported", evidenceIds: ["NET-5512-RESTORED"] },
              { id: "step_b_m3", phase: "LATERAL_MOVEMENT", name: "Diagnostic Session", description: "Standard SMB interrogation query", status: "supported", evidenceIds: ["NET-5512-RESTORED"] },
              { id: "step_b_m4", phase: "PRIVILEGE_ESC", name: "Audit Execution", description: "Atypical daemon registered during audit scan", status: "contradicted", evidenceIds: ["PROC-5513-RESTORED"] },
              { id: "step_b_m5", phase: "DATA_ACCESS", name: "Inventory Database Update", description: "No database updates observed", status: "missing", evidenceIds: [] }
            ]
          }
        ],
        restoredEvent: {
          id: "NET-5512-RESTORED",
          timestamp: "15:04:40",
          type: "NETWORK",
          source: "WS-082",
          destination: "LOG-SRV-14",
          description: "SMB session verified: Authentication success for administrator account",
          status: "verified",
          reliability: 0.94,
          details: "Session duration: 18 seconds. Transferred: 1.2MB. Port: 445. Status: Success."
        }
      }
    }
  },
  charlie: {
    id: "charlie",
    name: "Insider Credential Misuse",
    networkSegment: "MIL-SEC-DATA-01",
    description: "Unusual data access volume observed on secure database repository by account svc_backup during non-operational hours.",
    states: {
      100: {
        evidenceCompleteness: 100,
        evidenceDebt: 5,
        criticalGaps: 1,
        investigationStatus: "STABLE",
        whatWeKnow: [
          "Account svc_backup logged in at 23:41:12 UTC (atypical hour)",
          "Established connection to backup SQL database repository DB-SRV-01",
          "Read query sequence processed: 18.4 GB extracted",
          "Destination IP verified as internal secure archive server ARCH-SRV-01"
        ],
        whatWeDontKnow: [
          "If the backup operator triggered the query sequence on behalf of security officers",
          "If the data extraction volume contains encrypted logistics mapping tables"
        ],
        recommendations: [
          {
            id: "rec_charlie_100_1",
            title: "ARCH-SRV-01 ACCESS LOGS",
            reason: "Verifying backup repository access credentials and active host sessions.",
            impact: "HIGH",
            informationGain: 0.50,
            associatedHypothesis: "hyp_charlie_A",
            targetLogSource: "ARCH-SRV-01 Security Log"
          }
        ],
        events: [
          {
            id: "AUTH-9901",
            timestamp: "23:41:12",
            type: "AUTH",
            source: "DB-SRV-01",
            description: "Successful login for backup account 'svc_backup' from backup subnet",
            status: "verified",
            reliability: 0.98
          },
          {
            id: "DATA-9902",
            timestamp: "23:44:05",
            type: "DATA",
            source: "DB-SRV-01",
            description: "Query executed: SELECT ALL FROM log_routing_table. 18.4GB queried.",
            status: "verified",
            reliability: 0.95
          },
          {
            id: "NET-9903",
            timestamp: "23:49:15",
            type: "NETWORK",
            source: "DB-SRV-01",
            destination: "ARCH-SRV-01",
            description: "Data transfer stream: 18.4GB over TCP port 8080",
            status: "verified",
            reliability: 0.92
          }
        ],
        hypotheses: [
          {
            id: "hyp_charlie_A",
            name: "INSIDER EXFILTRATION",
            description: "Authorized backup credentials utilized out-of-hours to harvest and stage tactical routing tables.",
            confidence: 81,
            evidenceDebt: 5,
            status: "leading",
            supportingEvidence: ["AUTH-9901", "DATA-9902", "NET-9903"],
            missingEvidence: [],
            conflictingEvidence: [],
            steps: [
              { id: "step_c1", phase: "INITIAL_ACCESS", name: "Legitimate Login", description: "Credential validation successful at atypical hour", status: "confirmed", evidenceIds: ["AUTH-9901"] },
              { id: "step_c2", phase: "CREDENTIAL_ACCESS", name: "Role Misuse", description: "Backup service account queries operational routing database", status: "confirmed", evidenceIds: ["DATA-9902"] },
              { id: "step_c3", phase: "LATERAL_MOVEMENT", name: "Internal Transfer", description: "SQL extraction streams directed to secure staging host", status: "confirmed", evidenceIds: ["NET-9903"] },
              { id: "step_c4", phase: "PRIVILEGE_ESC", name: "Backup Privileges", description: "Queries run with DBA credentials granted to backup account", status: "confirmed", evidenceIds: ["DATA-9902"] },
              { id: "step_c5", phase: "DATA_ACCESS", name: "Data Staging", description: "18.4GB payload staged on backup archive server", status: "supported", evidenceIds: ["NET-9903"] }
            ]
          }
        ]
      },
      70: {
        evidenceCompleteness: 70,
        evidenceDebt: 28,
        criticalGaps: 2,
        investigationStatus: "PARTIAL TELEMETRY",
        whatWeKnow: [
          "Account svc_backup logged in at 23:41:12 UTC (atypical hour)",
          "Read query sequence processed: 18.4 GB extracted from DB-SRV-01"
        ],
        whatWeDontKnow: [
          "Where the extracted 18.4GB data stream was transferred (missing server interface records)",
          "If target staging host validated backup stream credentials"
        ],
        recommendations: [
          {
            id: "rec_charlie_70_1",
            title: "DB-SRV-01 NETWORK FLOW LOGS",
            reason: "Verify destination socket and byte counts for outgoing stream from database host.",
            impact: "HIGH",
            informationGain: 0.72,
            associatedHypothesis: "hyp_charlie_A",
            targetLogSource: "DB-SRV-01 NetFlow logs"
          }
        ],
        events: [
          {
            id: "AUTH-9901",
            timestamp: "23:41:12",
            type: "AUTH",
            source: "DB-SRV-01",
            description: "Successful login for backup account 'svc_backup' from backup subnet",
            status: "verified",
            reliability: 0.98
          },
          {
            id: "DATA-9902",
            timestamp: "23:44:05",
            type: "DATA",
            source: "DB-SRV-01",
            description: "Query executed: SELECT ALL FROM log_routing_table. 18.4GB queried.",
            status: "verified",
            reliability: 0.95
          },
          {
            id: "NET-9903-GAP",
            timestamp: "23:49:15",
            type: "SYSTEM",
            source: "DB-SRV-01",
            description: "Outgoing network session logs - DELAYED/MISSING",
            status: "delayed",
            reliability: 0.0
          }
        ],
        hypotheses: [
          {
            id: "hyp_charlie_A",
            name: "INSIDER EXFILTRATION",
            description: "Authorized backup credentials utilized out-of-hours to harvest and stage tactical routing tables.",
            confidence: 62,
            evidenceDebt: 28,
            status: "leading",
            supportingEvidence: ["AUTH-9901", "DATA-9902"],
            missingEvidence: ["Database outbound transfer endpoint records"],
            conflictingEvidence: [],
            steps: [
              { id: "step_c1", phase: "INITIAL_ACCESS", name: "Legitimate Login", description: "Credential validation successful at atypical hour", status: "confirmed", evidenceIds: ["AUTH-9901"] },
              { id: "step_c2", phase: "CREDENTIAL_ACCESS", name: "Role Misuse", description: "Backup service account queries operational routing database", status: "confirmed", evidenceIds: ["DATA-9902"] },
              { id: "step_c3", phase: "LATERAL_MOVEMENT", name: "Internal Transfer", description: "UNVERIFIED: Destination IP for database stream is unrecorded during telemetry gap", status: "unverified", evidenceIds: [], missingEvidenceReason: "Outbound NetFlow logs missing" },
              { id: "step_c4", phase: "PRIVILEGE_ESC", name: "Backup Privileges", description: "Queries run with DBA credentials granted to backup account", status: "confirmed", evidenceIds: ["DATA-9902"] },
              { id: "step_c5", phase: "DATA_ACCESS", name: "Data Staging", description: "MISSING: Destination staging verification delayed", status: "missing", evidenceIds: [] }
            ]
          }
        ]
      },
      40: {
        evidenceCompleteness: 40,
        evidenceDebt: 68,
        criticalGaps: 3,
        investigationStatus: "SEVERE TELEMETRY FAILURE",
        whatWeKnow: [
          "✓ Account svc_backup authenticated successfully to DB-SRV-01 at 23:41:12 UTC"
        ],
        whatWeDontKnow: [
          "? What queries were run after authentication (database audit events lost)",
          "? Whether data was transferred out of DB-SRV-01 (network logs lost)",
          "? If login was initiated locally or from external gateway (session telemetry missing)"
        ],
        recommendations: [
          {
            id: "rec_charlie_40_1",
            title: "DB-SRV-01 SQL AUDIT LOG",
            reason: "Required to verify query content executed during the active telemetry loss window.",
            impact: "HIGH",
            informationGain: 0.88,
            associatedHypothesis: "hyp_charlie_A",
            targetLogSource: "DB-SRV-01 SQL Audit"
          },
          {
            id: "rec_charlie_40_2",
            title: "DB-SRV-01 NETWORK FLOW LOGS",
            reason: "Confirm if network data transfers occurred during the backup account session.",
            impact: "HIGH",
            informationGain: 0.70,
            associatedHypothesis: "hyp_charlie_A",
            targetLogSource: "DB-SRV-01 NetFlow logs"
          },
          {
            id: "rec_charlie_40_3",
            title: "SECURE BACKUP POLICY REGISTRY",
            reason: "Confirm if out-of-hours backups were scheduled on this date by admin command.",
            impact: "MEDIUM",
            informationGain: 0.48,
            associatedHypothesis: "hyp_charlie_B",
            targetLogSource: "Backup Schedule Ledger"
          }
        ],
        events: [
          {
            id: "AUTH-9901",
            timestamp: "23:41:12",
            type: "AUTH",
            source: "DB-SRV-01",
            description: "Successful login for backup account 'svc_backup' from backup subnet",
            status: "verified",
            reliability: 0.98
          }
          // 23:42 - 23:50 TELEMETRY GAP
        ],
        hypotheses: [
          {
            id: "hyp_charlie_A",
            name: "INSIDER EXFILTRATION",
            description: "Authorized backup credentials utilized out-of-hours to harvest and stage tactical routing tables.",
            confidence: 48,
            evidenceDebt: 55,
            status: "leading",
            supportingEvidence: ["AUTH-9901"],
            missingEvidence: [
              "SQL command query logs (23:44:05)",
              "DB outbound transfer stream network events (23:49:15)"
            ],
            conflictingEvidence: [],
            steps: [
              { id: "step_c1", phase: "INITIAL_ACCESS", name: "Legitimate Login", description: "Credential validation successful at atypical hour", status: "confirmed", evidenceIds: ["AUTH-9901"] },
              { id: "step_c2", phase: "CREDENTIAL_ACCESS", name: "Role Misuse", description: "UNVERIFIED: SQL command logging offline during telemetry gap", status: "unverified", evidenceIds: [], missingEvidenceReason: "Required: DB-SRV-01 database auditing records" },
              { id: "step_c3", phase: "LATERAL_MOVEMENT", name: "Internal Transfer", description: "MISSING: NetFlow logging offline during network window", status: "missing", evidenceIds: [], missingEvidenceReason: "Required: Database server egress session logs" },
              { id: "step_c4", phase: "PRIVILEGE_ESC", name: "Backup Privileges", description: "UNVERIFIED: Database DBA access usage details unlogged", status: "unverified", evidenceIds: [] },
              { id: "step_c5", phase: "DATA_ACCESS", name: "Data Staging", description: "MISSING: No file storage indicators logged", status: "missing", evidenceIds: [] }
            ]
          },
          {
            id: "hyp_charlie_B",
            name: "SCHEDULED ARCHIVAL",
            description: "Authorized scheduled automated backup execution as per policy regulations.",
            confidence: 42,
            evidenceDebt: 58,
            status: "plausible",
            supportingEvidence: ["AUTH-9901"],
            missingEvidence: ["Schedule policy manifest validation"],
            conflictingEvidence: [],
            steps: [
              { id: "step_c_s1", phase: "INITIAL_ACCESS", name: "Scheduler Login", description: "Automated trigger validates daemon authentication", status: "supported", evidenceIds: ["AUTH-9901"] },
              { id: "step_c_s2", phase: "CREDENTIAL_ACCESS", name: "Role Execution", description: "Daemon executes under system schedule permissions", status: "unverified", evidenceIds: [] },
              { id: "step_c_s3", phase: "LATERAL_MOVEMENT", name: "Standard Sync Gateway", description: "Data stream pushed to designated storage portal", status: "unverified", evidenceIds: [] },
              { id: "step_c_s4", phase: "PRIVILEGE_ESC", name: "Legitimate DBA Invocation", description: "System triggers archive procedure", status: "unverified", evidenceIds: [] },
              { id: "step_c_s5", phase: "DATA_ACCESS", name: "Sync Staging Verification", description: "Backup successfully stored", status: "missing", evidenceIds: [] }
            ]
          }
        ]
      },
      "40_resolved": {
        evidenceCompleteness: 78,
        evidenceDebt: 22,
        criticalGaps: 1,
        investigationStatus: "RESTORED VERIFIED TELEMETRY",
        whatWeKnow: [
          "✓ Account svc_backup authenticated successfully to DB-SRV-01 at 23:41:12 UTC",
          "✓ Verified: SQL query command read 18.4GB from log_routing_table",
          "✓ Verified: Outbound network session logs confirm 18.4GB data stream to ARCH-SRV-01"
        ],
        whatWeDontKnow: [
          "? Whether ARCH-SRV-01 local file encryption is verified (host agent offline)"
        ],
        recommendations: [
          {
            id: "rec_charlie_res_1",
            title: "ARCH-SRV-01 PROCESS EXECUTION AUDIT",
            reason: "Verifying backup completion scripts and cryptographic signature validation processes.",
            impact: "HIGH",
            informationGain: 0.90,
            associatedHypothesis: "hyp_charlie_A",
            targetLogSource: "ARCH-SRV-01 Process Monitor"
          }
        ],
        events: [
          {
            id: "AUTH-9901",
            timestamp: "23:41:12",
            type: "AUTH",
            source: "DB-SRV-01",
            description: "Successful login for backup account 'svc_backup' from backup subnet",
            status: "verified",
            reliability: 0.98
          },
          {
            id: "DATA-9902-RESTORED",
            timestamp: "23:44:05",
            type: "DATA",
            source: "DB-SRV-01",
            description: "Query audit success: SELECT ALL FROM log_routing_table. 18.4GB retrieved.",
            status: "verified",
            reliability: 0.94,
            details: "Client IP: 10.92.10.42. Database: logistics_db. Query duration: 184 seconds. Rows affected: 450,000. Privilege level: DBA."
          },
          {
            id: "NET-9903-RESTORED",
            timestamp: "23:49:15",
            type: "NETWORK",
            source: "DB-SRV-01",
            destination: "ARCH-SRV-01",
            description: "Network transfer completed: 18.4GB successfully sent to archive server",
            status: "verified",
            reliability: 0.92
          }
        ],
        hypotheses: [
          {
            id: "hyp_charlie_A",
            name: "INSIDER EXFILTRATION",
            description: "Authorized backup credentials utilized out-of-hours to harvest and stage tactical routing tables.",
            confidence: 90,
            evidenceDebt: 12,
            status: "leading",
            supportingEvidence: ["AUTH-9901", "DATA-9902-RESTORED", "NET-9903-RESTORED"],
            missingEvidence: ["Staged file hashes validation on ARCH-SRV-01"],
            conflictingEvidence: [],
            steps: [
              { id: "step_c1", phase: "INITIAL_ACCESS", name: "Legitimate Login", description: "Credential validation successful at atypical hour", status: "confirmed", evidenceIds: ["AUTH-9901"] },
              { id: "step_c2", phase: "CREDENTIAL_ACCESS", name: "Role Misuse", description: "SUPPORTED: SQL query reading routing tables verified via restored DB audit logs", status: "supported", evidenceIds: ["DATA-9902-RESTORED"] },
              { id: "step_c3", phase: "LATERAL_MOVEMENT", name: "Internal Transfer", description: "SUPPORTED: Network socket transfer stream to ARCH-SRV-01 verified", status: "supported", evidenceIds: ["NET-9903-RESTORED"] },
              { id: "step_c4", phase: "PRIVILEGE_ESC", name: "Backup Privileges", description: "SUPPORTED: DBA query execution validated", status: "supported", evidenceIds: ["DATA-9902-RESTORED"] },
              { id: "step_c5", phase: "DATA_ACCESS", name: "Data Staging", description: "UNVERIFIED: File integrity confirmation unverified on destination server", status: "unverified", evidenceIds: [] }
            ]
          },
          {
            id: "hyp_charlie_B",
            name: "SCHEDULED ARCHIVAL",
            description: "Authorized scheduled automated backup execution as per policy regulations.",
            confidence: 25,
            evidenceDebt: 62,
            status: "weak",
            supportingEvidence: ["AUTH-9901"],
            missingEvidence: ["Schedule policy manifest validation"],
            conflictingEvidence: ["DATA-9902-RESTORED"], // Policy regulations specify database archives run weekly, not on a daily routing table subset
            steps: [
              { id: "step_c_s1", phase: "INITIAL_ACCESS", name: "Scheduler Login", description: "Automated trigger validates daemon authentication", status: "supported", evidenceIds: ["AUTH-9901"] },
              { id: "step_c_s2", phase: "CREDENTIAL_ACCESS", name: "Role Execution", description: "Daemon executes under system schedule permissions", status: "supported", evidenceIds: ["DATA-9902-RESTORED"] },
              { id: "step_c_s3", phase: "LATERAL_MOVEMENT", name: "Standard Sync Gateway", description: "Data stream pushed to designated storage portal", status: "supported", evidenceIds: ["NET-9903-RESTORED"] },
              { id: "step_c_s4", phase: "PRIVILEGE_ESC", name: "Legitimate DBA Invocation", description: "Atypical database subset queried during standard sync window", status: "contradicted", evidenceIds: ["DATA-9902-RESTORED"] },
              { id: "step_c_s5", phase: "DATA_ACCESS", name: "Sync Staging Verification", description: "No sync confirmation logs generated", status: "missing", evidenceIds: [] }
            ]
          }
        ],
        restoredEvent: {
          id: "DATA-9902-RESTORED",
          timestamp: "23:44:05",
          type: "DATA",
          source: "DB-SRV-01",
          description: "Query audit success: SELECT ALL FROM log_routing_table. 18.4GB retrieved.",
          status: "verified",
          reliability: 0.94,
          details: "Client IP: 10.92.10.42. Database: logistics_db. Query duration: 184 seconds. Rows affected: 450,000. Privilege level: DBA."
        }
      }
    }
  }
};
