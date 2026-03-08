import { describe, expect, it } from "vitest";
import {
  CreateProductSchema,
  ProductQuerySchema,
  UpdateProductSchema,
} from "./product.schema";

describe("CreateProductSchema", () => {
  it("should accept a valid product", () => {
    const result = CreateProductSchema.safeParse({
      name: "My Product",
      slug: "my-product",
    });
    expect(result.success).toBe(true);
  });

  it("should accept all optional fields", () => {
    const result = CreateProductSchema.safeParse({
      name: "My Product",
      slug: "my-product",
      description: "A great product",
      imageUrl: "https://example.com/image.jpg",
      category: "Electronics",
      brand: "Acme",
      ean: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("should reject a name that is too short", () => {
    const result = CreateProductSchema.safeParse({ name: "X", slug: "x" });
    expect(result.success).toBe(false);
  });

  it("should reject an invalid slug with spaces", () => {
    const result = CreateProductSchema.safeParse({
      name: "My Product",
      slug: "my product",
    });
    expect(result.success).toBe(false);
  });

  it("should reject an invalid EAN", () => {
    const result = CreateProductSchema.safeParse({
      name: "My Product",
      slug: "my-product",
      ean: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("should reject an invalid imageUrl", () => {
    const result = CreateProductSchema.safeParse({
      name: "My Product",
      slug: "my-product",
      imageUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateProductSchema", () => {
  it("should accept an empty object (all fields optional)", () => {
    const result = UpdateProductSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept a partial update", () => {
    const result = UpdateProductSchema.safeParse({ brand: "NewBrand" });
    expect(result.success).toBe(true);
  });
});

describe("ProductQuerySchema", () => {
  it("should apply default values", () => {
    const result = ProductQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.page).toBe(1);
    expect(result.data.pageSize).toBe(20);
  });

  it("should coerce string numbers for page and pageSize", () => {
    const result = ProductQuerySchema.safeParse({ page: "2", pageSize: "50" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.page).toBe(2);
    expect(result.data.pageSize).toBe(50);
  });

  it("should reject a pageSize over 100", () => {
    const result = ProductQuerySchema.safeParse({ pageSize: "200" });
    expect(result.success).toBe(false);
  });
});
