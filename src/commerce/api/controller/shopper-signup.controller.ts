import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import type { CreateShopperCommand } from "@src/commerce/command/create-shopper-command";
import { isEmailValid, isPasswordValid, isUsernameValid } from "@src/commerce/user-property-validator";
import { Repository } from "typeorm";
import { Shopper } from "@src/commerce/shopper";
import { InjectRepository } from "@nestjs/typeorm";
import { Public } from "@src/commerce/public.decorator";

@Controller("/shopper")
export class ShopperSignupController {
  constructor(
    @InjectRepository(Shopper)
    private readonly shopperRepository: Repository<Shopper>,
  ) {}

  @Public()
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

    const id = crypto.randomUUID();

    try {
      await this.shopperRepository.save({
        id,
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