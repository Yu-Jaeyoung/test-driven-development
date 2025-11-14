import { beforeAll, describe, expect, it } from "bun:test";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { TestFixture } from "@test/commerce/api/test-fixture";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { RegisterProductCommandGenerator } from "@test/commerce/register-product-command-generator";
import type { RegisterProductCommand } from "@src/commerce/command/register-product-command";

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

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products/${ id }`)
                                  .send();

    // Assert
    expect(response.status)
      .toBe(HttpStatus.OK);
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
      .toBe(HttpStatus.FORBIDDEN);
  });

  it("존재하지_않는_상품_식별자를_사용하면_404_Not_Found_상태코드를_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const id = crypto.randomUUID();

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products/${ id }`)
                                  .send();

    // Assert
    expect(response.status)
      .toBe(HttpStatus.NOT_FOUND);
  });

  it("다른_판매자가_등록한_상품_식별자를_사용하면_404_Not_Found_상태코드를_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const id = crypto.randomUUID();

    await fixture.createSellerThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products/${ id }`)
                                  .send();

    // Assert
    expect(response.status)
      .toBe(HttpStatus.NOT_FOUND);
  });

  it("상품_식별자를_올바르게_반환한다", async() => {
    // Arrange

    await fixture.createSellerThenSetAsDefaultUser();
    const id = await fixture.registerProduct();

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products/${ id }`)
                                  .send();

    const actual: SellerProductView = {
      ...response.body,
    };

    // Assert
    expect(actual)
      .toBeDefined();

    expect(actual.id)
      .toEqual(id);
  });

  it("상품_정보를_올바르게_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const command: RegisterProductCommand = RegisterProductCommandGenerator.generateRegisterProductCommand();
    const id = await fixture.registerProduct(command);

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products/${ id }`)
                                  .send();

    // Assert
    const actual: SellerProductView = {
      ...response.body,
    };

    expect(actual)
      .toBeDefined();

    expect(actual.name)
      .toEqual(command.name);

    expect(actual.imageUri)
      .toEqual(command.imageUri);

    expect(actual.description)
      .toEqual(command.description);

    expect(actual.priceAmount)
      .toEqual(command.priceAmount);

    expect(actual.stockQuantity)
      .toEqual(command.stockQuantity);
  });

  it("상품_등록_시각을_올바르게_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();
    const id = await fixture.registerProduct();

    const referenceTime = new Date();

    // Act
    const response = await fixture.client()
                                  .get(`/seller/products/${ id }`)
                                  .send();

    // Assert
    const actual: SellerProductView = {
      ...response.body,
    };

    const actualTime = new Date(actual.registeredTimeUtc).getTime();

    // Assert
    expect(actualTime)
      .toBeCloseTo(referenceTime.getTime(), -3);

  });
});