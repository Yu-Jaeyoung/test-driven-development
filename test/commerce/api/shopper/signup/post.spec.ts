import { beforeAll, describe, it, expect } from "bun:test";
import type { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@/app.module";
import { CreateShopperCommand } from "@/commerce/command/create-shopper-command";
import { EmailGenerator } from "../../../email-generator";
import { UsernameGenerator } from "../../../username-generator";
import { PasswordGenerator } from "../../../password-generator";
import request from "supertest";

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
});