import { Function, Optional } from "@src/common/types";
import { Product } from "@src/commerce/product";
import { NotFoundException } from "@nestjs/common";
import { ProductMapper } from "@src/commerce/querymodel/product-mapper";
import { ArrayCarrier } from "@src/commerce/view/array-carrier";

export class GetSellerProductsQueryProcessor {
  constructor(
    private readonly getProducts: Function<GetSellerProducts, Optional<Product[]>>,
  ) {}

  async apply(query: GetSellerProducts): Promise<Optional<Product[]>> {
    return await this.getProducts.apply(query);
  }

  async process(
    query: GetSellerProducts,
  ): Promise<ArrayCarrier<SellerProductView>> {
    const products = await this.apply(query) ?? [];

    if (!products) {
      throw new NotFoundException();
    }

    products.sort((
      productA,
      productB,
    ) => productB.registeredTimeUtc.getTime() - productA.registeredTimeUtc.getTime());

    return {
      items: products.map((product) =>
        ProductMapper.convertToView(product)),
    };
  }
}