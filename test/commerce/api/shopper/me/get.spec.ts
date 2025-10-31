import { beforeAll, describe, expect, it } from "bun:test";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { EmailGenerator } from "@test/commerce/email-generator";
import { UsernameGenerator } from "@test/commerce/username-generator";
import { PasswordGenerator } from "@test/commerce/password-generator";
import { TestFixture } from "@test/commerce/api/test-fixture";

const { generateEmail } = EmailGenerator;
const { generateUsername } = UsernameGenerator;
const { generatePassword } = PasswordGenerator;

describe("GET /shopper/me", () => {
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
    const password = generatePassword();

    await fixture.createShopper(email, generateUsername(), password);

    const token = await fixture.issueShopperToken(email, password);

    // Act
    const response = await fixture.client()
                                  .get("/shopper/me")
                                  .set("Authorization", `Bearer ${ token }`);

    // Assert
    expect(response.status)
      .toBe(200);
  });

  it("접근 토큰을 사용하지 않으면 401 Unauthorized 상태코드를 반환한다", async() => {
    // Act
    const response = await fixture.client()
                                  .get("/shopper/me")
                                  .send();

    expect(response.status)
      .toBe(401);
  });

  it("서로_다른_구매자의_식별자는_서로_다르다", async() => {
    // Arrange
    const token1 = await fixture.createShopperThenIssueToken();
    const token2 = await fixture.createShopperThenIssueToken();

    // Act
    const response1 = await fixture.client()
                                   .get("/shopper/me")
                                   .set("Authorization", `Bearer ${ token1 }`);

    const response2 = await fixture.client()
                                   .get("/shopper/me")
                                   .set("Authorization", `Bearer ${ token2 }`);

    // Assert
    expect(response1.body.id)
      .not
      .toEqual(response2.body.id);

  });

  it("같은_구매자의_식별자는_항상_같다", async() => {
    // Arrange
    const email = generateEmail();
    const password = generatePassword();

    await fixture.createShopper(email, generateUsername(), password);

    const token1 = await fixture.issueShopperToken(email, password);
    const token2 = await fixture.issueShopperToken(email, password);

    // Act
    const response1 = await fixture.client()
                                   .get("/shopper/me")
                                   .set("Authorization", `Bearer ${ token1 }`);

    const response2 = await fixture.client()
                                   .get("/shopper/me")
                                   .set("Authorization", `Bearer ${ token2 }`);

    // Assert
    expect(response1.body.id)
      .toEqual(response2.body.id);
  });

  it("구매자의_기본_정보가_올바르게_설정된다", async() => {
    // Arrange
    const email = generateEmail();
    const username = generateUsername();
    const password = generatePassword();

    await fixture.createShopper(email, username, password);
    await fixture.setShopperAsDefaultUser(email, password);

    // Act
    const response = await fixture.client()
                                  .get("/shopper/me");

    // Assert
    const actual: ShopperMeView = {
      ...response.body,
    };

    expect(actual)
      .toBeDefined();

    expect(actual.email)
      .toEqual(email);

    expect(actual.username)
      .toEqual(username);
  });
});