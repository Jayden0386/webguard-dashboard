import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const disclaimerText = `ETHICAL USE DISCLAIMER

This tool is provided strictly for educational and authorized security testing purposes.

By using WebGuard Scanner, you agree to the following terms:

1. AUTHORIZED USE ONLY
You may only scan websites that you own or have explicit written permission to test. Unauthorized scanning of systems you do not own or have permission to test is illegal and unethical.

2. LEGAL COMPLIANCE
Unauthorized computer access, port scanning, and vulnerability testing without permission violates laws including the Computer Fraud and Abuse Act (CFAA), the UK Computer Misuse Act, and similar legislation in other jurisdictions. Penalties may include fines and imprisonment.

3. EDUCATIONAL PURPOSE
This tool is designed for educational use in cybersecurity coursework, authorized penetration testing practice, and personal security assessments of your own infrastructure.

4. USER RESPONSIBILITY
You accept full responsibility for any scans you initiate and their consequences. WebGuard Scanner and its developers are not liable for any misuse of this tool.

5. ZERO TOLERANCE FOR ABUSE
Any attempt to use this tool for malicious purposes, including but not limited to:
  - Scanning systems without authorization
  - Attempting to exploit discovered vulnerabilities
  - Using scan results to attack third-party systems
  - Attempting to compromise WebGuard's own infrastructure

...will result in immediate and permanent account suspension, IP blacklisting, and may be reported to relevant authorities.

6. DATA HANDLING
Scan results are stored securely and associated with your account. You are responsible for the confidentiality of any vulnerability data obtained through this tool.`;

const Disclaimer = () => {
  const { acceptDisclaimer } = useAuth();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    acceptDisclaimer();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6"
      >
        <div className="text-center space-y-3">
          <Shield className="w-8 h-8 text-success mx-auto" />
          <h1 className="text-2xl font-display font-bold text-foreground">Ethical Use Disclaimer</h1>
          <p className="text-sm font-body text-muted-foreground">
            You must accept the following terms before using WebGuard Scanner.
          </p>
        </div>

        <div className="surface-card p-1">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-display font-medium text-warning">Required Agreement</span>
          </div>
          <div className="max-h-72 overflow-y-auto px-4 pb-4">
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {disclaimerText}
            </pre>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-accent/30 transition-colors">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              agreed
                ? "bg-success border-success text-background"
                : "border-border bg-input"
            }`}
          >
            {agreed && <Check className="w-3 h-3" />}
          </button>
          <span className="text-sm font-body text-foreground leading-relaxed">
            I have read and agree to the ethical use terms
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!agreed}
          className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue to Login
        </button>
      </motion.div>
    </div>
  );
};

export default Disclaimer;
