import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2, AlertTriangle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const OwnerVerify2fa = () => {
  const { verifyOwner2fa, isOwner, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!isAuthenticated || !isOwner) {
    navigate("/login", { replace: true });
    return null;
  }

  // Countdown timer
  useState(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) return;
    setError("");
    setLoading(true);

    const success = await verifyOwner2fa(code);
    setLoading(false);

    if (success) {
      navigate("/owner/dashboard");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setError("Too many attempts. Access locked for 1 hour.");
      } else {
        setError(`Invalid code. ${3 - newAttempts} attempt(s) remaining.`);
      }
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-mono font-bold uppercase tracking-widest">
            Owner Access
          </span>
          <Shield className="w-8 h-8 text-primary mx-auto" />
          <h1 className="text-xl font-display font-bold text-foreground">Two-Factor Authentication Required</h1>
          <p className="text-sm font-body text-muted-foreground">
            Open your authenticator app and enter the 6-digit code.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive font-body"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 justify-center">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={attempts >= 3}
                className="w-12 h-14 bg-input border border-border rounded-lg text-center text-2xl font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all disabled:opacity-50"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || digits.join("").length !== 6 || attempts >= 3}
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
          <Clock className="w-3.5 h-3.5" />
          Code expires in: 0:{countdown.toString().padStart(2, "0")}
        </div>
      </motion.div>
    </div>
  );
};

export default OwnerVerify2fa;
