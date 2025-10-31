import { RegisterProductCommand } from "@src/commerce/command/register-product-command";

export class RegisterProductCommandGenerator {
  static generateRegisterProductCommand(): RegisterProductCommand {
    return {
      name: this.generateProductName(),
      imageUri: this.generateProductImageUri(),
      description: this.generateProductDescription(),
      priceAmount: this.generatePriceAmount(),
      stockQuantity: this.generateStockQuantity(),
    };
  }

  static generateProductName(): string {
    return "name" + crypto.randomUUID();
  }

  static generateProductImageUri(): string {
    return "https://test.com/images/" + crypto.randomUUID();
  }

  static generateProductDescription(): string {
    return "description" + crypto.randomUUID();
  }

  static generatePriceAmount() {
    const min = 10000;
    const max = 100000;

    const price = Math.floor(Math.random() * (max - min + 1)) + min;

    return BigInt(price).toString();
  }

  static generateStockQuantity(): number {
    const min = 10;
    const max = 100;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}