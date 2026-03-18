import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanInput } from "@/components/ScanInput";
import { ScanTerminal } from "@/components/ScanTerminal";
import { SecurityScore } from "@/components/SecurityScore";
import { VulnerabilityCard } from "@/components/VulnerabilityCard";
import { FeaturePills } from "@/components/FeaturePills";
import { SeverityFilter } from "@/components/SeverityFilter";
import { SeveritySummary } from "@/components/SeveritySummary";
import { simulateScan } from "@/lib/scanner-engine";
import { type ScanResult, type ScanLog, type Severity } from "@/lib/scanner-types";
import { Shield, Clock, Globe, Activity } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] } },
};

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");

  const handleScan = useCallback(async (url: string) => {
    setIsScanning(true);
    setLogs([]);
    setProgress(0);
    setResult(null);
    setSeverityFilter("all");

    const scanResult = await simulateScan(
      url,
      (log) => setLogs((prev) => [...prev, log]),
      (pct) => setProgress(pct)
    );

    setResult(scanResult);
    setIsScanning(false);
  }, []);

  const filteredVulns = result?.vulnerabilities
    .filter((v) => severityFilter === "all" || v.severity === severityFilter)
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return order[a.severity] - order[b.severity];
    }) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-success" />
          <span className="font-display font-semibold text-foreground tracking-tight">WebGuard</span>
          <span className="text-xs text-muted-foreground font-mono ml-1">v1.0</span>
        </div>
      </header>

      {/* Hero / Scan Section */}
      <section className="container max-w-6xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {!result && !isScanning && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="py-24 text-center space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-display font-semibold text-foreground tracking-tight">
                Audit your perimeter.
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                Scan any URL for security vulnerabilities. Get actionable remediation in seconds.
              </p>
              <div className="pt-4">
                <ScanInput onScan={handleScan} isScanning={isScanning} />
              </div>
              <div className="pt-2">
                <FeaturePills />
              </div>
            </motion.div>
          )}

          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 space-y-6"
            >
              <div className="max-w-2xl mx-auto">
                <ScanInput onScan={handleScan} isScanning={isScanning} />
              </div>

              {/* Progress bar */}
              <div className="max-w-2xl mx-auto">
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-right font-mono">
                  {Math.round(progress)}%
                </p>
              </div>

              <ScanTerminal logs={logs} />
            </motion.div>
          )}

          {result && !isScanning && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="py-8 space-y-6"
            >
              {/* Scan bar stays at top */}
              <ScanInput onScan={handleScan} isScanning={isScanning} />

              {/* Scan metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-mono">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="truncate max-w-xs">{result.url}</span>
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  HTTP 200
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {result.scanTime.toFixed(1)}s
                </span>
                <span className="text-border">|</span>
                <span>{result.vulnerabilities.length} findings</span>
              </div>

              {/* Severity summary cards */}
              <SeveritySummary vulnerabilities={result.vulnerabilities} />

              {/* Dashboard grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Vulnerability Feed - 2 cols */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Vulnerability Feed
                    </h2>
                    <SeverityFilter active={severityFilter} onChange={setSeverityFilter} />
                  </div>
                  <div className="space-y-2">
                    {filteredVulns.length > 0 ? (
                      filteredVulns.map((vuln) => (
                        <VulnerabilityCard key={vuln.id} vuln={vuln} />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground font-mono py-8 text-center">
                        No findings match this filter.
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Score + Stats - 1 col */}
                <motion.div variants={itemVariants}>
                  <SecurityScore
                    score={result.score}
                    totalChecks={result.totalChecks}
                    passedChecks={result.passedChecks}
                    failedChecks={result.failedChecks}
                    scanTime={result.scanTime}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default Index;
