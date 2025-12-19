import request from "supertest";
import { AppModule } from "@src/app.module";
import { beforeAll, describe, expect, it } from "bun:test";
import { EmailGenerator } from "@test/commerce/email-generator";
import { PasswordGenerator } from "@test/commerce/password-generator";
import { UsernameGenerator } from "@test/commerce/username-generator";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import type { CreateSellerCommand } from "@src/commerce/command/create-seller-command";
import type { IssueSellerToken } from "@src/commerce/query/issue-seller-token";
import { SellerMeView } from "@src/commerce/view/seller-me-view";
import { TestFixture } from "@test/commerce/api/test-fixture";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

describe("GET /seller/me", () => {
  let app: INestApplication;
  let fixture: TestFixture;

  beforeAll(async() => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
                                                     imports: [ AppModule ],
                                                   })
                                                   .compile();

    app = moduleFixture.createNestApplication();
    fixture = new TestFixture(app);
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

    const responseToken = (await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(tokenData)).body.accessToken;

    const response = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", `Bearer ${ responseToken }`)
      .send();

    // Assert
    expect(response.status)
      .toBe(HttpStatus.OK);
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

  it("서로_다른_판매자의_식별자는_서로_다르다", async() => {
    // Arrange
    const email1 = generateEmail();
    const username1 = generateUsername();
    const password1 = generatePassword();

    const email2 = generateEmail();
    const username2 = generateUsername();
    const password2 = generatePassword();

    const command1: CreateSellerCommand = {
      email: email1,
      username: username1,
      password: password1,
      contactEmail: generateEmail(),
    };

    const command2: CreateSellerCommand = {
      email: email2,
      username: username2,
      password: password2,
      contactEmail: generateEmail(),
    };

    const token1: IssueSellerToken = {
      email: email1,
      password: password1,
    };

    const token2: IssueSellerToken = {
      email: email2,
      password: password2,
    };

    // Act
    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command1);

    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command2);

    const responseToken1 = (await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(token1)).body.accessToken;

    const responseToken2 = (await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(token2)).body.accessToken;

    const response1 = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", `Bearer ${ responseToken1 }`)
      .send();

    const response2 = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", `Bearer ${ responseToken2 }`)
      .send();

    // Assert
    expect(response1.body.id)
      .not
      .toEqual(response2.body.id);
  });

  it("같은_판매자의_식별자는_항상_같다", async() => {
    // Arrange
    const email = generateEmail();
    const username = generateUsername();
    const password = generatePassword();

    const command: CreateSellerCommand = {
      email,
      username,
      password,
      contactEmail: generateEmail(),
    };

    const data: IssueSellerToken = {
      email,
      password,
    };

    await request(app.getHttpServer())
      .post("/seller/signUp")
      .send(command);

    const responseToken1 = (await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(data)).body.accessToken;

    const responseToken2 = (await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(data)).body.accessToken;

    // Act
    const response1 = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", `Bearer ${ responseToken1 }`)
      .send();

    const response2 = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", `Bearer ${ responseToken2 }`)
      .send();

    // Assert
    expect(response1.body.id)
      .toEqual(response2.body.id);
  });

  it("판매자의_기본_정보가_올바르게_설정된다", async() => {
    // Arrange
    const email = generateEmail();
    const username = generateUsername();
    const password = generatePassword();

    const command: CreateSellerCommand = {
      email,
      username,
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

    const responseToken = (await request(app.getHttpServer())
      .post("/seller/issueToken")
      .send(tokenData)).body.accessToken;

    const response = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", `Bearer ${ responseToken }`)
      .send();

    // Assert
    const actual: SellerMeView = {
      ...response.body,
    };

    expect(actual)
      .toBeDefined();

    expect(actual.email)
      .toEqual(email);

    expect(actual.username)
      .toEqual(username);
  });

  it("문의_이메일_주소를_올바르게_설정한다", async() => {
    // Arrange
    const email = generateEmail();
    const username = generateUsername();
    const password = generatePassword();
    const contactEmail = generateEmail();

    await fixture.createSeller(email, username, password, contactEmail);

    // Act
    const token = await fixture.issueSellerToken(email, password);

    const response = await request(app.getHttpServer())
      .get("/seller/me")
      .set("Authorization", `Bearer ${ token }`)
      .send();

    // Assert
    const actual: SellerMeView = {
      ...response.body,
    };

    expect(actual)
      .toBeDefined();

    expect(actual.contactEmail)
      .toEqual(contactEmail);
  });
});