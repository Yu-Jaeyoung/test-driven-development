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
    return res.status(HttpStatus.OK)
              .send();
  }
}