import request from "supertest";
import { Repository } from "typeorm";
import { AppModule } from "@src/app.module";
import { Shopper } from "@src/commerce/shopper";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "bun:test";
import { CreateShopperCommand } from "@src/commerce/command/create-shopper-command";
import { EmailGenerator } from "@test/commerce/email-generator";
import { UsernameGenerator } from "@test/commerce/username-generator";
import { PasswordGenerator } from "@test/commerce/password-generator";
import { invalidPassword } from "@test/commerce/test-data-source";
import { HttpStatus, INestApplication } from "@nestjs/common";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

describe("POST /shopper/signUp", () => {
  let app: INestApplication;
  let shopperRepository: Repository<Shopper>;

  beforeAll(async() => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
                                                     imports: [ AppModule ],
                                                   })
                                                   .compile();

    app = moduleFixture.createNestApplication();
    shopperRepository = moduleFixture.get(getRepositoryToken(Shopper));
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
      .toBe(HttpStatus.BAD_REQUEST);
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
      .toBe(HttpStatus.BAD_REQUEST);
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
      .toBe(HttpStatus.BAD_REQUEST);
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
      .toBe(HttpStatus.BAD_REQUEST);
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
      .toBe(HttpStatus.BAD_REQUEST);
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
      .toBe(HttpStatus.BAD_REQUEST);
  });

  it("email_속성에_이미_존재하는_이메일_주소가_지정되면_400_Bad_Request_상태코드를_반환한다", async() => {
    const email = generateEmail();

    // Arrange
    await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send({
        email,
        username: generateUsername(),
        password: generatePassword(),
      });

    // Act
    const response = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send({
        email,
        username: generateUsername(),
        password: generatePassword(),
      });

    // Assert
    expect(response.status)
      .toBe(HttpStatus.BAD_REQUEST);
  });

  it("username_속성이_이미_존재하는_사용자_이름이_지정되면_400_Bad_Request_상태코드를_반환한다", async() => {
    const username = generateUsername();

    // Arrange
    await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send({
        email: generateEmail(),
        username,
        password: generatePassword(),
      });

    // Act
    const response = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send({
        email: generateEmail(),
        username,
        password: generatePassword(),
      });

    // Assert
    expect(response.status)
      .toBe(HttpStatus.BAD_REQUEST);
  });

  it("비밀번호를 올바르게 암호화한다", async() => {
    // Arrange
    const command: CreateShopperCommand = {
      email: generateEmail(),
      username: generateUsername(),
      password: generatePassword(),
    };

    // Act
    const result = await request(app.getHttpServer())
      .post("/shopper/signUp")
      .send(command);

    const shopper = await shopperRepository.findOneBy({ email: command.email! });
    const isMatch = await Bun.password.verify(command.password!, shopper?.hashedPassword!);

    // Assert
    expect(isMatch)
      .toBe(true);
  });
});