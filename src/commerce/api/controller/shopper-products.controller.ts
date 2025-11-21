import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";

@Controller("/shopper")
export class ShopperProductsController {
  @Get("/products")
  async getProduct(
    @Res()
    res: Response,
  ) {
    return res.status(200)
              .send();
  }
}