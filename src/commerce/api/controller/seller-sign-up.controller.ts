import { Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";

@Controller("/seller")
export class SellerSignUpController {
  constructor() {}

  @Post("/signUp")
  signUp(
    @Res()
    res: Response,
  ) {
    return res.status(HttpStatus.NO_CONTENT)
              .send();
  }
}

