import { motion } from "framer-motion";

interface SecurityScoreProps {
  score: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  scanTime: number;
}

function getScoreColor(score: number) {
  if (score >= 80) return "hsl(var(--success))";
  if (score >= 50) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Good";
  if (score >= 50) return "Fair";
  return "Critical";
}

export function SecurityScore({ score, totalChecks, passedChecks, failedChecks, scanTime }: SecurityScoreProps) {
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="surface-card p-6 space-y-6">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Security Score</h2>
      
      <div className="flex justify-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <motion.circle
              cx="64" cy="64" r="56"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-display font-semibold"
              style={{ color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-xs text-muted-foreground mt-0.5">{getScoreLabel(score)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBlock label="Checks Run" value={totalChecks.toString()} />
        <StatBlock label="Passed" value={passedChecks.toString()} color="text-success" />
        <StatBlock label="Failed" value={failedChecks.toString()} color="text-destructive" />
        <StatBlock label="Scan Time" value={`${scanTime.toFixed(1)}s`} />
      </div>
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-background rounded-lg p-3 border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-display font-semibold ${color || "text-foreground"}`}>{value}</p>
    </div>
  );
}
