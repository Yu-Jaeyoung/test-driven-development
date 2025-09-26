import { beforeAll, describe, expect, it } from "bun:test";
import { EmailGenerator } from "../../../email-generator";
import { UsernameGenerator } from "../../../username-generator";
import { PasswordGenerator } from "../../../password-generator";
import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@/app.module";
import type { INestApplication } from "@nestjs/common";
import { IssueSellerToken } from "@/commerce/query/issue-seller-token";
import { CreateSellerCommand } from "@/commerce/command/create-seller-command";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

describe("POST /seller/issueToken", () => {
  let app: INestApplication;

  beforeAll(async() => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
                                                     imports: [ AppModule ],
                                                   })
                                                   .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it("올바르게_요청하면_200_OK_상태코드를_반환한다", async() => {
    // Arrange
    const email = generateEmail();
    const password = generatePassword();

    const command: CreateSellerCommand = {
      email,
      username: generateUsername(),
      password,
    };

    const token: IssueSellerToken = {
      email,
      password,
    };

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    const response = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(token);

    // Assert
    expect(response.status)
      .toBe(200);
  });

  it("올바르게_요청하면_접근_토큰을_반환한다", async() => {
    // Arrange
    const email = generateEmail();
    const password = generatePassword();

    const command: CreateSellerCommand = {
      email,
      username: generateUsername(),
      password,
    };

    const token: IssueSellerToken = {
      email,
      password,
    };

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    const response = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(token);

    // Assert
    expect(response.body)
      .toBeDefined();

    expect(response.body.accessToken)
      .toBeDefined();
  });
});