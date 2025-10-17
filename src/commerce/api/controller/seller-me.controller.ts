import { Controller, Get, HttpStatus, Req, Res } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Response, Request } from "express";

@Controller("/seller")
export class SellerMeController {
  constructor(private readonly jwtService: JwtService) {}

  @Get("/me")
  async me(
    @Req()
    req: Request,
    @Res()
    res: Response,
  ) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HttpStatus.UNAUTHORIZED)
                .send();
    }
  }
}
