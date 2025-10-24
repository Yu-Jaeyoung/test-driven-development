import { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { CreateShopperCommand } from "@src/commerce/command/create-shopper-command";
import type { IssueShopperToken } from "@src/commerce/query/issue-shopper-token";

export class TestFixture {

  constructor(private app: INestApplication) {
  }

  client() {
    return request(this.app.getHttpServer());
  }

  async createShopper(
    email: string,
    username: string,
    password: string,
  ) {
    const command: CreateShopperCommand = {
      email,
      username,
      password,
    };

    await this.client()
              .post("/shopper/signUp")
              .send(command);

  }

  async issueShopperToken(
    email: string,
    password: string,
  ) {

    const tokenData: IssueShopperToken = {
      email,
      password,
    };

    const response = await this.client()
                               .post("/shopper/issueToken")
                               .send(tokenData);

    return response.body.accessToken;
  }
}
