import type { ApiResponse, AuthData } from "./types";

const API = "/api/auth";

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API}${url}`, { ...options, headers });
  } catch {
    throw new Error("Connection failed. Please try again.");
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Request failed");
  }
  return data.data as T;
}

export async function register(
  email: string,
  password: string
): Promise<AuthData> {
  const data = await request<AuthData>("/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", data.token);
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthData> {
  const data = await request<AuthData>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", data.token);
  return data;
}

export async function resetPasswordRequest(email: string): Promise<{ message: string }> {
  return request<{ message: string }>("/reset-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordConfirm(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  return request<{ message: string }>("/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function getMe(): Promise<{ user: import("./types").User }> {
  return request<{ user: import("./types").User }>("/me");
}

export function logout(): void {
  localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token");
}
