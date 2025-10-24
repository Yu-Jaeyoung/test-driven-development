import { Controller, Get, HttpStatus, Req, Res } from "@nestjs/common";

import type { Request, Response } from "express";
import { Shopper } from "@src/commerce/shopper";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Controller("/shopper")
export class ShopperMeController {
  constructor(
    @InjectRepository(Shopper)
    private readonly shopperRepository: Repository<Shopper>,
  ) {}

  @Get("/me")
  async me(
    @Req()
    req: Request & { user: { sub: string } },
    @Res()
    res: Response,
  ) {
    const shopper: Shopper | null = await this.shopperRepository.findOneBy({
        id: req.user.sub,
      },
    );

    if (!shopper) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    }

    const shopperInfo: ShopperMeView = {
      id: req.user.sub,
      email: shopper.email,
      username: shopper.username,
    };

    return res.send(shopperInfo);
  }
}
