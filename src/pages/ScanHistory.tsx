import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowLeft, Clock, FileDown, Trash2, CheckCircle, Eye } from "lucide-react";
import { type ScanResult, type Vulnerability } from "@/lib/scanner-types";
import { SeverityBadge } from "@/components/SeverityBadge";

// Mock scan history
const MOCK_HISTORY: (ScanResult & { id: string; date: string })[] = [
  {
    id: "scan-1",
    date: "2025-03-19 10:23:45",
    url: "https://example.com",
    score: 72,
    totalChecks: 23,
    passedChecks: 17,
    failedChecks: 6,
    scanTime: 12.4,
    vulnerabilities: [
      { id: "hdr-csp", title: "Missing Content-Security-Policy Header", severity: "high", category: "headers", description: "No CSP header set.", evidence: "❌ Content-Security-Policy: (not set)", remediation: "Add CSP header." },
      { id: "cookie-flags", title: "Insecure Cookie Configuration", severity: "medium", category: "headers", description: "Session cookies missing flags.", evidence: "Set-Cookie: session=abc123; Path=/", remediation: "Add Secure; HttpOnly; SameSite=Strict" },
    ],
  },
  {
    id: "scan-2",
    date: "2025-03-18 15:11:02",
    url: "https://mysite.org",
    score: 45,
    totalChecks: 23,
    passedChecks: 10,
    failedChecks: 13,
    scanTime: 18.7,
    vulnerabilities: [
      { id: "xss-reflect", title: "Potential Reflected XSS", severity: "critical", category: "xss", description: "User input reflected.", evidence: "GET /?q=<script>alert(1)</script>", remediation: "Implement output encoding." },
      { id: "sqli-param", title: "SQL Injection Pattern", severity: "critical", category: "sqli", description: "SQL injection detected.", evidence: "GET /products?id=1' OR '1'='1", remediation: "Use parameterized queries." },
      { id: "hdr-hsts", title: "Missing HSTS Header", severity: "high", category: "headers", description: "No HSTS.", evidence: "❌ Strict-Transport-Security: (not set)", remediation: "Add HSTS header." },
    ],
  },
  {
    id: "scan-3",
    date: "2025-03-17 09:05:30",
    url: "https://testapp.dev",
    score: 91,
    totalChecks: 23,
    passedChecks: 21,
    failedChecks: 2,
    scanTime: 8.2,
    vulnerabilities: [
      { id: "hdr-referrer", title: "Missing Referrer-Policy", severity: "low", category: "headers", description: "No Referrer-Policy.", evidence: "❌ Referrer-Policy: (not set)", remediation: "Add Referrer-Policy header." },
    ],
  },
];

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (host.length > 8) {
      return `${u.protocol}//${host.slice(0, 4)}***${host.slice(-4)}`;
    }
    return url;
  } catch {
    return url;
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 65) return "text-info";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

const ScanHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/history/verify");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleDelete = (id: string) => {
    setHistory((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-display font-bold text-foreground">Your Scan History</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-mono">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          </div>
          <div className={`flex items-center gap-2 text-sm font-mono ${timeLeft < 120 ? "text-destructive" : "text-muted-foreground"}`}>
            <Clock className="w-4 h-4" />
            Session expires in: {formatTime(timeLeft)}
          </div>
        </div>

        {/* History list */}
        {history.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-4">
            <Shield className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground font-body">No scans yet. Go to dashboard to run your first scan.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-body font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((scan) => (
              <motion.div key={scan.id} layout className="surface-card p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-mono">{scan.date}</p>
                    <p className="text-sm font-mono text-foreground truncate">{maskUrl(scan.url)}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Mini score */}
                    <div className="text-center">
                      <p className={`text-2xl font-display font-bold ${getScoreColor(scan.score)}`}>{scan.score}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">SCORE</p>
                    </div>
                  </div>
                </div>

                {/* Severity pills */}
                <div className="flex flex-wrap gap-2">
                  {(["critical", "high", "medium", "low", "info"] as const).map((sev) => {
                    const count = scan.vulnerabilities.filter((v) => v.severity === sev).length;
                    if (count === 0) return null;
                    return <SeverityBadge key={sev} severity={sev} />;
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setExpandedId(expandedId === scan.id ? null : scan.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-body text-foreground hover:bg-accent transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {expandedId === scan.id ? "Hide Report" : "View Full Report"}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-body text-foreground hover:bg-accent transition-colors">
                    <FileDown className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(scan.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-destructive/20 rounded-lg text-xs font-body text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>

                {/* Expanded report */}
                <AnimatePresence>
                  {expandedId === scan.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border pt-4 space-y-3">
                        {scan.vulnerabilities.map((vuln) => (
                          <div key={vuln.id} className="p-3 bg-background rounded-lg border border-border space-y-2">
                            <div className="flex items-center gap-2">
                              <SeverityBadge severity={vuln.severity} />
                              <span className="text-sm font-body text-foreground font-medium">{vuln.title}</span>
                            </div>
                            <p className="text-xs font-body text-muted-foreground">{vuln.description}</p>
                            <div>
                              <p className="text-[10px] font-display text-muted-foreground uppercase tracking-wider mb-1">Recommended Fix</p>
                              <pre className="text-xs font-mono bg-card p-2 rounded border border-border text-secondary-foreground">{vuln.remediation}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-body text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 px-6"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="surface-elevated p-6 max-w-sm w-full space-y-4"
            >
              <h2 className="font-display font-bold text-foreground">Delete Scan?</h2>
              <p className="text-sm font-body text-muted-foreground">This action cannot be undone. The scan record will be permanently deleted.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-body text-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-body font-medium hover:bg-destructive/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScanHistory;
