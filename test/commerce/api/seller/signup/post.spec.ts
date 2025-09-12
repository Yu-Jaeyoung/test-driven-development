import { beforeAll, describe, expect, it } from "bun:test";
import { Test, TestingModule } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "@/app.module";
import { CreateSellerCommand } from "@/commerce/command/create-seller-command";

describe("POST /seller/signUp", () => {
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
    const command: CreateSellerCommand = {
      email: "seller@test.com",
      username: "seller",
      password: "password",
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(204);
  });

  it("email_속성이_지정되지_않으면_400_Bad_Request_상태코드를_반환한다", async() => {
    // Arrange
    const command: CreateSellerCommand = {
      email: undefined,
      username: "seller",
      password: "password",
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
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
    const command: CreateSellerCommand = {
      email,
      username: "seller",
      password: "password",
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it("username_속성이_지정되지_않으면_400_Bad_Request_상태코드를_반환한다", async() => {
    // Arrange
    const command: CreateSellerCommand = {
      email: "seller@test.com",
      username: undefined,
      password: "password",
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it.each([
    "",
    "se",
    "seller ",
    "seller.",
    "seller!",
    "seller@",
  ])("username_속성이_올바른_형식을_따르지_않으면_400_Bad_Request_상태코드를_반환한다", async(username: string) => {
    // Arrange
    const command: CreateSellerCommand = {
      email: "seller@test.com",
      username,
      password: "password",
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it.each([
    "seller",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "0123456789",
    "seller_",
    "seller-",
  ])("username_속성이_올바른_형식을_따르면_204_No_Content_상태코드를_반환한다", async(username: string) => {
    // Arrange
    const command: CreateSellerCommand = {
      email: "seller@test.com",
      username,
      password: "password",
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(204);
  });

  it("password_속성이_지정되지_않으면_400_Bad_Request_상태코드를_반환한다", async() => {
    // Arrange
    const command: CreateSellerCommand = {
      email: "seller@test.com",
      username: "seller",
      password: undefined,
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it.each([
    "",
    "pass",
    "pass123",
  ])("password_속성이_올바른_형식을_따르지_않으면_400_Bad_Request_상태코드를_반환한다", async(password: string) => {
    // Arrange
    const command: CreateSellerCommand = {
      email: "seller@test.com",
      username: "seller",
      password,
    };

    // Act
    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it("email_속성에_이미_존재하는_이메일_주소가_지정되면_400_Bad_Request_상태코드를_반환한다", async() => {
    // Arrange
    const email = "seller@test.com";

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send({
        email,
        username: "seller",
        password: "password",
      });

    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
      .send({
        email,
        username: "seller",
        password: "password",
      });

    // Assert
    expect(response.status)
      .toBe(400);
  });
})
;