import { SellerView } from "@src/commerce/view/seller-view";

interface ProductView {
  id: string;
  seller: SellerView;
  name: string;
  imageUri: string;
  description: string;
  priceAmount: string;
  stockQuantity: number;
}