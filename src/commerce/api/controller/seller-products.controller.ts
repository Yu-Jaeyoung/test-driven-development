import type { Response } from "express";
import { Controller, HttpStatus, Post, Res } from "@nestjs/common";

@Controller("/seller")
export class SellerProductsController {

  @Post("/products")
  async registerProduct(
    @Res()
    res: Response,
  ) {
    return res.send(HttpStatus.CREATED);
  }
}