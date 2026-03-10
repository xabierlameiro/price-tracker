import { describe, expect, it } from "vitest";
import {
  matchCategoryIds,
  normText,
  type MercadonaTopCategory,
} from "./mercadona-search";

// Representative Mercadona category tree (simplified from real API)
const FAKE_CATEGORIES: MercadonaTopCategory[] = [
  {
    id: "1",
    name: "Bebé",
    categories: [
      { id: "217", name: "Toallitas y pañales" },
      { id: "218", name: "Alimentación bebé" },
      { id: "219", name: "Cremas e higiene bebé" },
    ],
  },
  {
    id: "2",
    name: "Lácteos y huevos",
    categories: [
      { id: "31", name: "Leche" },
      { id: "32", name: "Yogures y postres" },
      { id: "33", name: "Queso" },
    ],
  },
  {
    id: "3",
    name: "Agua y bebidas",
    categories: [
      { id: "41", name: "Agua mineral" },
      { id: "42", name: "Zumos y néctar" },
    ],
  },
  {
    id: "4",
    name: "Aceites y condimentos",
    categories: [{ id: "51", name: "Aceite de oliva" }],
  },
];

function keywords(query: string): string[] {
  return normText(query)
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

describe("matchCategoryIds", () => {
  it("should match subcategory 'Toallitas y pañales' for wipes query", () => {
    const ids = matchCategoryIds(FAKE_CATEGORIES, keywords("toallitas dodot"));
    expect(ids).toContain("217");
  });

  it("should match subcategory 'Leche' for milk query", () => {
    const ids = matchCategoryIds(FAKE_CATEGORIES, keywords("leche entera"));
    expect(ids).toContain("31");
    expect(ids).not.toContain("217");
  });

  it("should match subcategory 'Yogures y postres' for yogurt query", () => {
    const ids = matchCategoryIds(FAKE_CATEGORIES, keywords("yogur natural"));
    expect(ids).toContain("32");
    expect(ids).not.toContain("31");
  });

  it("should match top-level 'Bebé' and all its subcategories for bebe query", () => {
    const ids = matchCategoryIds(
      FAKE_CATEGORIES,
      keywords("bebe alimentacion"),
    );
    // top-level "Bebé" name includes "bebe" after normalization
    expect(ids).toContain("1");
    // "alimentacion" matches subcategory "Alimentación bebé"
    expect(ids).toContain("218");
  });

  it("should match subcategory for accented query ('pañales' → 'panales')", () => {
    const ids = matchCategoryIds(FAKE_CATEGORIES, keywords("pañales talla 5"));
    // "panales" is in "Toallitas y panales" after normalization
    expect(ids).toContain("217");
  });

  it("should return empty array for query with no category match", () => {
    const ids = matchCategoryIds(
      FAKE_CATEGORIES,
      keywords("aspirina ibuprofeno"),
    );
    expect(ids).toEqual([]);
  });

  it("should return empty array for empty categories list", () => {
    const ids = matchCategoryIds([], keywords("toallitas dodot"));
    expect(ids).toEqual([]);
  });

  it("should deduplicate IDs when top-level and subcategory both match", () => {
    // "agua" appears in both top-level "Agua y bebidas" and subcategory "Agua mineral"
    const ids = matchCategoryIds(FAKE_CATEGORIES, keywords("agua mineral"));
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
    // Both top-level "3" and subcategory "41" should appear
    expect(ids).toContain("3");
    expect(ids).toContain("41");
  });
});
