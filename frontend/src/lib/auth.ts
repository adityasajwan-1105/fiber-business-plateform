export type UserRole = "user" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "madeye-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

export function profilePath(role: UserRole) {
  return role === "admin" ? "/admin" : "/profile";
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function register(body: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  inviteCode?: string;
}) {
  return request<{ token: string; user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function login(body: { email: string; password: string }) {
  return request<{ token: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchMe() {
  return request<{ user: AuthUser }>("/auth/me");
}

export function fetchAdminOverview() {
  return request<{
    customers: number;
    admins: number;
    messages: number;
    customerDetails: { _id: string; name: string; email: string; createdAt: string }[];
    studio: string;
  }>("/auth/admin/overview");
}

export function fetchAdminCustomers() {
  return request<{
    customers: { _id: string; name: string; email: string; createdAt: string }[];
  }>("/auth/admin/customers");
}

export function sendSupportMessage(body: { name: string; email: string; message: string }) {
  return request<{ message: string }>("/auth/messages", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchAdminMessages() {
  return request<{
    messages: { _id: string; name: string; email: string; message: string; createdAt: string }[];
  }>("/auth/admin/messages");
}

export function deleteAdminMessage(id: string) {
  return request<{ message: string }>(`/auth/admin/messages/${id}`, {
    method: "DELETE",
  });
}

export function updateAdminCredentials(body: {
  currentPassword: string;
  name?: string;
  email?: string;
  newPassword?: string;
}) {
  return request<{ token: string; user: AuthUser }>("/auth/admin/credentials", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
