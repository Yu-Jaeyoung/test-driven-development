import { beforeAll, describe, expect, it } from "bun:test";
import { INestApplication } from "@nestjs/common";
import { TestFixture } from "@test/commerce/api/test-fixture";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";

describe("GET /seller/products/:id", () => {
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
    await fixture.createSellerThenSetAsDefaultUser();

    const id = await fixture.registerProduct();

    console.info(id);
    // Act
    const response = await fixture.client()
                                  .get(`/seller/products/${ id }`)
                                  .send();

    // Assert
    expect(response.status)
      .toBe(200);
  });

  it("판매자가_아닌_사용자의_접근_토큰을_사용하면_403_Forbidden_상태코드를_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const id = await fixture.registerProduct();

    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products/${ id }`)
                                  .send();

    // Assert
    expect(response.status)
      .toBe(403);
  });
});