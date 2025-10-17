import type { Request, Response } from "express";

import { AuthGuard } from "@src/commerce/auth.guard";
import { Controller, Get, HttpStatus, Req, Res, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Seller } from "@src/commerce/seller";
import { Repository } from "typeorm";

@Controller("/seller")
export class SellerMeController {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  @Get("/me")
  @UseGuards(AuthGuard)
  async me(
    @Req()
    req: Request & { user: { sub: string } },
    @Res()
    res: Response,
  ) {

    if (!req.user) {
      return res.status(HttpStatus.UNAUTHORIZED)
                .send();
    }

    const seller: Seller | null = await this.sellerRepository.findOneBy({
        id: req.user.sub,
      },
    );

    if (!seller) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    }


    const sellerInfo: SellerMeView = {
      id: req.user.sub,
      email: seller.email,
      username: seller.username,
    };

    return res.send(sellerInfo);
  }
}
