import type { Request, Response } from "express";

import { AuthGuard } from "@src/commerce/auth.guard";
import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";

@Controller("/seller")
export class SellerMeController {
  constructor() {}

  @Get("/me")
  @UseGuards(AuthGuard)
  async me(
    @Req()
    req: Request & { user?: { sub: string } },
    @Res()
    res: Response,
  ) {

    if (!req.user) {
      return res.status(401)
                .send();
    }

    const sellerInfo: SellerMeView = {
      id: req.user.sub,
      email: undefined,
      username: undefined,
    };

    return res.send(sellerInfo);
  }
}
