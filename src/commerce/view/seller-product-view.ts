interface SellerProductView {
  id: string;
  name: string | undefined;
  imageUri: string | undefined;
  description: string | undefined;
  priceAmount: string | undefined;
  stockQuantity: number | undefined;
  registeredTimeUtc: Date;
}