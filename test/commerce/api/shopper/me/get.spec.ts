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
                                  .set("Authorization", `Bearer ${ token }`)
                                  .send();

    // Assert
    expect(response.status)
      .toBe(200);
  });
});