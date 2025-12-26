import type { Request, Response } from "express";
import { Public } from "@src/commerce/public.decorator";
import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { isEmailValid } from "@src/commerce/user-property-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { Seller } from "@src/commerce/seller";
import { Repository } from "typeorm";
import { AuthGuard } from "@src/commerce/auth.guard";

@Controller("/seller")
export class SellerChangeContactEmailController {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}


  @Post("/changeContactEmail")
  @UseGuards(AuthGuard)
  async changeContactEmail(
    @Req()
    req: Request & { user: { sub: string } },
    @Res()
    res: Response,
    @Body()
    command: ChangeContactEmailCommand,
  ) {
    if (isEmailValid(command.contactEmail) === false) {
      return res.status(HttpStatus.BAD_REQUEST)
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

    seller.contactEmail = command.contactEmail;

    await this.sellerRepository.save(seller);

    return res.status(HttpStatus.NO_CONTENT)
              .send();
  }
}
