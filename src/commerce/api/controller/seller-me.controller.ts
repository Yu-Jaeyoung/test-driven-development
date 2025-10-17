import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@/commerce/auth.guard";

@Controller("/seller")
export class SellerMeController {
  constructor(private readonly jwtService: JwtService) {}

  @Get("/me")
  @UseGuards(AuthGuard)
  async me() {

  }
}
