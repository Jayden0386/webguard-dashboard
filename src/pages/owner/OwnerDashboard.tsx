import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Users, Ban, AlertTriangle, Activity, LogOut, 
  ChevronRight, Clock, UserCheck, UserX, Scan
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for the owner dashboard
const MOCK_STATS = {
  totalUsers: 47,
  activeUsers: 31,
  bannedUsers: 3,
  totalScans: 892,
  scansToday: 24,
  incidents: 7,
  unresolvedIncidents: 2,
};

const MOCK_RECENT_ACTIVITY = [
  { id: 1, type: "scan", message: "user_jane scanned example.com", time: "2 min ago" },
  { id: 2, type: "ban", message: "Auto-ban triggered: SQLi attempt by user_test3", time: "15 min ago" },
  { id: 3, type: "login", message: "user_mark logged in", time: "22 min ago" },
  { id: 4, type: "scan", message: "user_alice scanned mysite.org", time: "35 min ago" },
  { id: 5, type: "incident", message: "SSRF attempt detected from 192.168.1.100", time: "1 hr ago" },
];

const navItems = [
  { to: "/owner/dashboard", label: "Overview", icon: Activity },
  { to: "/owner/users", label: "Users", icon: Users },
  { to: "/owner/bans", label: "Bans", icon: Ban },
  { to: "/owner/incidents", label: "Incidents", icon: AlertTriangle },
];

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-warning" />
            <span className="font-display font-semibold text-foreground">WebGuard</span>
            <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning text-xs font-mono font-medium">
              OWNER
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Scanner
            </button>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            { label: "Active Now", value: MOCK_STATS.activeUsers, icon: UserCheck, color: "text-success" },
            { label: "Banned", value: MOCK_STATS.bannedUsers, icon: UserX, color: "text-destructive" },
            { label: "Total Scans", value: MOCK_STATS.totalScans, icon: Scan, color: "text-info" },
          ].map((stat) => (
            <div key={stat.label} className="surface-card p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <div className="surface-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Alerts</h2>
              <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-mono">
                {MOCK_STATS.unresolvedIncidents} unresolved
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium">SQL Injection attempt detected</p>
                  <p className="text-xs text-muted-foreground mt-1">user_test3 • IP 45.33.21.8 • 15 min ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/10">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium">Brute force attempt — 8 failed logins</p>
                  <p className="text-xs text-muted-foreground mt-1">unknown • IP 192.168.1.100 • 1 hr ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="surface-card p-5 space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</h2>
            <div className="space-y-1">
              {MOCK_RECENT_ACTIVITY.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <span className="text-sm text-secondary-foreground">{a.message}</span>
                  <span className="text-xs text-muted-foreground font-mono shrink-0 ml-3">{a.time}</span>
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
