import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Code, Database, Cookie, Eye } from "lucide-react";
import { FeaturePills } from "@/components/FeaturePills";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-success" />
            <span className="font-display font-bold text-lg text-foreground">WebGuard</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px] font-mono">v1.0</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-body font-medium text-foreground border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-body font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
            Audit your perimeter.
          </h1>

          <p className="text-lg font-body text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Scan any URL for security vulnerabilities. Get actionable remediation in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="px-8 py-3 border border-border text-foreground rounded-lg font-body font-medium hover:bg-accent transition-colors text-base"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:bg-primary/90 transition-colors text-base"
            >
              Register
            </Link>
          </div>

          <div className="pt-4">
            <FeaturePills />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground font-mono">
          WebGuard Scanner — For educational use only
        </p>
      </footer>
    </div>
  );
};

export default Landing;
