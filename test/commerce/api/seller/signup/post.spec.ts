import { beforeAll, describe, expect, it } from "bun:test";
import { Test, TestingModule } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { EmailGenerator } from "../../../email-generator";
import { UsernameGenerator } from "../../../username-generator";
import { PasswordGenerator } from "../../../password-generator";
import { AppModule } from "@/app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Seller } from "@/commerce/seller";
import { Repository } from "typeorm";
import type { CreateSellerCommand } from "@/commerce/command/create-seller-command";
import { invalidPassword } from "../../../test-data-source";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

describe("POST /seller/signUp", () => {
  let app: INestApplication;
  let sellerRepository: Repository<Seller>;

  beforeAll(async() => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
                                                     imports: [ AppModule ],
                                                   })
                                                   .compile();

    app = moduleFixture.createNestApplication();
    sellerRepository = moduleFixture.get(getRepositoryToken(Seller));
    await app.init();
  });

  it("올바르게_요청하면_204_No_Content_상태코드를_반환한다", async() => {
    // Arrange
    const command: CreateSellerCommand = {
      email: generateEmail(),
      username: generateUsername(),
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
      username: generateUsername(),
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
      username: generateUsername(),
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
      email: generateEmail(),
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
      email: generateEmail(),
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
      email: generateEmail(),
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
      email: generateEmail(),
      username: generateUsername(),
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

  it.each(invalidPassword())("password_속성이_올바른_형식을_따르지_않으면_400_Bad_Request_상태코드를_반환한다", async(password: string) => {
    // Arrange
    const command: CreateSellerCommand = {
      email: generateEmail(),
      username: generateUsername(),
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
    const email = generateEmail();

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send({
        email,
        username: generateUsername(),
        password: "password",
      });

    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
      .send({
        email,
        username: generateUsername(),
        password: "password",
      });

    // Assert
    expect(response.status)
      .toBe(400);
  });

  it("username_속성에_이미_존재하는_사용자이름이_지정되면_400_Bad_Request_상태코드를_반환한다", async() => {
    // Arrange
    const username = generateUsername();

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send({
        email: generateEmail(),
        username,
        password: "password",
      });

    const response = await request(app.getHttpServer())
      .post("/seller/signUp")
      .send({
        email: generateEmail(),
        username,
        password: "password",
      });

    // Assert
    expect(response.status)
      .toBe(400);
  });


  it("비밀번호를_올바르게_암호화한다", async() => {

    // Arrange
    const command: CreateSellerCommand = {
      email: generateEmail(),
      username: generateUsername(),
      password: generatePassword(),
    };

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    // Assert
    const seller = await sellerRepository.findOneBy({ email: command.email! });
    const isMatch = await Bun.password.verify(command.password!, seller?.hashedPassword!);

    expect(isMatch)
      .toBe(true);
  });
});