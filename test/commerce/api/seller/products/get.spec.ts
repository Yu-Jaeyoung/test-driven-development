import { beforeAll, describe, expect, it } from "bun:test";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { TestFixture } from "@test/commerce/api/test-fixture";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { Product } from "@src/commerce/product";

describe("GET /seller/products", () => {
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

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products`)
                                  .send();

    // Assert
    expect(response.status)
      .toBe(HttpStatus.OK);
  });

  it("판매자가_등록한_모든_상품을_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();

    const ids = await fixture.registerProducts();

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products`)
                                  .send();

    const actual = response.body;

    // Assert
    expect(actual)
      .toBeDefined();

    expect(actual.items.length)
      .toBe(ids.length);

    expect(actual.items.map((item: Product) => item.id))
      .toContainAllValues(ids);
  });
});