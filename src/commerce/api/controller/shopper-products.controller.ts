import { Controller, Get, HttpStatus, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "@src/commerce/product";
import { Repository } from "typeorm";
import type { ProductView } from "@src/commerce/view/product-view";
import type { PageCarrier } from "@src/commerce/result/page-carrier";
import { Seller } from "@src/commerce/seller";

@Controller("/shopper")
export class ShopperProductsController {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  @Get("/products")
  async getProducts(
    @Res()
    res: Response,
    @Query("continuationToken")
    continuationToken?: string,
  ) {
    const pageSize = 4;

    const dataKey = continuationToken ? parseInt(Buffer.from(continuationToken, "base64")
                                                       .toString(), 10) : null;

    const qb = this.productRepository.createQueryBuilder("p")
                   .innerJoinAndSelect(Seller, "s", "p.sellerId = s.id");

    if (dataKey !== null) {
      qb.where("p.dataKey <= :dataKey", { dataKey });
    }

    const products = await qb.orderBy("p.dataKey", "DESC")
                             .limit(pageSize + 1)
                             .getRawMany();

    if (products.length === 0) {
      return res.status(HttpStatus.OK)
                .send();
    }

    const next = products.length <= pageSize ? undefined : products[products.length - 1].p_dataKey;

    const pageCarrier: PageCarrier<ProductView> = {
      items: products
        .slice(0, pageSize)
        .map(product => ({
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
      continuationToken: await this.encodeCursor(next),
    };

    return res.status(HttpStatus.OK)
              .send(pageCarrier);
  };

  async encodeCursor(dataKey: string) {
    if (!dataKey) {
      return undefined;
    }

    return Buffer.from(dataKey.toString())
                 .toString("base64");
  }
}