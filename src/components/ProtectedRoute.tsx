import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.disclaimerAccepted) return <Navigate to="/disclaimer" replace />;

  return <>{children}</>;
}

export function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOwner, owner2faVerified } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOwner) return <Navigate to="/dashboard" replace />;
  if (!owner2faVerified) return <Navigate to="/owner/verify-2fa" replace />;

  return <>{children}</>;
}

export function DisclaimerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.disclaimerAccepted) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
