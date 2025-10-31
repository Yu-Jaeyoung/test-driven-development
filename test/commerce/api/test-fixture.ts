import { INestApplication } from "@nestjs/common";
import request, { Test } from "supertest";
import type { CreateShopperCommand } from "@src/commerce/command/create-shopper-command";
import type { IssueShopperToken } from "@src/commerce/query/issue-shopper-token";
import { EmailGenerator } from "@test/commerce/email-generator";
import { UsernameGenerator } from "@test/commerce/username-generator";
import { PasswordGenerator } from "@test/commerce/password-generator";
import { IssueSellerToken } from "@src/commerce/query/issue-seller-token";
import { CreateSellerCommand } from "@src/commerce/command/create-seller-command";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

type AuthClient = {
  get: (url: string) => Test;
  post: (url: string) => Test;
  patch: (url: string) => Test;
  delete: (url: string) => Test;
}

export class TestFixture {
  private testClient: AuthClient;

  constructor(private app: INestApplication) {
    this.app = app;
    this.testClient = request(this.app.getHttpServer());
  }

  client() {
    return this.testClient;
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

    await this.testClient
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

  async setShopperAsDefaultUser(
    email: string,
    password: string,
  ) {
    const token = await this.issueShopperToken(email, password);
    this.testClient = this.createDefaultTestClient(token);
  }


  async createSellerThenSetAsDefaultUser() {
    const email = generateEmail();
    const password = generatePassword();
    await this.createSeller(email, generateUsername(), password);
    await this.setSellerAsDefaultUser(email, password);
  }

  async createSeller(
    email: string,
    username: string,
    password: string,
  ) {
    const command: CreateSellerCommand = {
      email,
      username,
      password,
    };

    return this.testClient
               .post("/seller/signUp")
               .send(command);
  }

  async setSellerAsDefaultUser(
    email: string,
    password: string,
  ) {
    const token = await this.issueSellerToken(email, password);
    this.testClient = this.createDefaultTestClient(token);
  }

  async issueSellerToken(
    email: string,
    password: string,
  ) {

    const tokenData: IssueSellerToken = {
      email,
      password,
    };

    const response = await this.client()
                               .post("/seller/issueToken")
                               .send(tokenData);

    return response.body.accessToken;
  }

  createDefaultTestClient(token: string) {
    const server = this.app.getHttpServer();

    return {
      get: (url: string) => request(server)
        .get(url)
        .set("Authorization", `Bearer ${ token }`),
      post: (url: string) => request(server)
        .post(url)
        .set("Authorization", `Bearer ${ token }`),
      patch: (url: string) => request(server)
        .patch(url)
        .set("Authorization", `Bearer ${ token }`),
      delete: (url: string) => request(server)
        .delete(url)
        .set("Authorization", `Bearer ${ token }`),
    };
  }
}
