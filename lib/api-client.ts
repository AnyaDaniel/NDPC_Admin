export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown };
  timestamp?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://trixlearn-backend.net-trixsolutions.com/api/v1";

const TOKEN_KEY = "ndpc_admin_access_token";
const REFRESH_TOKEN_KEY = "ndpc_admin_refresh_token";
const USER_KEY = "ndpc_admin_user";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminSession(params: { accessToken: string; refreshToken?: string; user?: unknown }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, params.accessToken);
  if (params.refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, params.refreshToken);
  if (params.user) window.localStorage.setItem(USER_KEY, JSON.stringify(params.user));
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

function notifyAuthExpired() {
  if (typeof window === "undefined") return;
  clearAdminSession();
  window.dispatchEvent(new CustomEvent("ndpc-admin-auth-expired"));
}

function shouldClearSessionFor401(path: string, sentBearerToken: boolean, code?: string) {
  if (!sentBearerToken || path.startsWith("/auth/")) return false;
  return !code || code === "UNAUTHORIZED" || code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN";
}

export function getAdminUser<T = unknown>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function buildHeaders(headers?: HeadersInit, body?: BodyInit | null) {
  const out = new Headers(headers);
  const token = getAccessToken();
  if (token) out.set("Authorization", `Bearer ${token}`);
  if (body && !(body instanceof FormData) && !out.has("Content-Type")) {
    out.set("Content-Type", "application/json");
  }
  return out;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = buildHeaders(init.headers, init.body);
  const sentBearerToken = headers.has("Authorization");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  let envelope: ApiEnvelope<T> | null = null;
  if (text) {
    try { envelope = JSON.parse(text) as ApiEnvelope<T>; } catch { envelope = null; }
  }

  if (!response.ok || envelope?.success === false) {
    const message = envelope?.error?.message || envelope?.message || response.statusText || "Request failed";
    if (response.status === 401 && shouldClearSessionFor401(path, sentBearerToken, envelope?.error?.code)) {
      notifyAuthExpired();
    }
    throw new ApiError(message, response.status, envelope?.error?.code, envelope?.error?.details);
  }

  return (envelope && "data" in envelope ? envelope.data : envelope) as T;
}

export function toQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") q.set(key, String(value));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}
