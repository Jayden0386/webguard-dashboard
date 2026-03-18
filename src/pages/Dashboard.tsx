import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ScanInput } from "@/components/ScanInput";
import { ScanTerminal } from "@/components/ScanTerminal";
import { SecurityScore } from "@/components/SecurityScore";
import { VulnerabilityCard } from "@/components/VulnerabilityCard";
import { FeaturePills } from "@/components/FeaturePills";
import { SeverityFilter } from "@/components/SeverityFilter";
import { SeveritySummary } from "@/components/SeveritySummary";
import { simulateScan } from "@/lib/scanner-engine";
import { type ScanResult, type ScanLog, type Severity } from "@/lib/scanner-types";
import { Shield, Clock, Globe, Activity, LogOut, History, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] } },
};

const Dashboard = () => {
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleScan = useCallback(async (url: string) => {
    // SSRF protection — block internal IPs
    const ssrfPatterns = [/^https?:\/\/(127\.\d+\.\d+\.\d+)/, /^https?:\/\/(10\.\d+)/, /^https?:\/\/(192\.168\.)/, /^https?:\/\/(172\.(1[6-9]|2\d|3[01]))/, /^https?:\/\/localhost/i];
    if (ssrfPatterns.some((p) => p.test(url))) {
      alert("⚠ Scanning internal network addresses is not allowed.");
      return;
    }

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
    setScanHistory((prev) => [scanResult, ...prev].slice(0, 20));
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
        <div className="container max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-success" />
            <span className="font-display font-semibold text-foreground tracking-tight">WebGuard</span>
            <span className="text-xs text-muted-foreground font-mono ml-1">v2.0</span>
          </div>
          <div className="flex items-center gap-4">
            {isOwner && (
              <button
                onClick={() => navigate("/owner/dashboard")}
                className="text-xs font-mono text-warning hover:text-warning/80 transition-colors"
              >
                Admin Panel
              </button>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="container max-w-6xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {!result && !isScanning && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="py-20 text-center space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-display font-semibold text-foreground tracking-tight">
                Audit your perimeter.
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                Scan any URL for security vulnerabilities. Surface and deep scans with actionable remediation.
              </p>
              <div className="pt-4">
                <ScanInput onScan={handleScan} isScanning={isScanning} />
              </div>
              <div className="pt-2">
                <FeaturePills />
              </div>

              {/* Recent scan history */}
              {scanHistory.length > 0 && (
                <div className="pt-8 max-w-md mx-auto text-left">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                    <History className="w-3.5 h-3.5" />
                    Recent Scans
                  </h3>
                  <div className="space-y-1.5">
                    {scanHistory.slice(0, 5).map((s, i) => (
                      <div key={i} className="surface-card px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                        <span className="text-foreground truncate max-w-[200px]">{s.url}</span>
                        <span className={`font-semibold ${s.score >= 80 ? "text-success" : s.score >= 40 ? "text-warning" : "text-destructive"}`}>
                          {s.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <div className="max-w-2xl mx-auto">
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-right font-mono">{Math.round(progress)}%</p>
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
              <ScanInput onScan={handleScan} isScanning={isScanning} />

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

              <SeveritySummary vulnerabilities={result.vulnerabilities} />

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Vulnerability Feed</h2>
                    <SeverityFilter active={severityFilter} onChange={setSeverityFilter} />
                  </div>
                  <div className="space-y-2">
                    {filteredVulns.length > 0 ? (
                      filteredVulns.map((vuln) => <VulnerabilityCard key={vuln.id} vuln={vuln} />)
                    ) : (
                      <p className="text-sm text-muted-foreground font-mono py-8 text-center">No findings match this filter.</p>
                    )}
                  </div>
                </motion.div>
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

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4">
        <p className="text-center text-xs text-muted-foreground font-mono">
          ⚠ Only scan websites you own or have explicit permission to test.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
