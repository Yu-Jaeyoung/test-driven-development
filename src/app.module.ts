import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seller } from "@/commerce/seller";
import { Shopper } from "@/commerce/shopper";
import { SellerSignUpController } from "@/commerce/api/controller/seller-sign-up.controller";
import { SellerIssueTokenController } from "@/commerce/api/controller/seller-issue-token.controller";
import { ShopperSignupController } from "@/commerce/api/controller/shopper-signup.controller";

import * as process from "node:process";
import { ShopperIssueTokenController } from "@/commerce/api/controller/shopper-issue-token.controller";

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
  ],
})
export class AppModule {

}
