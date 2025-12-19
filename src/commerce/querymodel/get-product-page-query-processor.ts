import { Repository } from "typeorm";
import { Product } from "@src/commerce/product";
import { Seller } from "@src/commerce/seller";
import type { PageCarrier } from "@src/commerce/result/page-carrier";
import type { ProductView } from "@src/commerce/view/product-view";

export class GetProductPageQueryProcessor {
  constructor(private readonly productRepository: Repository<Product>) {}

  async process(query: GetProductPage) {
    const pageSize = 4;

    const qb = this.productRepository.createQueryBuilder("p")
                   .innerJoinAndSelect(Seller, "s", "p.sellerId = s.id");

    if (query.continuationToken) {
      const dataKey = parseInt(Buffer.from(query.continuationToken, "base64")
                                     .toString(), 10);

      qb.where("p.dataKey <= :dataKey", { dataKey });
    }

    const products = await qb.orderBy("p.dataKey", "DESC")
                             .take(pageSize + 1)
                             .getRawMany();

    if (products.length === 0) {
      return {};
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
            contactEmail: "",
          },
          imageUri: product.p_imageUri,
          description: product.p_description,
          priceAmount: product.p_priceAmount.toString(),
          stockQuantity: product.p_stockQuantity,
        })),
      continuationToken: next ? await this.encodeCursor(next) : undefined,
    };

    return pageCarrier;
  };

  async encodeCursor(dataKey: number) {
    if (!dataKey) {
      return undefined;
    }

    return Buffer.from(dataKey.toString())
                 .toString("base64");
  }
}