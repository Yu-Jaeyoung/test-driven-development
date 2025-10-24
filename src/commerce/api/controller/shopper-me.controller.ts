import { Controller, Get } from "@nestjs/common";

@Controller("/shopper")
export class ShopperMeController {

  @Get("/me")
  async me() {

  }
}
