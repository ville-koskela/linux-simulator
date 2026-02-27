import { apiFetch } from "./api.service";
import type { AuthUser } from "./auth.types";

export interface ExchangeCodeResponse {
  accessToken: string;
  refreshToken: string | null;
  user: AuthUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string | null;
}

export const AuthApiService = {
  /**
   * Exchange an OAuth authorization code (+ PKCE verifier) for tokens via the backend.
   */
  async exchangeCode(
    code: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<ExchangeCodeResponse> {
    const response = await apiFetch<ExchangeCodeResponse>("/auth/exchange", {
      method: "POST",
      body: JSON.stringify({ code, codeVerifier, redirectUri }),
    });

    if (!response) throw new Error("Empty response from /auth/exchange");
    return response;
  },

  /**
   * Refresh an expired access token using a refresh token.
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiFetch<RefreshTokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });

    if (!response) throw new Error("Empty response from /auth/refresh");
    return response;
  },

  /**
   * Get the currently authenticated user's profile.
   */
  async getMe(): Promise<AuthUser> {
    const response = await apiFetch<AuthUser>("/auth/me");
    if (!response) throw new Error("Empty response from /auth/me");
    return response;
  },
};
