import { Shield, Code, Database, Cookie, Eye } from "lucide-react";

const features = [
  { label: "Security Headers", icon: Shield },
  { label: "XSS Detection", icon: Code },
  { label: "SQL Injection", icon: Database },
  { label: "Cookie Flags", icon: Cookie },
  { label: "Info Disclosure", icon: Eye },
];

export function FeaturePills() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {features.map((f) => (
        <div
          key={f.label}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground font-mono"
        >
          <f.icon className="w-3.5 h-3.5 text-success" />
          {f.label}
        </div>
      ))}
    </div>
  );
}
