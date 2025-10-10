import { Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Response } from "express";
import type { AccessTokenCarrier } from "@/commerce/result/access-token-carrier";

@Controller("/shopper")
export class ShopperIssueTokenController {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  @Post("/issueToken")
  async issueToken(
    @Res()
    res: Response,
  ) {
    const token: AccessTokenCarrier = this.composeToken();

    return res.status(HttpStatus.OK)
              .send(token);
  }

  private composeToken() {
    return { accessToken: this.jwtService.sign("") };
  }
}