import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "owner";
  disclaimerAccepted: boolean;
  banned: boolean;
  createdAt: string;
  scanCount: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  owner2faVerified: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; requiresOtp?: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  acceptDisclaimer: () => void;
  verifyOwner2fa: (code: string) => Promise<boolean>;
  failedLoginAttempts: number;
  lockoutUntil: number | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simulated user store (keyed by username)
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "webguard_owner": {
    password: "Owner@2024!",
    user: {
      id: "owner-001",
      username: "webguard_owner",
      email: "admin@webguard.local",
      role: "owner",
      disclaimerAccepted: true,
      banned: false,
      createdAt: "2024-01-01T00:00:00Z",
      scanCount: 142,
    },
  },
};

const BANNED_USERNAMES = new Set<string>();
const OWNER_TOTP_CODE = "123456";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [owner2faVerified, setOwner2faVerified] = useState(false);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const mins = Math.ceil((lockoutUntil - Date.now()) / 60000);
      return { success: false, error: `Account temporarily locked. Try again in ${mins} minute(s).` };
    }

    if (BANNED_USERNAMES.has(username)) {
      return { success: false, error: "Your account has been suspended. Contact support if you believe this is an error." };
    }

    await new Promise((r) => setTimeout(r, 500));

    const record = MOCK_USERS[username];
    if (!record || record.password !== password) {
      const attempts = failedLoginAttempts + 1;
      setFailedLoginAttempts(attempts);

      if (attempts >= 10) {
        BANNED_USERNAMES.add(username);
        return { success: false, error: "Your account has been suspended. Contact support if you believe this is an error." };
      }
      if (attempts >= 5) {
        setLockoutUntil(Date.now() + 15 * 60 * 1000);
        return { success: false, error: "Account temporarily locked. Try again in 15 minutes." };
      }
      return { success: false, error: "Invalid credentials" };
    }

    setFailedLoginAttempts(0);
    setLockoutUntil(null);

    if (record.user.role === "owner") {
      setUser(record.user);
      return { success: true, requiresOtp: true };
    }

    setUser(record.user);
    return { success: true };
  }, [failedLoginAttempts, lockoutUntil]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    if (BANNED_USERNAMES.has(username)) {
      return { success: false, error: "Registration is not available." };
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return { success: false, error: "Password must be 8+ chars with uppercase, number, and special character." };
    }

    if (MOCK_USERS[username]) {
      return { success: false, error: "This username is already taken." };
    }

    if (username.toLowerCase() === "webguard_owner" || username.toLowerCase() === "admin") {
      return { success: false, error: "This username is not available." };
    }

    await new Promise((r) => setTimeout(r, 500));

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      role: "user",
      disclaimerAccepted: false,
      banned: false,
      createdAt: new Date().toISOString(),
      scanCount: 0,
    };

    MOCK_USERS[username] = { password, user: newUser };
    setUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setOwner2faVerified(false);
  }, []);

  const acceptDisclaimer = useCallback(() => {
    if (user) {
      const updated = { ...user, disclaimerAccepted: true };
      setUser(updated);
      if (MOCK_USERS[user.username]) {
        MOCK_USERS[user.username].user = updated;
      }
    }
  }, [user]);

  const verifyOwner2fa = useCallback(async (code: string) => {
    await new Promise((r) => setTimeout(r, 300));
    if (code === OWNER_TOTP_CODE) {
      setOwner2faVerified(true);
      return true;
    }
    return false;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isOwner: user?.role === "owner",
        owner2faVerified,
        login,
        register,
        logout,
        acceptDisclaimer,
        verifyOwner2fa,
        failedLoginAttempts,
        lockoutUntil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
