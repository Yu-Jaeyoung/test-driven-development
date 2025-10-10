import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seller } from "@/commerce/seller";
import type { CreateSellerCommand } from "@/commerce/command/create-seller-command";
import { isEmailValid, isUsernameValid } from "@/commerce/user-property-validator";

@Controller("/seller")
export class SellerSignUpController {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

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

  private isCommandValid(command: CreateSellerCommand): boolean {
    return isEmailValid(command.email)
      && isUsernameValid(command.username)
      && this.isPasswordValid(command.password);
  }

  private isPasswordValid(password: string | undefined): boolean {
    return password !== undefined && password.length >= 8;
  }
}

