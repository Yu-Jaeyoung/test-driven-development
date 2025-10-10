import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import type { CreateShopperCommand } from "@/commerce/command/create-shopper-command";
import { isEmailValid, isPasswordValid, isUsernameValid } from "@/commerce/user-property-validator";
import { Repository } from "typeorm";
import { Shopper } from "@/commerce/shopper";
import { InjectRepository } from "@nestjs/typeorm";

@Controller("/shopper")
export class ShopperSignupController {
  constructor(
    @InjectRepository(Shopper)
    private readonly shopperRepository: Repository<Shopper>,
  ) {}

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

    const hashedPassword = await Bun.password.hash(command.password!, {
      algorithm: "bcrypt",
    });

    try {
      await this.shopperRepository.save({
        email: command.email,
        username: command.username,
        hashedPassword,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    }

    return res.status(HttpStatus.NO_CONTENT)
              .send();
  }

  private isCommandValid(command: CreateShopperCommand) {
    return isEmailValid(command.email)
      && isUsernameValid(command.username)
      && isPasswordValid(command.password);
  }
}