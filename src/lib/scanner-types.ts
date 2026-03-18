export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  description: string;
  evidence: string;
  remediation: string;
}

export interface ScanResult {
  url: string;
  score: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  scanTime: number;
  vulnerabilities: Vulnerability[];
}

export interface ScanLog {
  message: string;
  timestamp: number;
  type: "info" | "check" | "found" | "done";
}
