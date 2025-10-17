import request from "supertest";
import { AppModule } from "@src/app.module";
import { beforeAll, describe, expect, it } from "bun:test";
import { EmailGenerator } from "@test/commerce/email-generator";
import { PasswordGenerator } from "@test/commerce/password-generator";
import { UsernameGenerator } from "@test/commerce/username-generator";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import type { CreateSellerCommand } from "@src/commerce/command/create-seller-command";
import type { IssueSellerToken } from "@src/commerce/query/issue-seller-token";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

describe("GET /seller/me", () => {
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
    const username = generateUsername();
    const password = generatePassword();

    const command: CreateSellerCommand = {
      email,
      username,
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

    await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(token);

    const response = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", `Bearer ${ token }`)
      .send();

    // Assert
    expect(response.status)
      .toBe(200);
  });

  it("접근 토큰을 사용하지 않으면 401 Unauthorized 상태코드를 반환한다", async() => {
    // Act
    const response = await request(app.getHttpServer())
      .get("/seller/me")
      .send();

    // Assert
    expect(response.status)
      .toBe(401);
  });
});