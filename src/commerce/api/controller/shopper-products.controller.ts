import { Controller, Get, HttpStatus, Query, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "@src/commerce/product";
import type { PageCarrier } from "@src/commerce/result/page-carrier";
import { Seller } from "@src/commerce/seller";
import type { ProductView } from "@src/commerce/view/product-view";
import type { Response } from "express";
import { Repository } from "typeorm";

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
    const pageSize = 4;

    const qb = this.productRepository.createQueryBuilder("p")
                   .innerJoinAndSelect(Seller, "s", "p.sellerId = s.id");

    if (continuationToken) {
      const dataKey = parseInt(Buffer.from(continuationToken, "base64")
                                     .toString(), 10);

      qb.where("p.dataKey <= :dataKey", { dataKey });
    }

    const products = await qb.orderBy("p.dataKey", "DESC")
                             .take(pageSize + 1)
                             .getRawMany();

    if (products.length === 0) {
      return res.status(HttpStatus.OK)
                .send();
    }

    const next = products.length > pageSize ? products[pageSize].p_dataKey : undefined;

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
      continuationToken: next ? await this.encodeCursor(next) : undefined,
    };

    return res.status(HttpStatus.OK)
              .send(pageCarrier);
  };

  async encodeCursor(dataKey: number) {
    if (!dataKey) {
      return undefined;
    }

    return Buffer.from(dataKey.toString())
                 .toString("base64");
  }
}