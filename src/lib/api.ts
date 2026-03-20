import { type ScanResult } from "./scanner-types";

const API_BASE = const API_BASE = "https://tobie-glucosic-subfrontally.ngrok-free.dev/api";

// Helper for API calls with error handling
async function apiCall<T>(url: string, options?: RequestInit): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || `Error ${res.status}` };
    return { data: json };
  } catch {
    // Backend not connected — return error so UI can fall back to mock
    return { error: "Backend not connected" };
  }
}

// Auth
export const api = {
  login: (username: string, password: string) =>
    apiCall("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  register: (name: string, email: string, username: string, password: string) =>
    apiCall("/auth/register", { method: "POST", body: JSON.stringify({ name, email, username, password }) }),

  logout: () => apiCall("/auth/logout", { method: "POST" }),

  // Scanning
  scan: (url: string) =>
    apiCall<ScanResult>("/scan", { method: "POST", body: JSON.stringify({ url }) }),

  // History
  verifyHistoryPassword: (password: string) =>
    apiCall("/history/verify-password", { method: "POST", body: JSON.stringify({ password }) }),

  verifyHistoryOtp: (code: string) =>
    apiCall("/history/verify-otp", { method: "POST", body: JSON.stringify({ code }) }),

  sendHistoryOtp: () =>
    apiCall("/history/send-otp", { method: "POST" }),

  getHistory: () =>
    apiCall<ScanResult[]>("/history"),

  deleteHistory: (id: string) =>
    apiCall(`/history/${id}`, { method: "DELETE" }),

  // Owner
  verifyOwner2fa: (code: string) =>
    apiCall("/owner/verify-2fa", { method: "POST", body: JSON.stringify({ code }) }),

  getOwnerStats: () =>
    apiCall("/owner/stats"),
};
