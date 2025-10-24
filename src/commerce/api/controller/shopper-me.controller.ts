import { Controller, Get } from "@nestjs/common";

@Controller("/shopper")
export class ShopperMeController {

  @Get("/me")
  async me() {
    const shopperInfo: ShopperMeView = {
      id: crypto.randomUUID(),
      email: undefined,
      username: undefined,
    };

    return shopperInfo;
  }
}
