import { type ExecutionContext, createParamDecorator } from "@nestjs/common";
import type { AuthenticatedRequest } from "./auth.guard";
import type { AuthUser } from "./auth.types";

/**
 * Route handler parameter decorator that extracts the authenticated user
 * from the request object (set by AuthGuard).
 *
 * @example
 * ```ts
 * @Get("me")
 * @UseGuards(AuthGuard)
 * getMe(@CurrentUser() user: AuthUser) { ... }
 * ```
 */
export const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  }
);
