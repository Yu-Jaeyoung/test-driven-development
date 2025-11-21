import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "@src/commerce/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp()
                           .getRequest() as Request & { user?: { sub: string, scp?: string } };

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const user = this.getUserFromToken(token);

    const controller = Reflect.getMetadata("path", context.getClass());

    if (controller === "/seller") {
      if (user.scp === undefined || user.scp !== "seller") {
        throw new ForbiddenException();
      }
    }

    if (controller === "/shopper") {
      if (user.scp === undefined || user.scp !== "shopper") {
        throw new ForbiddenException();
      }
    }

    request.user = user;

    return true;
  }

  private extractTokenFromHeader(request: Request) {
    const [ type, token ] = request.headers.authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }

  private getUserFromToken(token: string): { sub: string, scp?: string } {
    const payload = this.jwtService.verify(token);
    return payload;
  }
}