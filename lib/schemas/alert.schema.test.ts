import { describe, expect, it } from "vitest";
import { CreateAlertSchema, UpdateAlertSchema } from "./alert.schema";

describe("CreateAlertSchema", () => {
  const validCuid = "clxxxxxxxxxxxxxxxxxxxxxx";

  it("should accept a valid alert", () => {
    const result = CreateAlertSchema.safeParse({
      productId: validCuid,
      targetPrice: 29.99,
    });
    expect(result.success).toBe(true);
  });

  it("should reject a non-positive target price", () => {
    const result = CreateAlertSchema.safeParse({
      productId: validCuid,
      targetPrice: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should reject more than 2 decimal places", () => {
    const result = CreateAlertSchema.safeParse({
      productId: validCuid,
      targetPrice: 10.001,
    });
    expect(result.success).toBe(false);
  });

  it("should reject a missing productId", () => {
    const result = CreateAlertSchema.safeParse({ targetPrice: 10.0 });
    expect(result.success).toBe(false);
  });
});

describe("UpdateAlertSchema", () => {
  it("should accept an empty object", () => {
    expect(UpdateAlertSchema.safeParse({}).success).toBe(true);
  });

  it("should accept changing only isActive", () => {
    const result = UpdateAlertSchema.safeParse({ isActive: false });
    expect(result.success).toBe(true);
  });
});
