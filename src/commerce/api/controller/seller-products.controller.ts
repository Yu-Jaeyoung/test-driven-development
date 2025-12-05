import type { Response } from "express";
import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res } from "@nestjs/common";
import type { RegisterProductCommand } from "@src/commerce/command/register-product-command";
import { Product } from "@src/commerce/product";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ArrayCarrier } from "@src/commerce/view/array-carrier";
import { RegisterProductCommandExecutor } from "@src/commerce/commandmodel/register-product-command-executor";
import type { Consumer } from "@src/common/types";

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
    const id = crypto.randomUUID();
    const sellerId = req.user.sub;
    const saveProduct: Consumer<Product> = async(product) => await this.productRepository.save(product);

    const executor = new RegisterProductCommandExecutor(saveProduct);
    await executor.execute(id, sellerId, command);

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

    const sellerProductView: SellerProductView = this.convertToView(product);

    return res.status(HttpStatus.OK)
              .send(sellerProductView);
  }

  private convertToView(product: Product) {
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

  @Get("/products")
  async getProducts(
    @Req()
    req: Request & { user: { sub: string } },
    @Res()
    res: Response,
  ) {
    const products = await this.productRepository.findBy(
      {
        sellerId: req.user.sub,
      },
    );

    products.sort((
      productA,
      productB,
    ) => productB.registeredTimeUtc.getTime() - productA.registeredTimeUtc.getTime());

    const carrier: ArrayCarrier<SellerProductView> = {
      items: products.map((product) => this.convertToView(product)),
    };

    return res.status(HttpStatus.OK)
              .send(carrier);
  }
}