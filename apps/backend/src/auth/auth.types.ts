export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

export interface OAuthUserInfo {
  sub: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
}

export interface OAuthIntrospectResponse {
  active: boolean;
  sub?: string;
  preferred_username?: string;
  email?: string;
  client_id?: string;
  scope?: string;
  exp?: number;
  iat?: number;
}

export interface AuthUser {
  id: number;
  username: string;
  oauthSub: string;
}

export interface ExchangeCodeResponse {
  accessToken: string;
  refreshToken: string | null;
  user: AuthUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string | null;
}
