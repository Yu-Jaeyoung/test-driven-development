import { beforeAll, describe, it, expect } from "bun:test";
import type { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "@src/app.module";
import { TestFixture } from "@test/commerce/api/test-fixture";
import { RegisterProductCommandGenerator } from "@test/commerce/register-product-command-generator";


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
});

