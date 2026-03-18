import { type Severity } from "@/lib/scanner-types";

const severities: { value: Severity | "all"; label: string; color: string }[] = [
  { value: "all", label: "All", color: "bg-muted text-foreground" },
  { value: "critical", label: "Critical", color: "bg-destructive/15 text-destructive" },
  { value: "high", label: "High", color: "bg-destructive/10 text-destructive" },
  { value: "medium", label: "Medium", color: "bg-warning/15 text-warning" },
  { value: "low", label: "Low", color: "bg-success/15 text-success" },
  { value: "info", label: "Info", color: "bg-info/15 text-info" },
];

interface SeverityFilterProps {
  active: Severity | "all";
  onChange: (severity: Severity | "all") => void;
}

export function SeverityFilter({ active, onChange }: SeverityFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {severities.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${
            active === s.value
              ? `${s.color} ring-1 ring-current`
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
