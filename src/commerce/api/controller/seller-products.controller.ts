import type { Response } from "express";
import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res } from "@nestjs/common";
import type { RegisterProductCommand } from "@src/commerce/command/register-product-command";
import { Product } from "@src/commerce/product";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Controller("/seller")
export class SellerProductsController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  @Post("/products")
  async registerProduct(
    @Req()
    req: Request & { user: { sub: string } },
    @Res()
    res: Response,
    @Body()
    command: RegisterProductCommand,
  ) {
    if (this.isValidUri(command.imageUri) == false) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    }

    const id = crypto.randomUUID();

    await this.productRepository.save({
      id,
      sellerId: req.user.sub,
      name: command.name,
      imageUri: command.imageUri,
      description: command.description,
      priceAmount: BigInt(command.priceAmount),
      stockQuantity: command.stockQuantity,
      registeredTimeUtc: new Date()
    });

    const url = `/seller/products/${ id }`;

    return res.setHeader("location", url)
              .status(HttpStatus.CREATED)
              .send();
  }

  @Get("/products/:id")
  async findProduct(
    @Req()
    req: Request & { user: { sub: string } },
    @Res()
    res: Response,
    @Param("id")
    id: string,
  ) {
    const product = await this.productRepository.findOneBy({
      id,
      sellerId: req.user.sub,
    });

    if (!product) {
      return res.status(HttpStatus.NOT_FOUND)
                .send();
    }

    const sellerProductView: SellerProductView = {
      id: product.id,
      name: product.name,
      imageUri: product.imageUri,
      description: product.description,
      priceAmount: product.priceAmount.toString(),
      stockQuantity: product.stockQuantity,
      registeredTimeUtc: product.registeredTimeUtc,
    };

    return res.status(HttpStatus.OK)
              .send(sellerProductView);
  }

  private isValidUri(value: string) {

    try {
      new URL(value);
      return true;
    } catch (error) {
      return false;
    }
  }
}