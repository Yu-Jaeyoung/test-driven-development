import { beforeAll, describe, expect, it } from "bun:test";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { TestFixture } from "@test/commerce/api/test-fixture";
import { RegisterProductCommandGenerator } from "@test/commerce/register-product-command-generator";
import * as path from "node:path";


describe("POST /seller/products", () => {
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

  it("올바르게_요청하면_201_Created_상태코드를_반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .post("/seller/products")
                                  .send(RegisterProductCommandGenerator.generateRegisterProductCommand());

    // Assert
    expect(response.status)
      .toBe(201);
  });

  it("판매자가_아닌_사용자의_접근_토큰을_사용하면_403_Forbidden_상태코드를_반환한다", async() => {
    // Arrange
    await fixture.createShopperThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .post("/seller/products")
                                  .send(RegisterProductCommandGenerator.generateRegisterProductCommand());

    // Assert
    expect(response.status)
      .toBe(HttpStatus.FORBIDDEN);
  });

  it.each([
    "invalid-uri",
    "http://",
    "://missing-scheme.com",
  ])("imageUri_속성이_URI_형식을_따르지_않으면_400_Bad_Request_상태코드를_반환한다", async(imageUri: string) => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .post("/seller/products")
                                  .send(RegisterProductCommandGenerator.generateRegisterProductCommandWithImageUri(
                                    imageUri,
                                  ));

    // Assert
    expect(response.status)
      .toBe(HttpStatus.BAD_REQUEST);
  });

  it("올바르게 요청하면 등록된 상품 정보에 접근하는 Location 헤더를 반환한다", async() => {
    // Arrange
    await fixture.createSellerThenSetAsDefaultUser();

    // Act
    const response = await fixture.client()
                                  .post("/seller/products")
                                  .send(RegisterProductCommandGenerator.generateRegisterProductCommand());

    // Assert
    const actual = response.headers.location;

    expect(actual)
      .toBeDefined();

    expect(path.isAbsolute(actual))
      .toBe(true);

    expect(actual)
      .toContain("/seller/products");

    expect(actual)
      .toMatch(endsWithUUID());

  });

  function endsWithUUID(): RegExp {
    return /^\/seller\/products\/.*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  }
});

