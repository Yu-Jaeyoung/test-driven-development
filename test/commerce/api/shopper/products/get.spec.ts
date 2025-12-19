import { beforeAll, describe, expect, it } from "bun:test";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { TestFixture } from "@test/commerce/api/test-fixture";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import type { PageCarrier } from "@src/commerce/result/page-carrier";
import type { ProductView } from "@src/commerce/view/product-view";
import { Repository } from "typeorm";
import { Product } from "@src/commerce/product";
import { getRepositoryToken } from "@nestjs/typeorm";
import type { RegisterProductCommand } from "@src/commerce/command/register-product-command";
import { RegisterProductCommandGenerator } from "@test/commerce/register-product-command-generator";

const PAGE_SIZE = 4;

describe("GET /shopper/products", () => {
  let app: INestApplication;
  let fixture: TestFixture;
  let productRepository: Repository<Product>;

  beforeAll(async() => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
                                                     imports: [ AppModule ],
                                                   })
                                                   .compile();

    app = moduleFixture.createNestApplication();
    // productRepository = app.get<Repository<Product>>(getRepositoryToken(Product));
    productRepository = moduleFixture.get(getRepositoryToken(Product));
    fixture = new TestFixture(app, productRepository);

    await app.init();
  });

  it("올바르게_요청하면_200_OK_상태코드를_반환한다", async() => {
    // Arrange
    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .get("/shopper/products");

    // Assert
    expect(response.status)
      .toBe(HttpStatus.OK);
  });

  it("판매자_접근_토큰을_사용하면_403_Forbidden_상태코드를_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .get("/shopper/products");

    // Assert
    expect(response.status)
      .toBe(HttpStatus.FORBIDDEN);
  });

  it("첫_번째_페이지의_상품을_반환한다", async() => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();
    const ids = await fixture.registerProducts(PAGE_SIZE);
    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .get("/shopper/products");

    // Assert
    const actual: PageCarrier<ProductView> = response.body;
    expect(actual)
      .toBeDefined();

    const actualIds = actual.items.map(item => item.id);
    expect(actualIds.length)
      .toBe(ids.length);
    expect(actualIds.map(String)
                    .sort())
      .toEqual(ids.map(String)
                  .sort());
  });

  it("상품_목록을_등록_시점_역순으로_정렬한다", async() => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();

    const id1 = await fixture.registerProduct();
    const id2 = await fixture.registerProduct();
    const id3 = await fixture.registerProduct();

    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .get("/shopper/products");

    // Assert
    const actual: PageCarrier<ProductView> = response.body;

    expect(actual)
      .toBeDefined();

    const actualIds = actual.items.map(item => item.id);
    expect(actualIds.map(String))
      .toEqual([ id3, id2, id1 ].map(String));
  });

  it("상품_정보를_올바르게_반환한다", async() => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();
    const command: RegisterProductCommand = RegisterProductCommandGenerator.generateRegisterProductCommand();
    await fixture.registerProduct(command);

    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .get("/shopper/products");

    // Assert
    const actual = response.body.items[0];

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

  it("판매자_정보를_올바르게_반환한다", async() => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();
    const seller = await fixture.getSeller();

    await fixture.registerProduct();

    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .get("/shopper/products");

    // Assert
    const actual = response.body.items[0].seller;

    expect(actual)
      .toBeDefined();

    expect(actual.id)
      .toEqual(seller.body.id);
    expect(actual.username)
      .toEqual(seller.body.username);
  });

  it("두_번째_페이지를_올바르게_반환한다", async() => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();
    await fixture.registerProducts(PAGE_SIZE / 2);
    const ids = await fixture.registerProducts(PAGE_SIZE);

    await fixture.registerProducts(PAGE_SIZE);

    await fixture.createShopperThenSetAsDefaultUser();

    const token = await fixture.consumeProductPage();

    // Act
    const response = await fixture.client()
                                  .get("/shopper/products?continuationToken=" + token);

    // Assert
    const actual: PageCarrier<ProductView> = response.body;
    expect(actual)
      .toBeDefined();
    expect(actual.items.map(item => item.id)
                 .reverse())
      .toEqual(ids);
  });

  it.each([ 1, PAGE_SIZE ])("마지막_페이지를_올바르게_반환한다", async(lastPageSize: number) => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();
    const ids = await fixture.registerProducts(lastPageSize);
    await fixture.registerProducts(PAGE_SIZE * 2);

    await fixture.createShopperThenSetAsDefaultUser();
    const token = await fixture.consumeTwoProductPage();

    // Act
    const response = await fixture.client()
                                  .get("/shopper/products?continuationToken=" + token);

    // Assert
    const actual: PageCarrier<ProductView> = response.body;

    expect(actual)
      .toBeDefined();

    expect(actual.items.map(item => item.id))
      .toEqual(ids.reverse());

    expect(actual.continuationToken)
      .toBeUndefined();
  });

  it("continuationToken_매개변수에_빈_문자열이_지정되면_첫_번째_페이지를_반환한다", async() => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();
    await fixture.registerProducts(PAGE_SIZE);
    const ids = await fixture.registerProducts(PAGE_SIZE);

    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .get("/shopper/products?continuationToken=");

    // Assert
    expect(response.status)
      .toBe(HttpStatus.OK);

    const actual: PageCarrier<ProductView> = response.body;

    expect(actual)
      .not
      .toBeUndefined();

    expect(actual.items.map(item => item.id))
      .toEqual(ids.reverse());
  });

  it("문의_이메일_주소를_올바르게_설정한다", async() => {
    // Arrange
    await fixture.deleteAllProducts();

    await fixture.createSellerThenSetAsDefaultUser();
    const seller = await fixture.getSeller();
    await fixture.registerProduct();

    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .get("/shopper/products");
    // Assert
    const actual = response.body.items[0].seller;

    expect(actual)
      .toBeDefined();

    expect(actual.contactEmail)
      .toBe(seller.body.contactEmail);
  });
});