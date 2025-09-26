import { AccessTokenCarrier } from "@/commerce/result/access-token-carrier";
import { Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";

@Controller("/seller")
export class SellerIssueTokenController {
  constructor() {}

  @Post("/issueToken")
  async issueToken(
    @Res()
    res: Response,
  ) {
    const token: AccessTokenCarrier = { accessToken: "token" };

    return res.status(HttpStatus.OK)
              .send(token);
  }
}