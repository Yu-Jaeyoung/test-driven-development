import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seller } from "@src/commerce/seller";
import type { CreateSellerCommand } from "@src/commerce/command/create-seller-command";
import { isEmailValid, isPasswordValid, isUsernameValid } from "@src/commerce/user-property-validator";
import { Public } from "@src/commerce/public.decorator";

@Controller("/seller")
export class SellerSignUpController {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  @Public()
  @Post("/signUp")
  async signUp(
    @Res()
    res: Response,
    @Body()
    command: CreateSellerCommand,
  ) {
    if (this.isCommandValid(command) === false) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    }

    const hashedPassword = await Bun.password.hash(command.password!, {
      algorithm: "bcrypt",
    });

    try {
      await this.sellerRepository.save({
        id: crypto.randomUUID(),
        email: command.email,
        username: command.username,
        hashedPassword,
        contactEmail: command.contactEmail,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    }

    return res.status(HttpStatus.NO_CONTENT)
              .send();
  }

  private isCommandValid(command: CreateSellerCommand): boolean {
    return isEmailValid(command.email)
      && isUsernameValid(command.username)
      && isPasswordValid(command.password)
      && isEmailValid(command.contactEmail);
  }
}

