import { Module } from "@nestjs/common";
import { SellerSignUpController } from "@/commerce/api/controller/seller-sign-up.controller";

@Module({
  controllers: [
    SellerSignUpController,
  ],
})
export class AppModule {
}
