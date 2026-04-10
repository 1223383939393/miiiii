import type { AuthResponse, User } from "../types";

const API_URL = "https://messenger-sssss.onrender.com"; // твой сервер

export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Registration failed");
  }

  return res.json();
}

export async function login(
  emailOrUsername: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrUsername, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Login failed");
  }

  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/api/users`);
  if (!res.ok) {
    throw new Error("Failed to load users");
  }
  return res.json();
}