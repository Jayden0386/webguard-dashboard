import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const disclaimerPoints = [
  "I will only scan websites that I own or have explicit written permission to test.",
  "I understand that unauthorized scanning of systems is illegal under the Computer Fraud and Abuse Act and similar laws in my jurisdiction.",
  "I will not use WebGuard Scanner to perform denial-of-service attacks, data exfiltration, or any form of unauthorized access.",
  "I accept full responsibility for any scans I initiate and their consequences.",
  "I understand that my account will be permanently banned if I attempt to abuse this tool or attack WebGuard's infrastructure.",
  "I agree that all scan results are for educational and authorized security assessment purposes only.",
];

const Disclaimer = () => {
  const { acceptDisclaimer } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState<boolean[]>(new Array(disclaimerPoints.length).fill(false));

  const allChecked = checked.every(Boolean);

  const handleAccept = () => {
    acceptDisclaimer();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-8"
      >
        <div className="text-center space-y-3">
          <Shield className="w-8 h-8 text-success mx-auto" />
          <h1 className="text-2xl font-display font-semibold text-foreground">Ethical Use Agreement</h1>
          <p className="text-sm text-muted-foreground">
            You must accept the following terms before using WebGuard Scanner.
          </p>
        </div>

        <div className="surface-card p-5 space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">Required Agreement</span>
          </div>

          {disclaimerPoints.map((point, i) => (
            <label
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
            >
              <button
                type="button"
                onClick={() => {
                  const next = [...checked];
                  next[i] = !next[i];
                  setChecked(next);
                }}
                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  checked[i]
                    ? "bg-success border-success text-background"
                    : "border-border bg-background"
                }`}
              >
                {checked[i] && <Check className="w-3 h-3" />}
              </button>
              <span className="text-sm text-secondary-foreground leading-relaxed">{point}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleAccept}
          disabled={!allChecked}
          className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          I Accept — Continue to Login
        </button>
      </motion.div>
    </div>
  );
};

export default Disclaimer;
