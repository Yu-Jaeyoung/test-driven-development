import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res } from "@nestjs/common";
import { Product } from "@src/commerce/product";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterProductCommandExecutor } from "@src/commerce/commandmodel/register-product-command-executor";
import type { Optional } from "@src/common/types";
import { Consumer, Function } from "@src/common/types";
import { FindSellerProductQueryProcessor } from "@src/commerce/querymodel/find-seller-product-query-processor";
import type { Response } from "express";
import type { RegisterProductCommand } from "@src/commerce/command/register-product-command";
import { GetSellerProductsQueryProcessor } from "@src/commerce/querymodel/get-seller-products-query-processor";

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
    const saveProduct = new Consumer<Product>(async(product) => await this.productRepository.save(product));

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
    const sellerId = req.user.sub;
    const productId = id;

    const findProduct = new Function<FindSellerProduct, Optional<Product>>(
      async(query: FindSellerProduct) => await (await this.productRepository.findOneBy(
        {
          id: query.productId,
          sellerId: query.sellerId,
        },
      )) as Optional<Product>,
    );

    const processor = new FindSellerProductQueryProcessor(findProduct);
    const query: FindSellerProduct = { sellerId, productId };

    await processor.process(query)
                   .then(
                     (productView) => res.status(HttpStatus.OK)
                                         .send(productView),
                   )
                   .catch(
                     () => res.status(HttpStatus.NOT_FOUND)
                              .send(),
                   );
  }

  @Get("/products")
  async getProducts(
    @Req()
    req: Request & { user: { sub: string } },
    @Res()
    res: Response,
  ) {
    const sellerId = req.user.sub;

    const getProductsOfSeller = new Function<GetSellerProducts, Optional<Product[]>>(
      async(query: GetSellerProducts) => await (await this.productRepository.findBy(
        {
          sellerId: query.sellerId,
        },
      )) as Optional<Product[]>,
    );

    const processor = new GetSellerProductsQueryProcessor(getProductsOfSeller);
    const query: GetSellerProducts = { sellerId };

    await processor.process(query)
                   .then(
                     (productView) => res.status(HttpStatus.OK)
                                         .send(productView),
                   )
                   .catch(
                     () => res.status(HttpStatus.NOT_FOUND)
                              .send(),
                   );
  }
}