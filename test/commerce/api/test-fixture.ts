import { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { CreateShopperCommand } from "@src/commerce/command/create-shopper-command";
import type { IssueShopperToken } from "@src/commerce/query/issue-shopper-token";
import { EmailGenerator } from "@test/commerce/email-generator";
import { UsernameGenerator } from "@test/commerce/username-generator";
import { PasswordGenerator } from "@test/commerce/password-generator";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

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

  async createShopperThenIssueToken() {
    const email = generateEmail();
    const password = generatePassword();

    await this.createShopper(email, generateUsername(), password);

    return await this.issueShopperToken(email, password);
  }
}
