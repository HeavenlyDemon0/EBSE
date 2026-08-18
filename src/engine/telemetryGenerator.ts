import type { EvidenceEvent, EvidenceStatus } from "../types";

let eventCounter = 1000;

export function generateNextSyntheticEvent(
  _telemetryIntegrity: number,
  isLossActive: boolean
): EvidenceEvent {
  eventCounter++;
  const idNum = eventCounter;

  // Real local time timestamp HH:MM:SS
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });

  // Event pools
  const pool = [
    {
      type: "AUTH" as const,
      source: "GATEWAY-01",
      destination: "VPN-GW-01",
      account: "svc_logistics",
      description: "VPN ingress session heartbeat verified",
      status: "verified" as EvidenceStatus,
      reliability: 0.96,
      details: "Client IP: 198.51.100.44. Gateway: VPN-GW-01. Tunnel active.",
    },
    {
      type: "NETWORK" as const,
      source: "WS-041",
      destination: "LOG-SRV-12",
      account: "svc_logistics",
      description: "SMB session keep-alive packet observed over port 445",
      status: "verified" as EvidenceStatus,
      reliability: 0.92,
      details: "Protocol: SMBv3. Active connection state: ESTABLISHED.",
    },
    {
      type: "DNS" as const,
      source: "WS-041",
      destination: "DNS-SRV-01",
      account: "operator_07",
      description: "Internal hostname query resolved for log-srv-12.internal.mil",
      status: "verified" as EvidenceStatus,
      reliability: 0.98,
      details: "Query type: A. Response: 10.92.14.12. Query latency: 2ms.",
    },
    {
      type: "FILE" as const,
      source: "FILE-SRV-02",
      account: "svc_logistics",
      description: "Read access audit for logistics_manifest_2026.csv",
      status: "verified" as EvidenceStatus,
      reliability: 0.90,
      details: "Bytes read: 48,200. Shared folder: \\logistics\\manifests.",
    },
    {
      type: "SESSION" as const,
      source: "WS-041",
      account: "svc_logistics",
      description: "User session idle timer reset on terminal console",
      status: "verified" as EvidenceStatus,
      reliability: 0.88,
      details: "Console ID: TTY-04. Session duration: 42m 12s.",
    },
    {
      type: "PROCESS" as const,
      source: "LOG-SRV-12",
      account: "svc_admin",
      description: "PowerShell script process execution logged",
      status: (isLossActive ? "missing" : "verified") as EvidenceStatus,
      reliability: 0.85,
      details: isLossActive
        ? "NO TELEMETRY AVAILABLE — Log buffer overflow on LOG-SRV-12 sensor."
        : "Process ID: 4120. Command: powershell.exe -ExecutionPolicy Bypass.",
    },
    {
      type: "AUTH" as const,
      source: "DC-03",
      account: "svc_admin",
      description: "Privileged Kerberos ticket grant request from WS-041",
      status: (isLossActive ? "missing" : "verified") as EvidenceStatus,
      reliability: 0.98,
      details: isLossActive
        ? "NO TELEMETRY AVAILABLE — Sensor link degradation on DC-03."
        : "Kerberos TGT grant. Ticket encryption: AES256. Privilege: Domain Admin.",
    },
  ];

  // Pick an item deterministically cycling through
  const selectedIndex = idNum % pool.length;
  const template = pool[selectedIndex];

  // If telemetry loss is active and this is a sensitive event, override status
  let finalStatus = template.status;
  let finalDesc = template.description;

  if (isLossActive && (template.source === "DC-03" || template.source === "LOG-SRV-12")) {
    finalStatus = "missing";
    finalDesc = `${template.source} Telemetry Unavailable — NO TELEMETRY AVAILABLE`;
  }

  return {
    id: `EVT-${idNum}`,
    timestamp: timeStr,
    type: template.type,
    source: template.source,
    destination: template.destination,
    account: template.account,
    description: finalDesc,
    status: finalStatus,
    reliability: template.reliability,
    details: template.details,
  };
}
