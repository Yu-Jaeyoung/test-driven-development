export interface RegisterProductCommand {
  name: string,
  imageUri: string,
  description: string,
  priceAmount: string,
  stockQuantity: number
}