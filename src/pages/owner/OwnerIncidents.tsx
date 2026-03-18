import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Ban, AlertTriangle, Activity, LogOut, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/owner/dashboard", label: "Overview", icon: Activity },
  { to: "/owner/users", label: "Users", icon: Users },
  { to: "/owner/bans", label: "Bans", icon: Ban },
  { to: "/owner/incidents", label: "Incidents", icon: AlertTriangle },
];

const MOCK_INCIDENTS = [
  { id: "inc-1", userId: "test_user3", ip: "45.33.21.8", attackType: "SQL Injection", path: "/dashboard?q=' OR 1=1--", data: "query param: ' OR 1=1--", detectedAt: "2025-03-18 14:22:58", resolved: true },
  { id: "inc-2", userId: "unknown", ip: "103.55.12.4", attackType: "Brute Force", path: "/login", data: "10 failed login attempts in 2 minutes", detectedAt: "2025-03-17 09:10:44", resolved: true },
  { id: "inc-3", userId: "scan_bot", ip: "78.22.44.99", attackType: "SSRF", path: "/dashboard", data: "scan target: http://127.0.0.1:8080/admin", detectedAt: "2025-03-16 22:04:32", resolved: true },
  { id: "inc-4", userId: "unknown", ip: "192.168.1.100", attackType: "Route Probing", path: "/.env", data: "GET /.env → 403", detectedAt: "2025-03-15 18:30:11", resolved: false },
  { id: "inc-5", userId: "unknown", ip: "192.168.1.100", attackType: "Route Probing", path: "/.git/config", data: "GET /.git/config → 403", detectedAt: "2025-03-15 18:30:15", resolved: false },
  { id: "inc-6", userId: "user_test9", ip: "88.12.33.7", attackType: "Session Tampering", path: "/dashboard", data: "Invalid session signature detected", detectedAt: "2025-03-14 11:05:22", resolved: true },
  { id: "inc-7", userId: "user_test9", ip: "88.12.33.7", attackType: "IDOR", path: "/history/124", data: "Attempted access to another user's scan history", detectedAt: "2025-03-14 11:06:01", resolved: true },
];

const OwnerIncidents = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-warning" />
            <span className="font-display font-semibold text-foreground">WebGuard</span>
            <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning text-xs font-mono font-medium">OWNER</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Scanner</button>
            <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-1 mb-8 overflow-x-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.to ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/30"}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Security Incidents ({MOCK_INCIDENTS.length})
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {MOCK_INCIDENTS.filter((i) => !i.resolved).length} unresolved
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_INCIDENTS.map((inc) => (
              <div key={inc.id} className={`surface-card p-5 border-l-2 ${inc.resolved ? "border-l-success" : "border-l-destructive"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-mono font-medium">
                        {inc.attackType}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {inc.userId} • {inc.ip}
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-mono">{inc.path}</p>
                    <p className="text-xs text-muted-foreground">{inc.data}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {inc.resolved ? (
                      <span className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle className="w-3.5 h-3.5" /> Resolved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <XCircle className="w-3.5 h-3.5" /> Unresolved
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground font-mono">{inc.detectedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerIncidents;
