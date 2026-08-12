/**
 * Stayly API Client
 *
 * Thin fetch wrapper that:
 * - Prefixes all requests with NEXT_PUBLIC_API_URL
 * - Sets Content-Type: application/json
 * - Attaches Authorization: Bearer <token> if logged in
 * - Throws a typed ApiError on non-2xx responses
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Token Management ──────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // Zustand persist middleware stores under this key
    const stored = localStorage.getItem("stayly-store");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function setToken(token: string): void {
  // Token is managed by the Zustand store — this is a convenience
  // for cases where we need to set it outside the store
  if (typeof window === "undefined") return;
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
}

// ─── API Error ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// ─── Fetch Wrapper ─────────────────────────────────────────────────────────

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  // Attach auth token if available
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle no-content responses (e.g., 204 for DELETE)
  if (response.status === 204) {
    return undefined as T;
  }

  // Parse JSON response
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(response.status, `Request failed with status ${response.status}`);
    }
    return undefined as T;
  }

  // Throw on non-2xx with parsed error detail
  if (!response.ok) {
    const detail =
      (data as { detail?: string })?.detail ||
      (typeof data === "string" ? data : `Request failed with status ${response.status}`);
    throw new ApiError(response.status, detail);
  }

  return data as T;
}
