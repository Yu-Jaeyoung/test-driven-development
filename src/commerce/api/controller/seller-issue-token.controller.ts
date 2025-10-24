import { AccessTokenCarrier } from "@src/commerce/result/access-token-carrier";
import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { Seller } from "@src/commerce/seller";
import type { IssueSellerToken } from "@src/commerce/query/issue-seller-token";
import { InjectRepository } from "@nestjs/typeorm";
import { Public } from "@src/commerce/public.decorator";

@Controller("/seller")
export class SellerIssueTokenController {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  @Public()
  @Post("/issueToken")
  async issueToken(
    @Body()
    query: IssueSellerToken,
    @Res()
    res: Response,
  ) {
    const result: Seller | null = await this.sellerRepository.findOneBy({
        email: query.email,
      },
    );

    if (!result) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    }

    const passwordVerifiedResult = await Bun.password.verify(query.password, result.hashedPassword);

    if (!passwordVerifiedResult) {
      return res.status(HttpStatus.BAD_REQUEST)
                .send();
    }

    const token: AccessTokenCarrier = this.composeToken(result);

    return res.status(HttpStatus.OK)
              .send(token);
  }

  private composeToken(seller: Seller) {
    return { accessToken: this.jwtService.sign({ sub: seller.id }) };
  }
}