import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import type { CreateSellerCommand } from "@/commerce/command/create-seller-command";

@Controller("/seller")
export class SellerSignUpController {
  constructor() {}

  @Post("/signUp")
  signUp(
    @Res()
    res: Response,
    @Body()
    command: CreateSellerCommand,
  ) {

    if (command.email === undefined) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    } else {
      return res.status(HttpStatus.NO_CONTENT)
                .send();
    }

  }
}

