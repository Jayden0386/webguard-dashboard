import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Ban, AlertTriangle, Activity, LogOut, ShieldOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/owner/dashboard", label: "Overview", icon: Activity },
  { to: "/owner/users", label: "Users", icon: Users },
  { to: "/owner/bans", label: "Bans", icon: Ban },
  { to: "/owner/incidents", label: "Incidents", icon: AlertTriangle },
];

const MOCK_BANS = [
  { id: "b1", username: "test_user3", email: "test3@example.com", ip: "45.33.21.8", reason: "SQL Injection attempt", attackType: "sqli", bannedAt: "2025-03-18 14:23:00", bannedBy: "auto" },
  { id: "b2", username: "hacker_01", email: "h01@mail.com", ip: "103.55.12.4", reason: "Brute force — 10+ failed logins", attackType: "brute_force", bannedAt: "2025-03-17 09:11:00", bannedBy: "auto" },
  { id: "b3", username: "scan_bot", email: "bot@spam.net", ip: "78.22.44.99", reason: "SSRF — internal IP scan attempt", attackType: "ssrf", bannedAt: "2025-03-16 22:05:00", bannedBy: "auto" },
];

const MOCK_BANNED_IPS = [
  { ip: "45.33.21.8", reason: "Associated with banned user test_user3", bannedAt: "2025-03-18 14:23:00" },
  { ip: "103.55.12.4", reason: "Brute force origin", bannedAt: "2025-03-17 09:11:00" },
  { ip: "78.22.44.99", reason: "SSRF attack origin", bannedAt: "2025-03-16 22:05:00" },
  { ip: "192.168.1.100", reason: "Automated scraping detected", bannedAt: "2025-03-15 18:30:00" },
];

const OwnerBans = () => {
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

        <div className="space-y-8">
          {/* Banned Users */}
          <div className="space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <Ban className="w-5 h-5 text-destructive" />
              Banned Accounts ({MOCK_BANS.length})
            </h2>
            <div className="space-y-3">
              {MOCK_BANS.map((ban) => (
                <div key={ban.id} className="surface-card p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground font-mono">{ban.username}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ban.email} • IP {ban.ip}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-mono font-medium">
                      {ban.attackType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      <span className="text-destructive font-medium">Reason:</span> {ban.reason}
                    </span>
                    <span className="text-muted-foreground font-mono">{ban.bannedAt} • by {ban.bannedBy}</span>
                  </div>
                  <button className="text-xs text-warning hover:text-warning/80 font-medium transition-colors flex items-center gap-1.5">
                    <ShieldOff className="w-3.5 h-3.5" />
                    Lift Ban (requires 2FA re-verification)
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Banned IPs */}
          <div className="space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              Blacklisted IPs ({MOCK_BANNED_IPS.length})
            </h2>
            <div className="surface-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">IP Address</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Reason</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Banned At</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_BANNED_IPS.map((ip) => (
                    <tr key={ip.ip} className="border-b border-border last:border-0">
                      <td className="p-4 font-mono text-foreground">{ip.ip}</td>
                      <td className="p-4 text-muted-foreground">{ip.reason}</td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{ip.bannedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerBans;
