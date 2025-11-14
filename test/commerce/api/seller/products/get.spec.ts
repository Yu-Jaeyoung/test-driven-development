import { beforeAll, describe, expect, it } from "bun:test";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { TestFixture } from "@test/commerce/api/test-fixture";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { Product } from "@src/commerce/product";
import type { RegisterProductCommand } from "@src/commerce/command/register-product-command";
import { RegisterProductCommandGenerator } from "@test/commerce/register-product-command-generator";

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

  it("다른_판매자가_등록한_상품이_포함되지_않는다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const unexpectedId = await fixture.registerProduct();

    await fixture.createSellerThenSetAsDefaultUser();
    await fixture.registerProducts();

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products`)
                                  .send();

    const actual = response.body;

    // Assert
    expect(actual.items.map((item: Product) => item.id))
      .not
      .toContainValue(unexpectedId);
  });

  it("상품_정보를_올바르게_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const command: RegisterProductCommand = RegisterProductCommandGenerator.generateRegisterProductCommand();
    await fixture.registerProduct(command);

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products`)
                                  .send();

    const actual: SellerProductView = response.body.items[0];

    // Assert
    expect(actual)
      .toBeDefined();

    expect(actual)
      .toMatchObject({
        name: command.name,
        imageUri: command.imageUri,
        description: command.description,
        priceAmount: command.priceAmount,
        stockQuantity: command.stockQuantity,
      });
  });

  it("상품_등록_시각을_올바르게_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const referenceTime = new Date();
    await fixture.registerProduct();

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products`)
                                  .send();

    const actual = response.body;

    // Assert
    expect(actual)
      .toBeDefined();

    const registeredTimeUtc = new Date(actual.items[0].registeredTimeUtc);
    expect(registeredTimeUtc.getTime())
      .toBeGreaterThanOrEqual(referenceTime.getTime());
  });
});