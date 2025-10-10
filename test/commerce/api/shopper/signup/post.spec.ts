import { beforeAll, describe, expect, it } from "bun:test";
import type { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@/app.module";
import { CreateShopperCommand } from "@/commerce/command/create-shopper-command";
import { EmailGenerator } from "../../../email-generator";
import { UsernameGenerator } from "../../../username-generator";
import { PasswordGenerator } from "../../../password-generator";
import request from "supertest";
import { invalidPassword } from "../../../test-data-source";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

describe("POST /shopper/signUp", () => {
  let app: INestApplication;

  beforeAll(async() => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
                                                     imports: [ AppModule ],
                                                   })
                                                   .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("올바르게_요청하면_204_No_Content_상태코드를_반환한다", async() => {
    // Arrange
    const command: CreateShopperCommand = {
      email: generateEmail(),
      username: generateUsername(),
      password: generatePassword(),
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(204);
  });

  it("email_속성이_지정되지_않으면_400_Bad_Request_상태코드를_반환한다", async() => {
    // Arrange
    const command: CreateShopperCommand = {
      email: undefined,
      username: generateUsername(),
      password: generatePassword(),
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it.each([
    "invalid-email",
    "invalid-email@",
    "invalid-email@test",
    "invalid-email@test.",
    "invalid-email@.com",
  ])("email_속성이_올바른_형식을_따르지_않으면_400_Bad_Request_상태코드를_반환한다", async(email: string) => {
    // Arrange
    const command: CreateShopperCommand = {
      email,
      username: generateUsername(),
      password: generatePassword(),
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it("username_속성이_지정되지_않으면_400_Bad_Request_상태코드를_반환한다", async() => {
    // Arrange
    const command: CreateShopperCommand = {
      email: generateEmail(),
      username: undefined,
      password: generatePassword(),
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it.each([
    "",
    "sh",
    "shopper ",
    "shopper.",
    "shopper!",
    "shopper@",
  ])("username_속성이_올바른_형식을_따르지_않으면_400_Bad_Request_상태코드를_반환한다", async(username: string) => {
    // Arrange
    const command: CreateShopperCommand = {
      email: generateEmail(),
      username,
      password: generatePassword(),
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it.each([
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "0123456789",
    "shopper_",
    "shopper-",
  ])("username 속성이 올바른 형식을 따르면 204 No Content 상태코드를 반환한다", async(username: string) => {
    // Arrange
    const command: CreateShopperCommand = {
      email: generateEmail(),
      username,
      password: generatePassword(),
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(204);
  });

  it("password 속성이 지정되지 않으면 400 Bad Request 상태코드를 반환한다", async() => {
    // Arrange
    const command: CreateShopperCommand = {
      email: generateEmail(),
      username: generateUsername(),
      password: undefined,
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it.each(invalidPassword())("password_속성이_올바른_형식을_따르지_않으면_400_Bad_Request_상태코드를_반환한다", async(password: string) => {
    // Arrange
    const command: CreateShopperCommand = {
      email: generateEmail(),
      username: generateUsername(),
      password,
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });
});