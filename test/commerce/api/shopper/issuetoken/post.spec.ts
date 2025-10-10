import { beforeAll, describe, it, expect } from "bun:test";
import { EmailGenerator } from "../../../email-generator";
import { UsernameGenerator } from "../../../username-generator";
import { PasswordGenerator } from "../../../password-generator";
import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@/app.module";
import type { INestApplication } from "@nestjs/common";
import { CreateShopperCommand } from "@/commerce/command/create-shopper-command";
import { IssueShopperToken } from "@/commerce/query/issue-shopper-token";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

describe("POST /shopper/issueToken", () => {
  let app: INestApplication;

  beforeAll(async() => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
                                                     imports: [ AppModule ],
                                                   })
                                                   .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("올바르게_요청하면_200_OK_상태코드와_접근_토큰을_반환한다", async() => {
    // Arrange
    const email = generateEmail();
    const password = generatePassword();

    const command: CreateShopperCommand = {
      email,
      username: generateUsername(),
      password,
    };

    const token: IssueShopperToken = {
      email,
      password,
    };

    // Act
    await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send(command);

    const response = await request(app.getHttpServer())
      .post("/shopper/issueToken")
      .send(token);

    // Assert
    expect(response.status)
      .toBe(200);
    expect(response.body)
      .toBeDefined();
    expect(response.body.accessToken)
      .toBeDefined();
  });

});