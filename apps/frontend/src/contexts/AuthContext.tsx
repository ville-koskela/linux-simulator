import {
  type Context,
  type JSX,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setAuthToken } from "../services/api.service";
import { AuthApiService } from "../services/auth.service";
import type { AuthUser } from "../services/auth.types";
import { logger } from "../utils/logger";

// ---------------------------------------------------------------------------
// PKCE utilities (RFC 7636)
// ---------------------------------------------------------------------------

function generateVerifier(): string {
  const array = new Uint8Array(96);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function generateChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64URLEncode(new Uint8Array(digest));
}

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ---------------------------------------------------------------------------
// Session storage keys
// ---------------------------------------------------------------------------

const STORAGE_KEY_ACCESS_TOKEN = "auth_access_token";
const STORAGE_KEY_REFRESH_TOKEN = "auth_refresh_token";
const STORAGE_KEY_USER = "auth_user";
const STORAGE_KEY_PKCE_VERIFIER = "auth_pkce_verifier";
const STORAGE_KEY_OAUTH_STATE = "auth_oauth_state";

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** Whether the user is authenticated. */
  isAuthenticated: boolean;
  /** Whether the auth state is still being initialised (e.g. handling callback). */
  isLoading: boolean;
  /** The authenticated local user, or null when logged out. */
  user: AuthUser | null;
  /** The current OAuth access token, or null when logged out. */
  accessToken: string | null;
  /** Initiate the OAuth 2.0 authorization-code + PKCE login flow. */
  login: () => Promise<void>;
  /** Clear all auth state. */
  logout: () => void;
}

const AuthContext: Context<AuthContextValue | null> = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

const OAUTH_ISSUER: string = import.meta.env.VITE_OAUTH_ISSUER ?? "https://www.operationmonkey.net";
const OAUTH_CLIENT_ID: string = import.meta.env.VITE_OAUTH_CLIENT_ID ?? "linux-simulator";
const OAUTH_SCOPES: string = import.meta.env.VITE_OAUTH_SCOPES ?? "openid profile email";
/** Authorization endpoint discovered from /.well-known/openid-configuration */
const OAUTH_AUTHORIZE_ENDPOINT: string =
  import.meta.env.VITE_OAUTH_AUTHORIZE_ENDPOINT ??
  `${OAUTH_ISSUER}/monkeykey/api/v1/oauth/authorize`;
/** Must match the registered redirect URI and the backend OAUTH_REDIRECT_URI env var. */
const REDIRECT_URI: string = `${window.location.origin}/callback`;

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(() =>
    loadFromStorage<AuthUser>(STORAGE_KEY_USER)
  );
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    sessionStorage.getItem(STORAGE_KEY_ACCESS_TOKEN)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Keep the shared api.service token in sync
  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  // On mount, check whether the current URL is the OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const returnedState = params.get("state");

    if (!code) return;

    // Verify state to prevent CSRF
    const savedState = sessionStorage.getItem(STORAGE_KEY_OAUTH_STATE);
    if (returnedState !== savedState) {
      logger.error("OAuth state mismatch – possible CSRF attack");
      return;
    }

    const verifier = sessionStorage.getItem(STORAGE_KEY_PKCE_VERIFIER);
    if (!verifier) {
      logger.error("PKCE verifier not found in sessionStorage");
      return;
    }

    // Clean up PKCE / state artifacts and redirect to root
    sessionStorage.removeItem(STORAGE_KEY_PKCE_VERIFIER);
    sessionStorage.removeItem(STORAGE_KEY_OAUTH_STATE);

    setIsLoading(true);
    AuthApiService.exchangeCode(code, verifier, REDIRECT_URI)
      .then(({ accessToken: token, refreshToken, user: authUser }) => {
        persistSession(token, refreshToken, authUser);
        setAccessToken(token);
        setUser(authUser);
        // Redirect away from /callback to /
        window.history.replaceState({}, document.title, "/");
      })
      .catch((err) => {
        logger.error("OAuth code exchange failed:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (): Promise<void> => {
    const verifier = generateVerifier();
    const challenge = await generateChallenge(verifier);
    const state = generateVerifier().slice(0, 32);

    sessionStorage.setItem(STORAGE_KEY_PKCE_VERIFIER, verifier);
    sessionStorage.setItem(STORAGE_KEY_OAUTH_STATE, state);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: OAUTH_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: OAUTH_SCOPES,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    window.location.href = `${OAUTH_AUTHORIZE_ENDPOINT}?${params.toString()}`;
  }, []);

  const logout = useCallback((): void => {
    sessionStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    setAccessToken(null);
    setUser(null);
    setAuthToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null && accessToken !== null,
      isLoading,
      user,
      accessToken,
      login,
      logout,
    }),
    [isLoading, user, accessToken, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function persistSession(accessToken: string, refreshToken: string | null, user: AuthUser): void {
  sessionStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    sessionStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, refreshToken);
  }
  sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
