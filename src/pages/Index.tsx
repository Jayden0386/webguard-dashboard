import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanInput } from "@/components/ScanInput";
import { ScanTerminal } from "@/components/ScanTerminal";
import { SecurityScore } from "@/components/SecurityScore";
import { VulnerabilityCard } from "@/components/VulnerabilityCard";
import { simulateScan } from "@/lib/scanner-engine";
import { type ScanResult, type ScanLog } from "@/lib/scanner-types";
import { Shield } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] } },
};

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = useCallback(async (url: string) => {
    setIsScanning(true);
    setLogs([]);
    setProgress(0);
    setResult(null);

    const scanResult = await simulateScan(
      url,
      (log) => setLogs((prev) => [...prev, log]),
      (pct) => setProgress(pct)
    );

    setResult(scanResult);
    setIsScanning(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
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

              {/* Result summary */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <span>Found {result.vulnerabilities.length} vulnerabilities in {result.scanTime.toFixed(1)}s</span>
                <span className="text-border">|</span>
                <span className="truncate">{result.url}</span>
              </div>

              {/* Dashboard grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Vulnerability Feed - 2 cols */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-3">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Vulnerability Feed
                  </h2>
                  <div className="space-y-2">
                    {result.vulnerabilities
                      .sort((a, b) => {
                        const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                        return order[a.severity] - order[b.severity];
                      })
                      .map((vuln) => (
                        <VulnerabilityCard key={vuln.id} vuln={vuln} />
                      ))}
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
