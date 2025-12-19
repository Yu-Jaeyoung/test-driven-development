import { Controller, Get, HttpStatus, Query, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "@src/commerce/product";
import type { Response } from "express";
import { Repository } from "typeorm";
import { GetProductPageQueryProcessor } from "@src/commerce/querymodel/get-product-page-query-processor";

@Controller("/shopper")
export class ShopperProductsController {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  @Get("/products")
  async getProducts(
    @Res()
    res: Response,
    @Query("continuationToken")
    continuationToken?: string,
  ) {
    const processor = new GetProductPageQueryProcessor(this.productRepository);
    const query: GetProductPage = { continuationToken };
    const pageCarrier = await processor.process(query);

    return res.status(HttpStatus.OK)
              .send(pageCarrier);
  }
}