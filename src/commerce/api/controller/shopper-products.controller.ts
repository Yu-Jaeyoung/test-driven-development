import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "@src/commerce/product";
import { EntityManager, Repository } from "typeorm";
import type { ProductView } from "@src/commerce/view/product-view";
import type { PageCarrier } from "@src/commerce/result/page-carrier";
import { Seller } from "@src/commerce/seller";

@Controller("/shopper")
export class ShopperProductsController {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly entityManager: EntityManager,
  ) {}

  @Get("/products")
  async getProduct(
    @Res()
    res: Response,
  ) {
    const products = await this.productRepository.createQueryBuilder("p")
                               .innerJoinAndSelect(Seller, "s", "p.sellerId = s.id")
                               .orderBy("p.dataKey", "DESC")
                               .getRawMany();

    const pageCarrier: PageCarrier<ProductView> = {
      items: products.map(product => ({
        id: product.p_id,
        name: product.p_name,
        seller: {
          id: product.s_id,
          username: product.s_username,
        },
        imageUri: product.p_imageUri,
        description: product.p_description,
        priceAmount: product.p_priceAmount.toString(),
        stockQuantity: product.p_stockQuantity,
      })),
      continuationToken: undefined,
    };

    return res.status(200)
              .send(pageCarrier);
  };
}