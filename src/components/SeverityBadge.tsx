import { type Severity } from "@/lib/scanner-types";

const severityConfig: Record<Severity, { bg: string; text: string; border: string }> = {
  critical: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/20",
  },
  high: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/20",
  },
  medium: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  low: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
  },
  info: {
    bg: "bg-info/10",
    text: "text-info",
    border: "border-info/20",
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}
