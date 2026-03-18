import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, OwnerRoute, DisclaimerRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Disclaimer from "./pages/Disclaimer";
import Dashboard from "./pages/Dashboard";
import OwnerVerify2fa from "./pages/OwnerVerify2fa";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerUsers from "./pages/owner/OwnerUsers";
import OwnerBans from "./pages/owner/OwnerBans";
import OwnerIncidents from "./pages/owner/OwnerIncidents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Disclaimer (auth required, but disclaimer NOT yet accepted) */}
            <Route path="/disclaimer" element={<DisclaimerRoute><Disclaimer /></DisclaimerRoute>} />

            {/* Protected routes (auth + disclaimer required) */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Owner 2FA verification */}
            <Route path="/owner/verify-2fa" element={<OwnerVerify2fa />} />

            {/* Owner-only routes (auth + owner role + 2FA verified) */}
            <Route path="/owner/dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
            <Route path="/owner/users" element={<OwnerRoute><OwnerUsers /></OwnerRoute>} />
            <Route path="/owner/bans" element={<OwnerRoute><OwnerBans /></OwnerRoute>} />
            <Route path="/owner/incidents" element={<OwnerRoute><OwnerIncidents /></OwnerRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
