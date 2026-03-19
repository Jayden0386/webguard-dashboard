import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Loader2, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const passwordRules = [
  { test: (p: string) => p.length >= 8, label: "Min 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "Uppercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "Number" },
  { test: (p: string) => /[!@#$%^&*]/.test(p), label: "Special character" },
];

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  const passed = passwordRules.filter((r) => r.test(password)).length;
  if (passed <= 1) return { label: "Weak", color: "bg-destructive", width: "w-1/4" };
  if (passed <= 2) return { label: "Fair", color: "bg-warning", width: "w-1/2" };
  if (passed <= 3) return { label: "Medium", color: "bg-info", width: "w-3/4" };
  return { label: "Strong", color: "bg-success", width: "w-full" };
}

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = "Valid email is required";
    if (!username.trim() || username.length < 3) errors.username = "Username must be at least 3 characters";
    if (!passwordRules.every((r) => r.test(password))) errors.password = "Password does not meet requirements";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);

    const result = await register(username, email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Registration failed.");
      return;
    }

    navigate("/disclaimer");
  };

  const inputClass = (field: string) =>
    `w-full h-11 bg-input border rounded-lg px-4 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${
      fieldErrors[field] ? "border-destructive" : "border-border"
    }`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <Shield className="w-6 h-6 text-success" />
            <span className="font-display font-bold text-xl text-foreground">WebGuard</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">Create account</h1>
          <p className="text-sm font-body text-muted-foreground">Register to access WebGuard Scanner.</p>
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
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-display font-medium text-foreground">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass("fullName")} placeholder="John Doe" />
            {fieldErrors.fullName && <p className="text-xs text-destructive font-body">{fieldErrors.fullName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-display font-medium text-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass("email")} placeholder="you@example.com" />
            {fieldErrors.email && <p className="text-xs text-destructive font-body">{fieldErrors.email}</p>}
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-sm font-display font-medium text-foreground">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass("username")} placeholder="johndoe" />
            {fieldErrors.username && <p className="text-xs text-destructive font-body">{fieldErrors.username}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-display font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass("password")} pr-11`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {password && (
              <div className="space-y-1.5">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
                </div>
                <p className="text-xs text-muted-foreground font-mono">{strength.label}</p>
              </div>
            )}

            {/* Requirements */}
            <div className="grid grid-cols-2 gap-1 pt-1">
              {passwordRules.map((rule) => (
                <div key={rule.label} className={`flex items-center gap-1.5 text-xs font-body ${rule.test(password) ? "text-success" : "text-muted-foreground"}`}>
                  <Check className="w-3 h-3" />
                  {rule.label}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-display font-medium text-foreground">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass("confirmPassword")} placeholder="••••••••" />
            {fieldErrors.confirmPassword && <p className="text-xs text-destructive font-body">{fieldErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm font-body text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
