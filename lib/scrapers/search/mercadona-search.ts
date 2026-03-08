import type { SearchResult, StoreSearchScraper } from "./types";

// Mercadona exposes a semi-public JSON API used by their own web app.
// The response shape has evolved; handle multiple known formats defensively.

type MercadonaPhoto = { regular?: string; zoom?: string };
type MercadonaPriceInstructions = { unit_price?: number | string };

type MercadonaProduct = {
  id?: number | string;
  display_name?: string;
  price_instructions?: MercadonaPriceInstructions;
  photos?: MercadonaPhoto[];
  slug?: string;
};

type MercadonaCategory = {
  id?: string;
  name?: string;
  products?: MercadonaProduct[];
};

type MercadonaResultItem = {
  type?: string;
  item?: MercadonaProduct;
};

function extractProducts(data: unknown): MercadonaProduct[] {
  if (!data || typeof data !== "object") return [];

  // Shape: top-level array of products
  if (Array.isArray(data)) {
    return data as MercadonaProduct[];
  }

  const { results } = data as Record<string, unknown>;
  if (!results) return [];

  // Shape: results is an array of {type, item}
  if (Array.isArray(results)) {
    return (results as MercadonaResultItem[])
      .filter((r) => r.type === "product" && r.item != null)
      .map((r) => r.item as MercadonaProduct);
  }

  if (typeof results !== "object") return [];
  const resultsObj = results as Record<string, unknown>;

  // Shape: results.products[]
  if (Array.isArray(resultsObj["products"])) {
    return resultsObj["products"] as MercadonaProduct[];
  }

  // Shape: results.categories[].products[]
  if (Array.isArray(resultsObj["categories"])) {
    return (resultsObj["categories"] as MercadonaCategory[]).flatMap(
      (cat) => cat.products ?? [],
    );
  }

  return [];
}

function toSearchResult(product: MercadonaProduct): SearchResult | null {
  const name = product.display_name;
  const rawPrice = product.price_instructions?.unit_price;
  const price =
    typeof rawPrice === "string"
      ? Number.parseFloat(rawPrice)
      : (rawPrice ?? 0);

  if (!name || !Number.isFinite(price) || price <= 0) return null;

  const slug = product.slug ?? String(product.id ?? "");
  const imageUrl = product.photos?.[0]?.regular ?? null;

  return {
    storeSlug: "mercadona",
    storeName: "Mercadona",
    productName: name,
    price,
    currency: "EUR",
    imageUrl,
    productUrl: `https://tienda.mercadona.es/product/${encodeURIComponent(slug)}`,
    isAvailable: true,
  };
}

export class MercadonaSearchScraper implements StoreSearchScraper {
  readonly storeSlug = "mercadona";
  readonly storeName = "Mercadona";

  async search(query: string): Promise<SearchResult[]> {
    try {
      // `wh` is the warehouse; bcn1 (Barcelona) covers most of Spain via SSR
      const url = `https://tienda.mercadona.es/api/search/?q=${encodeURIComponent(query)}&lang=es&wh=bcn1`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json, */*",
          "Accept-Language": "es-ES,es;q=0.9",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) return [];

      const data: unknown = await response.json();
      const products = extractProducts(data);

      return products.slice(0, 5).flatMap((p) => {
        const result = toSearchResult(p);
        return result ? [result] : [];
      });
    } catch {
      return [];
    }
  }
}
