import { Controller, Get } from "@nestjs/common";

@Controller("/seller/")
export class SellerMeController {
  @Get("/me")
  async me() {

  }
}
