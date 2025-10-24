import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seller } from "@src/commerce/seller";
import { Shopper } from "@src/commerce/shopper";
import { SellerSignUpController } from "@src/commerce/api/controller/seller-sign-up.controller";
import { SellerIssueTokenController } from "@src/commerce/api/controller/seller-issue-token.controller";
import { ShopperSignupController } from "@src/commerce/api/controller/shopper-signup.controller";

import * as process from "node:process";
import { ShopperIssueTokenController } from "@src/commerce/api/controller/shopper-issue-token.controller";
import { SellerMeController } from "@src/commerce/api/controller/seller-me.controller";
import { ShopperMeController } from "@src/commerce/api/controller/shopper-me.controller";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      ssl: true,
      entities: [ Seller, Shopper ],
      synchronize: true,
      dropSchema: true,
    }),
    TypeOrmModule.forFeature([ Seller, Shopper ]),
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
  ],
})
export class AppModule {

}
