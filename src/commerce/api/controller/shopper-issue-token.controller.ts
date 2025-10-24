import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Response } from "express";
import type { AccessTokenCarrier } from "@src/commerce/result/access-token-carrier";
import { InjectRepository } from "@nestjs/typeorm";
import { Shopper } from "@src/commerce/shopper";
import { Repository } from "typeorm";
import type { IssueShopperToken } from "@src/commerce/query/issue-shopper-token";
import { Public } from "@src/commerce/public.decorator";

@Controller("/shopper")
export class ShopperIssueTokenController {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Shopper)
    private readonly shopperRepository: Repository<Shopper>,
  ) {}

  @Public()
  @Post("/issueToken")
  async issueToken(
    @Body()
    query: IssueShopperToken,
    @Res()
    res: Response,
  ) {
    const result: Shopper | null = await this.shopperRepository.findOneBy({
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

  private composeToken(shopper: Shopper) {
    return { accessToken: this.jwtService.sign({ sub: shopper.id }) };
  }
}