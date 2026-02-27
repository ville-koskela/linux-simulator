import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: Needed by dependency injection
import { AuthService } from "./auth.service";
import type { AuthUser } from "./auth.types";

interface RawRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthUser;
}

export interface AuthenticatedRequest extends RawRequest {
  user: AuthUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly authService: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException("Missing Bearer token");
    }

    const introspection = await this.authService.validateToken(token);

    if (!introspection.sub) {
      throw new UnauthorizedException("Token has no subject claim");
    }

    const user = await this.authService.getUserBySub(introspection.sub);
    if (!user) {
      throw new UnauthorizedException("User not found for this token");
    }

    request.user = user;
    return true;
  }

  private extractBearerToken(request: RawRequest): string | null {
    const authHeader = request.headers.authorization;
    const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (!header?.startsWith("Bearer ")) return null;
    return header.slice(7).trim() || null;
  }
}
