import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import type { CreateShopperCommand } from "@/commerce/command/create-shopper-command";
import { isEmailValid, isUsernameValid } from "@/commerce/user-property-validator";

@Controller("/shopper")
export class ShopperSignupController {
  @Post("/signUp")
  async signUp(
    @Res()
    res: Response,
    @Body()
    command: CreateShopperCommand,
  ) {
    if (this.isCommandValid(command) === false) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    }

    return res.status(HttpStatus.NO_CONTENT)
              .send();
  }

  private isCommandValid(command: CreateShopperCommand) {
    return isEmailValid(command.email) && isUsernameValid(command.username);
  }
}