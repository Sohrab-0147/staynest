import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthUser, AuthContextType, LoginRequest, SignUpRequest } from '@/types';
import authService from '@/services/authService';
import userService from '@/services/userService';
import {
  tokenUtils,
  getRolesFromToken,
  isTokenExpired,
} from '@/utils/tokenUtils';

// ── Context ───────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    tokenUtils.getAccessToken(),
  );
  const [isLoading, setIsLoading] = useState(true); // true until bootstrap completes

  // ── Derived state ─────────────────────────────────────────────

  const isAuthenticated = !!user;
  const isManager       = user?.roles?.includes('MANAGER') ?? false;

  // ── Helpers ──────────────────────────────────────────────────

  /** Fetch /users/profile and hydrate user state with roles from token */
  const loadUser = useCallback(async (token: string) => {
    const profile = await userService.getMyProfile();
    const roles   = getRolesFromToken(token);
    setUser({ ...profile, roles });
  }, []);

  /** Store token and update state */
  const applyToken = useCallback(
    async (token: string) => {
      tokenUtils.setAccessToken(token);
      setAccessToken(token);
      await loadUser(token);
    },
    [loadUser],
  );

  // ── Bootstrap — runs once on mount ───────────────────────────

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = tokenUtils.getAccessToken();

      if (!storedToken) {
        // No token at all — guest session
        setIsLoading(false);
        return;
      }

      try {
        if (isTokenExpired(storedToken)) {
          // Access token expired → try silent refresh via cookie
          const { accessToken: newToken } = await authService.refresh();
          await applyToken(newToken);
        } else {
          // Token still valid → just load the profile
          await loadUser(storedToken);
        }
      } catch {
        // Refresh failed (cookie expired / invalid) — clean up
        tokenUtils.removeAccessToken();
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [applyToken, loadUser]);

  // ── Auth actions ─────────────────────────────────────────────

  const login = useCallback(
    async (data: LoginRequest) => {
      const { accessToken: token } = await authService.login(data);
      await applyToken(token);
    },
    [applyToken],
  );

  const register = useCallback(async (data: SignUpRequest) => {
    // Signup does NOT auto-login — user is redirected to login page
    await authService.signup(data);
  }, []);

  const logout = useCallback(() => {
    tokenUtils.removeAccessToken();
    setUser(null);
    setAccessToken(null);
    // Refresh cookie is HttpOnly — backend would need a /auth/logout endpoint
    // to clear it server-side. For now we clear the access token client-side.
  }, []);

  const refreshUser = useCallback(async () => {
    const token = tokenUtils.getAccessToken();
    if (!token) return;
    await loadUser(token);
  }, [loadUser]);

  // ── Value ─────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isManager,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
