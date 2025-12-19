import request from "supertest";
import { AppModule } from "@src/app.module";
import { beforeAll, describe, expect, it } from "bun:test";
import { EmailGenerator } from "@test/commerce/email-generator";
import { UsernameGenerator } from "@test/commerce/username-generator";
import { PasswordGenerator } from "@test/commerce/password-generator";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import type { IssueSellerToken } from "@src/commerce/query/issue-seller-token";
import type { CreateSellerCommand } from "@src/commerce/command/create-seller-command";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

expect.extend({
  toBeValidBase64Url(received) {
    if (typeof received !== "string") {
      return {
        pass: false,
        message: () => `expected a string, but received ${ typeof received }`,
      };
    }

    try {
      Buffer.from(received, "base64url")
            .toString("utf8");
      return {
        pass: true,
        message: () => `expected "${ received }" not to be a valid Base64-URL encoded string`,
      };
    } catch (error) {
      return {
        pass: false,
        message: () =>
          `expected "${ received }" to be a valid Base64-URL encoded string, 
          but it failed to decode. \n Error ${ error.message }`,
      };
    }
  },
});

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
      contactEmail: generateEmail(),
    };

    const tokenData: IssueSellerToken = {
      email,
      password,
    };

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    const response = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(tokenData);

    // Assert
    expect(response.status)
      .toBe(HttpStatus.OK);
  });

  it("올바르게_요청하면_접근_토큰을_반환한다", async() => {
    // Arrange
    const email = generateEmail();
    const password = generatePassword();

    const command: CreateSellerCommand = {
      email,
      username: generateUsername(),
      password,
      contactEmail: generateEmail(),
    };

    const tokenData: IssueSellerToken = {
      email,
      password,
    };

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    const response = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(tokenData);

    // Assert
    expect(response.body)
      .toBeDefined();

    expect(response.body.accessToken)
      .toBeDefined();
  });

  it("접근_토큰은_JWT_형식을_따른다", async() => {
    // Arrange
    const email = generateEmail();
    const password = generatePassword();

    const command: CreateSellerCommand = {
      email,
      username: generateUsername(),
      password,
      contactEmail: generateEmail(),
    };

    const tokenData: IssueSellerToken = {
      email,
      password,
    };

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    const response = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(tokenData);

    // Assert
    const actual = response.body.accessToken;

    expect(actual)
      .toSatisfy((value: string) => {
        const parts = value.split(".");

        expect(parts.length)
          .toEqual(3);

        expect(parts[0])
          .toBeValidBase64Url();
        expect(parts[1])
          .toBeValidBase64Url();
        expect(parts[2])
          .toBeValidBase64Url();

        return true;
      });
  });

  it("존재하지_않는_이메일_주소가_사용되면_400_Bad_Request_상태코드를_반환한다", async() => {
    // Arrange
    const email = generateEmail();
    const password = generatePassword();

    const tokenData: IssueSellerToken = {
      email,
      password,
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(tokenData);

    // Assert
    expect(response.status)
      .toBe(HttpStatus.BAD_REQUEST);
  });

  it("잘못된_비밀번호가_사용되면_400_Bad_Request_상태코드를_반환한다", async() => {
    // Arrange
    const email = generateEmail();
    const password = generatePassword();
    const wrongPassword = generatePassword();

    const command: CreateSellerCommand = {
      email,
      username: generateUsername(),
      password,
      contactEmail: generateEmail(),
    };

    const tokenData: IssueSellerToken = {
      email,
      password: wrongPassword,
    };

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    const response = await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(tokenData);

    // Assert
    expect(response.status)
      .toBe(HttpStatus.BAD_REQUEST);
  });
});