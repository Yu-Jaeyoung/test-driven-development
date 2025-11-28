import { INestApplication } from "@nestjs/common";
import request, { Test } from "supertest";
import type { CreateShopperCommand } from "@src/commerce/command/create-shopper-command";
import type { IssueShopperToken } from "@src/commerce/query/issue-shopper-token";
import type { IssueSellerToken } from "@src/commerce/query/issue-seller-token";
import type { CreateSellerCommand } from "@src/commerce/command/create-seller-command";
import type { RegisterProductCommand } from "@src/commerce/command/register-product-command";
import { EmailGenerator } from "@test/commerce/email-generator";
import { UsernameGenerator } from "@test/commerce/username-generator";
import { PasswordGenerator } from "@test/commerce/password-generator";
import { RegisterProductCommandGenerator } from "@test/commerce/register-product-command-generator";
import { Product } from "@src/commerce/product";
import { Repository } from "typeorm";

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

  constructor(
    private app: INestApplication,
    private readonly productRepository?: Repository<Product>,
  ) {
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

  async createShopperThenSetAsDefaultUser() {
    const email = generateEmail();
    const password = generatePassword();
    await this.createShopper(email, generateUsername(), password);
    await this.setShopperAsDefaultUser(email, password);
  }

  async registerProduct(command?: RegisterProductCommand) {
    const cmd = command ?? RegisterProductCommandGenerator.generateRegisterProductCommand();

    const response = await this.client()
                               .post("/seller/products")
                               .send(cmd);

    const path = response.headers["location"];

    return path.split("/seller/products/")[1];
  }

  async registerProducts(count?: number) {
    if (count) {
      const ids: string[] = [];

      for (let i = 0; i < count; i++) {
        ids.push(await this.registerProduct());
      }

      return ids;
    }

    return Array.of(
      await this.registerProduct(),
      await this.registerProduct(),
      await this.registerProduct(),
    );
  }

  async deleteAllProducts() {
    await this.productRepository?.deleteAll();
  }

  async getSeller() {
    return this.client()
               .get("/seller/me");
  }

  async consumeProductPage() {
    const response = await this.client()
                               .get("/shopper/products");

    return response.body.continuationToken;
  }
}
