import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seller } from "@/commerce/seller";

interface CreateSellerCommand {
  email?: string;
  username?: string;
  password?: string;
}

export const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
export const USER_NAME_REGEX: RegExp = /^[a-zA-Z0-9_-]{3,}$/;

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
    return this.isEmailValid(command.email)
      && this.isUsernameValid(command.username)
      && this.isPasswordValid(command.password);
  }

  private isEmailValid(email: string | undefined): boolean {
    return email !== undefined && EMAIL_REGEX.test(email);
  }

  private isUsernameValid(username: string | undefined): boolean {
    return username !== undefined && USER_NAME_REGEX.test(username);
  }

  private isPasswordValid(password: string | undefined): boolean {
    return password !== undefined && password.length >= 8;
  }
}

