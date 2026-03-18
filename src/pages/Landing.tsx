import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Scan, ArrowRight } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-success" />
            <span className="font-display font-bold text-xl text-foreground tracking-tight">WebGuard</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-medium text-foreground border border-border rounded-xl hover:bg-accent transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-center max-w-2xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-xs font-mono text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-success" />
            Authenticated Access Only
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-tight">
            Secure your
            <span className="text-gradient-primary"> perimeter.</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            WebGuard Scanner detects vulnerabilities in your web applications. 
            Surface-level and deep scans with actionable remediation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors text-base"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-3.5 border border-border text-foreground rounded-xl font-medium hover:bg-accent transition-colors text-base"
            >
              Sign In
            </Link>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-3 gap-4 pt-8 max-w-md mx-auto">
            {[
              { icon: Shield, label: "Header Analysis" },
              { icon: Scan, label: "Deep Scanning" },
              { icon: Lock, label: "Self-Hardened" },
            ].map((f) => (
              <div key={f.label} className="surface-card p-4 text-center space-y-2">
                <f.icon className="w-5 h-5 text-success mx-auto" />
                <p className="text-xs font-mono text-muted-foreground">{f.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground font-mono">
          ⚠ Only scan websites you own or have explicit permission to test.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
