import { describe, expect, it } from "vitest";
import { resolveConsumQuantity } from "./consum-search";

describe("resolveConsumQuantity", () => {
  it("should derive packageSize from price_unit when name has no count", () => {
    const result = resolveConsumQuantity({
      name: "Pañal Sensitive Talla 3 6-10 Kg",
      price: 20.95,
      price_unit: 0.37,
    });
    // 20.95 / 0.37 ≈ 56.6 → 57
    expect(result.packageSize).toBe(57);
    expect(result.netWeight).toBeUndefined();
  });

  it("should prefer name-based count over price_unit when name has explicit count", () => {
    const result = resolveConsumQuantity({
      name: "Toallitas Dodot Pure Aqua 48 uds",
      price: 5.99,
      price_unit: 0.12,
    });
    expect(result.packageSize).toBe(48);
  });

  it("should return empty when derived count is 1 (single item, not a pack)", () => {
    const result = resolveConsumQuantity({
      name: "Agua Mineral 1.5 L",
      price: 0.45,
      price_unit: 0.45,
    });
    expect(result.packageSize).toBeUndefined();
  });

  it("should parse volume from name for 1L products (not price_unit fallback)", () => {
    const result = resolveConsumQuantity({
      name: "Leche Entera 1L",
      price: 0.99,
      price_unit: 0.99,
    });
    // "1L" is parsed as 1000ml by name parsing — correct for volume comparison
    expect(result.netWeight).toBe(1000);
    expect(result.netWeightUnit).toBe("ml");
    expect(result.packageSize).toBeUndefined();
  });

  it("should not derive packageSize > 300 (unrealistic count)", () => {
    const result = resolveConsumQuantity({
      name: "Papel Higiénico",
      price: 5.0,
      price_unit: 0.01,
    });
    // 5.0 / 0.01 = 500 — out of range
    expect(result.packageSize).toBeUndefined();
  });

  it("should return empty for missing price and price_unit", () => {
    const result = resolveConsumQuantity({ name: "Pañal Talla 4" });
    expect(result).toEqual({});
  });

  it("should handle Huggies pack with realistic count", () => {
    const result = resolveConsumQuantity({
      name: "Pañal Extra Care Talla 3 de 6 a 10 Kilos",
      price: 16.99,
      price_unit: 0.42,
    });
    // 16.99 / 0.42 ≈ 40.5 → 41 or 40
    expect(result.packageSize).toBeGreaterThanOrEqual(40);
    expect(result.packageSize).toBeLessThanOrEqual(42);
  });
});
