import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp()
                           .getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    request.user = this.getUserFromToken(token);

    return true;
  }

  private extractTokenFromHeader(request: Request) {
    const [ type, token ] = request.headers.authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }

  private getUserFromToken(token: string) {
    return this.jwtService.verify(token);
  }
}