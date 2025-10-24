import { Controller, Get, Req, Res } from "@nestjs/common";

import type { Request, Response } from "express";

@Controller("/shopper")
export class ShopperMeController {

  @Get("/me")
  async me(
    @Req()
    req: Request & { user: { sub: string } },
    @Res()
    res: Response,
  ) {
    const shopperInfo: ShopperMeView = {
      id: req.user.sub,
      email: undefined,
      username: undefined,
    };

    return res.send(shopperInfo);
  }
}
