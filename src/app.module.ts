import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seller } from "@src/commerce/seller";
import { Shopper } from "@src/commerce/shopper";
import { Product } from "@src/commerce/product";
import { SellerSignUpController } from "@src/commerce/api/controller/seller-sign-up.controller";
import { SellerIssueTokenController } from "@src/commerce/api/controller/seller-issue-token.controller";
import { ShopperSignupController } from "@src/commerce/api/controller/shopper-signup.controller";

import * as process from "node:process";
import { ShopperIssueTokenController } from "@src/commerce/api/controller/shopper-issue-token.controller";
import { SellerMeController } from "@src/commerce/api/controller/seller-me.controller";
import { ShopperMeController } from "@src/commerce/api/controller/shopper-me.controller";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "@src/commerce/auth.guard";
import { SellerProductsController } from "@src/commerce/api/controller/seller-products.controller";
import { ShopperProductsController } from "@src/commerce/api/controller/shopper-products.controller";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      ssl: true,
      entities: [ Seller, Shopper, Product ],
      synchronize: true,
      dropSchema: true,
    }),
    TypeOrmModule.forFeature([ Seller, Shopper, Product ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [
    SellerSignUpController,
    SellerIssueTokenController,
    ShopperSignupController,
    ShopperIssueTokenController,
    SellerMeController,
    ShopperMeController,
    SellerProductsController,
    ShopperProductsController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {

}
