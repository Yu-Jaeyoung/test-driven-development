import { Product } from "@src/commerce/product";
import type { RegisterProductCommand } from "@src/commerce/command/register-product-command";
import { InvalidCommandException } from "@src/commerce/commandmodel/invalid-command-exception";
import { Injectable } from "@nestjs/common";
import type { Consumer } from "@src/common/types";

@Injectable()
export class RegisterProductCommandExecutor {
  constructor(private saveProduct: Consumer<Product>) {
  }

  async execute(
    productId: string,
    sellerId: string,
    command: RegisterProductCommand,
  ) {
    this.validateCommand(command);
    const product = this.createProduct(command, productId, sellerId);

    await this.saveProduct.accept(product);
  }

  private validateCommand(command: RegisterProductCommand) {
    if (RegisterProductCommandExecutor.isValidUri(command.imageUri) == false) {
      throw new InvalidCommandException();
    }
  }

  public static isValidUri(value: string) {
    try {
      new URL(value);
      return true;
    } catch (error) {
      return false;
    }
  }

  public createProduct(
    command: RegisterProductCommand,
    productId: string,
    sellerId: string,
  ): Product {
    const product = new Product();
    product.id = productId;
    product.sellerId = sellerId;
    product.name = command.name;
    product.imageUri = command.imageUri;
    product.description = command.description;
    product.priceAmount = BigInt(command.priceAmount);
    product.stockQuantity = command.stockQuantity;
    product.registeredTimeUtc = new Date();

    return product;
  }
}
