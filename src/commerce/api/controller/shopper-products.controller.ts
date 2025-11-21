import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "@src/commerce/product";
import { Repository } from "typeorm";
import type { ProductView } from "@src/commerce/view/product-view";
import type { PageCarrier } from "@src/commerce/result/page-carrier";

@Controller("/shopper")
export class ShopperProductsController {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  @Get("/products")
  async getProduct(
    @Res()
    res: Response,
  ) {
    const products = await this.productRepository.find();

    products.sort((
        productA,
        productB,
      ) =>
        productB.dataKey - productA.dataKey,
    );

    const pageCarrier: PageCarrier<ProductView> = {
      items: products.map(product => ({
        id: product.id,
        name: product.name,
        seller: undefined,
        imageUri: product.imageUri,
        description: product.description,
        priceAmount: product.priceAmount.toString(),
        stockQuantity: product.stockQuantity,
      })),
      continuationToken: undefined,
    };

    return res.status(200)
              .send(pageCarrier);
  }
}