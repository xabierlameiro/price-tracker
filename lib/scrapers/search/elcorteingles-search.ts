import { z } from "zod";
import {
  parseProductQuantity,
  fetchHtml,
  parseSpanishPrice,
} from "./scraper-utils";
import type { SearchContext, SearchResult, StoreSearchScraper } from "./types";

const MoonshineProductSchema = z
  .object({
    description: z.string().optional(),
    priceSpecification: z
      .object({
        price: z.string().optional(),
        salePrice: z.string().optional(),
      })
      .loose()
      .optional(),
    url: z.string().optional(),
    image: z.string().optional(),
  })
  .loose();

const MoonshineStateSchema = z
  .object({
    viewData: z
      .object({
        plp: z
          .object({ products: z.array(MoonshineProductSchema).optional() })
          .loose()
          .optional(),
      })
      .loose()
      .optional(),
  })
  .loose();

type MoonshineProduct = z.infer<typeof MoonshineProductSchema>;

/** Find the position of the matching closing `}` for the `{` at `start`. */
function findJsonEnd(html: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") {
      depth++;
      continue;
    }
    if (ch === "}" && --depth === 0) return i;
  }
  return -1;
}

/**
 * Extract and validate the JSON assigned to `window.__MOONSHINE_STATE__` in raw
 * HTML. ECI server-side renders all product data into this global before shipping.
 */
function extractMoonshineProducts(html: string): MoonshineProduct[] {
  const markerIdx = html.indexOf("window.__MOONSHINE_STATE__");
  if (markerIdx === -1) return [];

  const jsonStart = html.indexOf("{", markerIdx);
  if (jsonStart === -1) return [];

  const jsonEnd = findJsonEnd(html, jsonStart);
  if (jsonEnd === -1) return [];

  let raw: unknown;
  try {
    raw = JSON.parse(html.slice(jsonStart, jsonEnd + 1));
  } catch {
    return [];
  }

  const parsed = MoonshineStateSchema.safeParse(raw);
  if (!parsed.success) return [];

  return parsed.data.viewData?.plp?.products ?? [];
}

function toSearchResult(
  product: MoonshineProduct,
  storeSlug: string,
  storeName: string,
): SearchResult | null {
  if (!product.description) return null;

  const rawPrice =
    product.priceSpecification?.salePrice ??
    product.priceSpecification?.price ??
    "";
  const price = parseSpanishPrice(rawPrice);
  if (!Number.isFinite(price) || price <= 0) return null;

  const href = product.url ?? "";
  const productUrl = href.startsWith("http")
    ? href
    : `https://www.elcorteingles.es${href}`;

  return {
    storeSlug,
    storeName,
    productName: product.description,
    price,
    currency: "EUR",
    imageUrl: product.image ?? null,
    productUrl,
    isAvailable: true,
    ...parseProductQuantity(product.description),
  };
}

export class ElCorteInglesSearchScraper implements StoreSearchScraper {
  readonly storeSlug = "elcorteingles";
  readonly storeName = "El Corte Inglés";

  async search({ query }: SearchContext): Promise<SearchResult[]> {
    const url = `https://www.elcorteingles.es/supermercado/buscar/?question=${encodeURIComponent(query)}&catalog=supermercado`;
    const html = await fetchHtml(url);
    if (!html) return [];

    const products = extractMoonshineProducts(html);

    return products
      .map((p) => toSearchResult(p, this.storeSlug, this.storeName))
      .filter((r): r is SearchResult => r !== null)
      .slice(0, 5);
  }
}
