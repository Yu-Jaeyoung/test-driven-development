import type { Request, Response } from "express";
import { Body, Controller, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { Repository } from "typeorm";
import { Seller } from "@src/commerce/seller";
import { InjectRepository } from "@nestjs/typeorm";
import type { RegisterProductCommand } from "@src/commerce/command/register-product-command";

@Controller("/seller")
export class SellerProductsController {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  @Post("/products")
  async registerProduct(
    @Req()
    req: Request & { user: { sub: string } },
    @Res()
    res: Response,
    @Body()
    command: RegisterProductCommand,
  ) {
    const seller: Seller | null = await this.sellerRepository.findOneBy({
      id: req.user.sub,
    });

    if (!seller) {
      return res.status(HttpStatus.FORBIDDEN)
                .send();
    }

    if (this.isValidUri(command.imageUri) == false) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    }

    const url = `/seller/products/${ crypto.randomUUID() }`;

    return res.setHeader("location", url)
              .status(HttpStatus.CREATED)
              .send();
  }

  private isValidUri(value: string) {
    try {
      new URL(value);
      return true;
    } catch (error) {
      return false;
    }
  }
}