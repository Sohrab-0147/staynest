import type { Role } from '@/types';

const ACCESS_TOKEN_KEY = 'staynest_access_token';

// ── Storage helpers ───────────────────────────────────────────────

export const tokenUtils = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  removeAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  hasToken(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};

// ── JWT decode (no verify — server validates) ─────────────────────

interface JwtPayload {
  sub: string;          // user id
  email?: string;
  roles?: string;       // "[GUEST]" or "[MANAGER]"
  exp?: number;
  iat?: number;
}

function base64UrlDecode(str: string): string {
  // Replace URL-safe chars and add padding
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  return atob(padded);
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  // exp is in seconds; add 30s grace period
  return Date.now() / 1000 > payload.exp - 30;
}

export function getRolesFromToken(token: string): Role[] {
  const payload = decodeJwt(token);
  if (!payload?.roles) return [];
  // Roles come as "[GUEST]" or "[MANAGER, GUEST]"
  return payload.roles
    .replace(/[\[\]\s]/g, '')
    .split(',')
    .filter(Boolean) as Role[];
}

export function getUserIdFromToken(token: string): number | null {
  const payload = decodeJwt(token);
  if (!payload?.sub) return null;
  return parseInt(payload.sub, 10);
}
