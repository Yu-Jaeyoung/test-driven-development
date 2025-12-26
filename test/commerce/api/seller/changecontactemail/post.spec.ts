import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { TestFixture } from "@test/commerce/api/test-fixture";
import { EmailGenerator } from "@test/commerce/email-generator";
import { invalidEmails } from "@test/commerce/test-data-source";
import { beforeAll, describe, expect, it } from "bun:test";
import request from "supertest";
import { SellerMeView } from "@src/commerce/view/seller-me-view";

const { generateEmail } = EmailGenerator;

describe("POST /seller/changeContactEmail", () => {
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

  it("올바르게_요청하면_204_No_Content_상태코드를_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const contactEmail = generateEmail();

    const command: ChangeContactEmailCommand = {
      contactEmail,
    };

    // Act
    const response = await fixture.client()
      .post("/seller/changeContactEmail")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(HttpStatus.NO_CONTENT);
  });

  it.each(invalidEmails())("contactEmail_속성이_올바르게_지정되지_않으면_400_Bad_Request_상태코드를_반환한다", async(invalidEmail: string) => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();

    const command: ChangeContactEmailCommand = {
      contactEmail: invalidEmail,
    };

    // Act
    const response = await fixture.client()
      .post("/seller/changeContactEmail")
      .send(command);

    // Assert
    expect(response.status)
      .toBe(HttpStatus.BAD_REQUEST);
  });

  it("문의_이메일_주소를_올바르게_변경한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const contactEmail = generateEmail();

    const command: ChangeContactEmailCommand = {
      contactEmail,
    };

    // Act
    await fixture.client()
      .post("/seller/changeContactEmail")
      .send(command);

    const seller = await fixture.getSeller();

    // Assert
    expect(contactEmail)
      .toEqual(seller.body.contactEmail);
  });
});