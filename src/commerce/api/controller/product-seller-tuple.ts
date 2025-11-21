import { Product } from "@src/commerce/product";
import { Seller } from "@src/commerce/seller";

export interface ProductSellerTuple {
  product: Product;
  seller: Seller;
}