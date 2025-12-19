import { Product } from "@src/commerce/product";

export class ProductMapper {
  public static convertToView(product: Product) {
    return {
      id: product.id,
      name: product.name,
      imageUri: product.imageUri,
      description: product.description,
      priceAmount: product.priceAmount.toString(),
      stockQuantity: product.stockQuantity,
      registeredTimeUtc: product.registeredTimeUtc,
    };
  }
}