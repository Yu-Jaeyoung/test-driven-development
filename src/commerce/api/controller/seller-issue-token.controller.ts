import { AccessTokenCarrier } from "@/commerce/result/access-token-carrier";
import { Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { JwtService } from "@nestjs/jwt";

@Controller("/seller")
export class SellerIssueTokenController {
  constructor(
    private jwtService: JwtService,
  ) {
  }

  @Post("/issueToken")
  async issueToken(
    @Res()
    res: Response,
  ) {
    const token: AccessTokenCarrier = { accessToken: this.jwtService.sign("") };

    console.log(token.accessToken);

    return res.status(HttpStatus.OK)
              .send(token);
  }
}