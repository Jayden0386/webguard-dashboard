import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Users, Ban, AlertTriangle, Activity, LogOut,
  UserCheck, UserX, Scan, Eye, Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MOCK_STATS = {
  totalUsers: 47,
  scansToday: 24,
  activeSessions: 12,
  incidents: 7,
};

const navItems = [
  { to: "/owner/dashboard", label: "Overview", icon: Activity },
  { to: "/owner/users", label: "Users", icon: Users },
  { to: "/owner/bans", label: "Bans", icon: Ban },
  { to: "/owner/incidents", label: "Incidents", icon: AlertTriangle },
];

const MOCK_RECENT_INCIDENTS = [
  { id: 1, timestamp: "2025-03-18 14:23", username: "test_user3", ip: "45.33.21.8", attackType: "SQL Injection", status: "auto-banned" },
  { id: 2, timestamp: "2025-03-17 09:11", username: "unknown", ip: "103.55.12.4", attackType: "Brute Force", status: "auto-banned" },
  { id: 3, timestamp: "2025-03-16 22:05", username: "scan_bot", ip: "78.22.44.99", attackType: "SSRF", status: "auto-banned" },
  { id: 4, timestamp: "2025-03-15 18:30", username: "unknown", ip: "192.168.1.100", attackType: "Route Probing", status: "unresolved" },
];

const MOCK_RECENT_USERS = [
  { username: "bob_cyber", email: "bob@example.com", joined: "2025-02-10" },
  { username: "alice_w", email: "alice@example.com", joined: "2025-01-20" },
  { username: "mark_smith", email: "mark@example.com", joined: "2024-12-01" },
];

const OwnerDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-destructive" />
            <span className="font-display font-bold text-foreground">WebGuard</span>
            <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[10px] font-mono font-bold uppercase">
              Owner Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
              Scanner
            </button>
            <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-6 py-6">
        {/* Nav tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-medium transition-colors ${
                location.pathname === item.to
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total Users", value: MOCK_STATS.totalUsers, icon: Users, color: "text-primary" },
            { label: "Total Scans Today", value: MOCK_STATS.scansToday, icon: Scan, color: "text-success" },
            { label: "Active Sessions", value: MOCK_STATS.activeSessions, icon: Activity, color: "text-info" },
            { label: "Security Incidents", value: MOCK_STATS.incidents, icon: AlertTriangle, color: "text-destructive" },
          ].map((stat) => (
            <div key={stat.label} className="surface-card p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-body text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "View Users", icon: Users, to: "/owner/users" },
            { label: "View Bans", icon: Ban, to: "/owner/bans" },
            { label: "View Incidents", icon: Eye, to: "/owner/incidents" },
            { label: "App Settings", icon: Settings, to: "#" },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="surface-card p-4 flex items-center gap-3 hover:bg-accent/30 transition-colors"
            >
              <action.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-body text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent incidents */}
          <div className="surface-card p-5 space-y-4">
            <h2 className="text-sm font-display font-medium text-muted-foreground uppercase tracking-wider">Recent Security Incidents</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-2 text-xs font-display text-muted-foreground uppercase">Time</th>
                    <th className="text-left pb-2 text-xs font-display text-muted-foreground uppercase">User</th>
                    <th className="text-left pb-2 text-xs font-display text-muted-foreground uppercase">IP</th>
                    <th className="text-left pb-2 text-xs font-display text-muted-foreground uppercase">Type</th>
                    <th className="text-left pb-2 text-xs font-display text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RECENT_INCIDENTS.map((inc) => (
                    <tr key={inc.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 text-xs font-mono text-muted-foreground">{inc.timestamp}</td>
                      <td className="py-2.5 text-xs font-mono text-foreground">{inc.username}</td>
                      <td className="py-2.5 text-xs font-mono text-muted-foreground">{inc.ip}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-mono">
                          {inc.attackType}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs font-mono ${inc.status === "unresolved" ? "text-destructive" : "text-success"}`}>
                          {inc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent registrations */}
          <div className="surface-card p-5 space-y-4">
            <h2 className="text-sm font-display font-medium text-muted-foreground uppercase tracking-wider">Recent Registrations</h2>
            <div className="space-y-2">
              {MOCK_RECENT_USERS.map((u) => (
                <div key={u.username} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-mono text-foreground">{u.username}</p>
                    <p className="text-xs font-body text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{u.joined}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
