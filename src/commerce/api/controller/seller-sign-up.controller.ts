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

    const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (command.email === undefined) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    } else if (!command.email.includes("@")) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    } else if (command.email.endsWith("@")) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    } else if (command.email.match(emailRegex) === null) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    } else {
      return res.status(HttpStatus.NO_CONTENT)
                .send();
    }

  }
}

