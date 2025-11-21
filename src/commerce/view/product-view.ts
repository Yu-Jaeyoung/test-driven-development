import { SellerView } from "@src/commerce/view/seller-view";

export interface ProductView {
  id: string;
  seller: SellerView | undefined;
  name: string | undefined;
  imageUri: string | undefined;
  description: string | undefined;
  priceAmount: string | undefined;
  stockQuantity: number;
}