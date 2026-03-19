import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2, AlertTriangle, KeyRound, Mail } from "lucide-react";

const HistoryVerify = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"password" | "otp">("password");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const locked = attempts >= 5;

  const handlePasswordVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    // Mock: accept "password123" or any password for demo
    if (password === "password123" || password.length >= 6) {
      navigate("/history");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setError("Too many failed attempts. Account locked for 30 minutes.");
      } else {
        setError(`Verification failed. ${5 - newAttempts} attempts remaining.`);
      }
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setOtpSent(true);
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    const code = otpDigits.join("");
    if (code.length !== 6) return;
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    // Mock: accept "123456"
    if (code === "123456") {
      navigate("/history");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setError("Too many failed attempts. Account locked for 30 minutes.");
      } else {
        setError(`Verification failed. ${5 - newAttempts} attempts remaining.`);
      }
      setOtpDigits(["", "", "", "", "", ""]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-3">
          <Lock className="w-8 h-8 text-primary mx-auto" />
          <h1 className="text-xl font-display font-bold text-foreground">Identity Verification Required</h1>
          <p className="text-sm font-body text-muted-foreground">
            For your security, please verify your identity before accessing scan history.
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

        {/* Tabs */}
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setTab("password")}
            className={`flex-1 px-4 py-2.5 text-sm font-display font-medium transition-colors ${
              tab === "password" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Enter Password
          </button>
          <button
            onClick={() => setTab("otp")}
            className={`flex-1 px-4 py-2.5 text-sm font-display font-medium transition-colors ${
              tab === "otp" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Email OTP
          </button>
        </div>

        {/* Password Tab */}
        {tab === "password" && (
          <form onSubmit={handlePasswordVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-display font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={locked}
                className="w-full h-11 bg-input border border-border rounded-lg px-4 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password || locked}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Verify
            </button>
          </form>
        )}

        {/* OTP Tab */}
        {tab === "otp" && (
          <div className="space-y-4">
            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={loading || locked}
                className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send code to my email
              </button>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <p className="text-sm font-body text-muted-foreground text-center">
                  Enter the 6-digit code sent to your email
                </p>
                <div className="flex gap-2 justify-center">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={locked}
                      className="w-11 h-14 bg-input border border-border rounded-lg text-center text-xl font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading || otpDigits.join("").length !== 6 || locked}
                  className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Verify
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HistoryVerify;
