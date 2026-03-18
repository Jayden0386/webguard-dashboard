import { type Vulnerability, type Severity } from "@/lib/scanner-types";

const severityConfig: { key: Severity; label: string; color: string; bg: string }[] = [
  { key: "critical", label: "Critical", color: "text-destructive", bg: "bg-destructive/10" },
  { key: "high", label: "High", color: "text-destructive", bg: "bg-destructive/10" },
  { key: "medium", label: "Medium", color: "text-warning", bg: "bg-warning/10" },
  { key: "low", label: "Low", color: "text-success", bg: "bg-success/10" },
  { key: "info", label: "Info", color: "text-info", bg: "bg-info/10" },
];

interface SeveritySummaryProps {
  vulnerabilities: Vulnerability[];
}

export function SeveritySummary({ vulnerabilities }: SeveritySummaryProps) {
  const counts = vulnerabilities.reduce((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-5 gap-2">
      {severityConfig.map((s) => (
        <div key={s.key} className={`${s.bg} rounded-lg p-3 text-center`}>
          <p className={`text-xl font-display font-bold ${s.color}`}>{counts[s.key] || 0}</p>
          <p className="text-xs text-muted-foreground font-mono mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
