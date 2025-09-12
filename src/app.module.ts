import { Module } from "@nestjs/common";
import { SellerSignUpController } from "@/commerce/api/controller/seller-sign-up.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seller } from "@/commerce/seller";
import * as process from "node:process";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      ssl: true,
      entities: [ Seller ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ Seller ]),
  ],
  controllers: [
    SellerSignUpController,
  ],
})
export class AppModule {

}
