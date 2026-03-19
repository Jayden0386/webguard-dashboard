import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Users, Ban, AlertTriangle, Activity, LogOut, Search, UserCheck, UserX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const navItems = [
  { to: "/owner/dashboard", label: "Overview", icon: Activity },
  { to: "/owner/users", label: "Users", icon: Users },
  { to: "/owner/bans", label: "Bans", icon: Ban },
  { to: "/owner/incidents", label: "Incidents", icon: AlertTriangle },
];

const MOCK_USERS = [
  { id: "u1", username: "jane_doe", email: "jane@example.com", role: "user", status: "active", scans: 34, joined: "2024-11-15" },
  { id: "u2", username: "mark_smith", email: "mark@example.com", role: "user", status: "active", scans: 12, joined: "2024-12-01" },
  { id: "u3", username: "alice_w", email: "alice@example.com", role: "user", status: "active", scans: 67, joined: "2024-10-20" },
  { id: "u4", username: "test_user3", email: "test3@example.com", role: "user", status: "banned", scans: 2, joined: "2025-01-05" },
  { id: "u5", username: "bob_cyber", email: "bob@example.com", role: "user", status: "active", scans: 8, joined: "2025-02-10" },
];

const OwnerUsers = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  const filtered = MOCK_USERS.filter(
    (u) => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-destructive" />
            <span className="font-display font-bold text-foreground">WebGuard</span>
            <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[10px] font-mono font-bold uppercase">Owner Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Scanner</button>
            <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-1 mb-8 overflow-x-auto">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-medium transition-colors ${location.pathname === item.to ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/30"}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-foreground">User Management</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="h-9 bg-input border border-border rounded-lg pl-9 pr-4 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-display text-muted-foreground uppercase">Username</th>
                  <th className="text-left p-4 text-xs font-display text-muted-foreground uppercase">Email</th>
                  <th className="text-left p-4 text-xs font-display text-muted-foreground uppercase">Status</th>
                  <th className="text-left p-4 text-xs font-display text-muted-foreground uppercase">Scans</th>
                  <th className="text-left p-4 text-xs font-display text-muted-foreground uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                    <td className="p-4 font-mono text-foreground">{u.username}</td>
                    <td className="p-4 font-body text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono ${u.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {u.status === "active" ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">{u.scans}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerUsers;
