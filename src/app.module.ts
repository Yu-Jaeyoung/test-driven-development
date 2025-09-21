import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as process from "node:process";
import { ConfigModule } from "@nestjs/config";
import { Seller } from "@/commerce/seller";
import { SellerSignUpController } from "@/commerce/api/controller/seller-sign-up.controller";
import { SellerIssueTokenController } from "@/commerce/api/controller/seller-issue-token.controller";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      ssl: true,
      entities: [ Seller ],
      synchronize: true,
      dropSchema: true,
    }),
    TypeOrmModule.forFeature([ Seller ]),
  ],
  controllers: [
    SellerSignUpController,
    SellerIssueTokenController,
  ],
})
export class AppModule {

}
