import { Injectable, UnauthorizedException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Needed by dependency injection
import { ConfigService } from "../config/config.service";
// biome-ignore lint/style/useImportType: Needed by dependency injection
import { DatabaseService } from "../database/database.service";
// biome-ignore lint/style/useImportType: Needed by dependency injection
import { LoggerService } from "../logger/logger.service";
import type {
  AuthUser,
  ExchangeCodeResponse,
  OAuthIntrospectResponse,
  OAuthTokenResponse,
  OAuthUserInfo,
  RefreshTokenResponse,
} from "./auth.types";

interface CacheEntry {
  data: OAuthIntrospectResponse;
  expiresAt: number;
}

interface DbUser {
  id: number;
  username: string;
  oauthSub: string;
}

@Injectable()
export class AuthService {
  /** Short-lived cache for introspection results to reduce external calls. */
  private readonly introspectionCache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 30_000; // 30 seconds

  public constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext("AuthService");
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Exchange an authorization code (with PKCE verifier) for tokens, then
   * find-or-create a local user from the OAuth user info.
   */
  public async exchangeCode(
    code: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<ExchangeCodeResponse> {
    const tokens = await this.requestTokens({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const userInfo = await this.fetchUserInfo(tokens.access_token);
    const user = await this.findOrCreateUser(userInfo);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      user,
    };
  }

  /**
   * Use an OAuth refresh_token to obtain a new access_token.
   */
  public async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const tokens = await this.requestTokens({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
    };
  }

  /**
   * Validate a Bearer access_token via the introspection endpoint.
   * Returns the introspection payload when active, otherwise throws.
   * Results are cached for {@link CACHE_TTL_MS} to reduce external calls.
   */
  public async validateToken(accessToken: string): Promise<OAuthIntrospectResponse> {
    // Check cache first
    this.pruneCache();
    const cached = this.introspectionCache.get(accessToken);
    if (cached) {
      if (!cached.data.active) {
        throw new UnauthorizedException("Token is no longer active");
      }
      return cached.data;
    }

    const intro = await this.introspectToken(accessToken);

    if (!intro.active) {
      // Cache negative result briefly so we don't spam the server
      this.introspectionCache.set(accessToken, {
        data: intro,
        expiresAt: Date.now() + 5_000,
      });
      throw new UnauthorizedException("Token is inactive or expired");
    }

    this.introspectionCache.set(accessToken, {
      data: intro,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });

    return intro;
  }

  /**
   * Look up a local user by OAuth subject (sub claim).
   */
  public async getUserBySub(sub: string): Promise<AuthUser | null> {
    const result = await this.db.query<DbUser>(
      "SELECT id, username, oauth_sub FROM users WHERE oauth_sub = $1",
      [sub]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { id: row.id, username: row.username, oauthSub: row.oauthSub };
  }

  /**
   * Revoke an access_token or refresh_token at the OAuth server.
   */
  public async revokeToken(token: string): Promise<void> {
    const credentials = this.buildClientCredentials();
    await fetch(this.config.oauthRevokeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({ token }),
    });

    // Remove from cache regardless of server response
    this.introspectionCache.delete(token);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async requestTokens(params: Record<string, string>): Promise<OAuthTokenResponse> {
    const credentials = this.buildClientCredentials();
    const body = new URLSearchParams(params);

    const response = await fetch(this.config.oauthTokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`OAuth token request failed: ${response.status} ${text}`);
      throw new UnauthorizedException("Token request failed");
    }

    return response.json() as Promise<OAuthTokenResponse>;
  }

  private async fetchUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch(this.config.oauthUserinfoEndpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`OAuth userinfo request failed: ${response.status} ${text}`);
      throw new UnauthorizedException("Failed to fetch user info");
    }

    return response.json() as Promise<OAuthUserInfo>;
  }

  private async introspectToken(token: string): Promise<OAuthIntrospectResponse> {
    const credentials = this.buildClientCredentials();

    const response = await fetch(this.config.oauthIntrospectEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({ token }),
    });

    if (!response.ok) {
      this.logger.error(`OAuth introspect request failed: ${response.status}`);
      throw new UnauthorizedException("Token introspection failed");
    }

    return response.json() as Promise<OAuthIntrospectResponse>;
  }

  private async findOrCreateUser(userInfo: OAuthUserInfo): Promise<AuthUser> {
    const username = userInfo.preferred_username ?? `user_${userInfo.sub.slice(0, 8)}`;

    // Upsert the user record (handles first login and username changes atomically)
    const insertResult = await this.db.query<DbUser>(
      `INSERT INTO users (username, oauth_sub)
       VALUES ($1, $2)
       ON CONFLICT (oauth_sub) DO UPDATE SET username = EXCLUDED.username
       RETURNING id, username, oauth_sub`,
      [username, userInfo.sub]
    );

    const user = insertResult.rows[0];
    this.logger.log(`Authenticated user: ${username} (id: ${user.id})`);

    // Always ensure the home directory exists – provisionHomedir is idempotent
    // and handles the case where an existing user's home was wiped (e.g. by a
    // migration) or was never created.
    await this.provisionHomedir(user.id, username);

    return {
      id: user.id,
      username: user.username,
      oauthSub: userInfo.sub,
    };
  }

  /**
   * Create /home/<username> for a newly registered user inside the shared tree.
   *
   * The shared root filesystem (/, /home, /etc, /tmp, …) already exists –
   * seeded by migration 3 and persisted across restarts.  All we need to do
   * is add a personal directory under /home and drop a welcome file in it.
   */
  private async provisionHomedir(userId: number, username: string): Promise<void> {
    // Locate the shared root
    const rootRow = await this.db.query<{ id: number }>(
      "SELECT id FROM filesystem_nodes WHERE parent_id IS NULL AND name = '/'",
      []
    );
    if (rootRow.rows.length === 0) {
      this.logger.warn("Shared root not found – skipping home directory provisioning");
      return;
    }
    const rootId = rootRow.rows[0].id;

    // Locate /home
    const homeRow = await this.db.query<{ id: number }>(
      "SELECT id FROM filesystem_nodes WHERE parent_id = $1 AND name = 'home'",
      [rootId]
    );
    if (homeRow.rows.length === 0) {
      this.logger.warn("Shared /home not found – skipping home directory provisioning");
      return;
    }
    const homeId = homeRow.rows[0].id;

    // Idempotency check – home dir may already exist (e.g. concurrent logins)
    const existing = await this.db.query<{ id: number }>(
      "SELECT id FROM filesystem_nodes WHERE parent_id = $1 AND name = $2",
      [homeId, username]
    );
    if (existing.rows.length > 0) return;

    await this.db.transaction(async (client) => {
      const userHomeDirResult = await client.query<{ id: number }>(
        `INSERT INTO filesystem_nodes (owner_id, parent_id, name, type, permissions)
         VALUES ($1, $2, $3, 'directory', 'rwx------')
         RETURNING id`,
        [userId, homeId, username]
      );
      const userHomeDirId = userHomeDirResult.rows[0].id;

      await client.query(
        `INSERT INTO filesystem_nodes (owner_id, parent_id, name, type, content, permissions)
         VALUES ($1, $2, 'welcome.txt', 'file', $3, 'rw-r--r--')`,
        [
          userId,
          userHomeDirId,
          `Welcome to Linux Simulator!

This is a simulated Linux filesystem where you can practice basic Linux commands.
Try exploring the filesystem with commands like:
  - ls     (list files)
  - cd     (change directory)
  - cat    (view file contents)
  - mkdir  (create directory)
  - touch  (create file)

Your personal home directory is /home/${username}.
The /tmp directory is shared and writable by everyone.

Have fun learning!`,
        ]
      );
    });

    this.logger.log(`Provisioned home directory /home/${username} for user ID: ${userId}`);
  }

  private buildClientCredentials(): string {
    return Buffer.from(`${this.config.oauthClientId}:${this.config.oauthClientSecret}`).toString(
      "base64"
    );
  }

  private pruneCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.introspectionCache.entries()) {
      if (entry.expiresAt <= now) {
        this.introspectionCache.delete(key);
      }
    }
  }
}
