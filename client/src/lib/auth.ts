import { User, AuthResponse } from "@/types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser(): User | null {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function hasRole(requiredRoles: string[]): boolean {
  const user = getUser();
  return user ? requiredRoles.includes(user.role) : false;
}

export function canAccessBase(baseId?: number): boolean {
  const user = getUser();
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!baseId) return true;
  return user.baseId === baseId;
}
