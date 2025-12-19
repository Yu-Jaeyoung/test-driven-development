import { Product } from "@src/commerce/product";
import type { Optional } from "@src/common/types";
import { Function } from "@src/common/types";
import { NotFoundException } from "@nestjs/common";
import { ProductMapper } from "@src/commerce/querymodel/product-mapper";

export class FindSellerProductQueryProcessor {
  constructor(
    private readonly findProduct: Function<FindSellerProduct, Optional<Product>>,
  ) {}

  async apply(query: FindSellerProduct): Promise<Optional<Product>> {
    return await this.findProduct.apply(query);
  }

  async process(
    query: FindSellerProduct,
  ): Promise<SellerProductView> {
    const product = await this.apply(query);

    if (!product) {
      throw new NotFoundException();
    }

    return ProductMapper.convertToView(product);
  }
}