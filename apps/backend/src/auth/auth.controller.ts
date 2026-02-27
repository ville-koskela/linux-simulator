import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
// biome-ignore lint/style/useImportType: Needed by dependency injection
import { AuthService } from "./auth.service";
import type { AuthUser, ExchangeCodeResponse, RefreshTokenResponse } from "./auth.types";
import { CurrentUser } from "./user.decorator";

interface ExchangeCodeBody {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

interface RefreshTokenBody {
  refreshToken: string;
}

@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  /**
   * Exchange an OAuth authorization code (+ PKCE verifier) for tokens.
   * Returns the access token, optional refresh token, and local user info.
   *
   * POST /auth/exchange
   * Body: { code, codeVerifier, redirectUri }
   */
  @Post("exchange")
  @HttpCode(HttpStatus.OK)
  public async exchangeCode(@Body() body: ExchangeCodeBody): Promise<ExchangeCodeResponse> {
    const { code, codeVerifier, redirectUri } = body;

    if (!code || !codeVerifier || !redirectUri) {
      throw new UnauthorizedException("code, codeVerifier, and redirectUri are required");
    }

    return this.authService.exchangeCode(code, codeVerifier, redirectUri);
  }

  /**
   * Refresh an expired access token using a refresh token.
   *
   * POST /auth/refresh
   * Body: { refreshToken }
   */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  public async refresh(@Body() body: RefreshTokenBody): Promise<RefreshTokenResponse> {
    if (!body.refreshToken) {
      throw new UnauthorizedException("refreshToken is required");
    }

    return this.authService.refreshAccessToken(body.refreshToken);
  }

  /**
   * Get the currently authenticated user's profile.
   *
   * GET /auth/me
   * Authorization: Bearer <access_token>
   */
  @Get("me")
  @UseGuards(AuthGuard)
  public getMe(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }

  /**
   * Revoke an access or refresh token.
   *
   * POST /auth/revoke
   * Authorization: Bearer <access_token>
   * Body: { token }
   */
  @Post("revoke")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  public async revoke(@Body("token") token: string): Promise<void> {
    if (!token) {
      throw new UnauthorizedException("token is required");
    }
    await this.authService.revokeToken(token);
  }
}
