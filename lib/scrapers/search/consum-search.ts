import { z } from "zod";
import type { ParsedQuantity } from "./scraper-utils";
import { parseProductQuantity } from "./scraper-utils";
import type { SearchContext, SearchResult, StoreSearchScraper } from "./types";

// Consum uses Empathy.co as its search engine (confirmed via CSP headers).
// Store zone ID 38 is a confirmed production zone with a full product catalogue.
// Queries containing diacritics (ñ, á, é, etc.) return 0 results — strip them first.
//
// The Consum Empathy response includes `price_unit` (per-item price) which allows
// deriving `packageSize = round(price / price_unit)` when name parsing finds nothing.
// This is especially useful for diapers/wipes where the product name omits the count.
const EMPATHY_API = "https://api.empathy.co/search/v1/query/consum/search";
const CONSUM_STORE_ID = "38";

const ConsumItemSchema = z
  .object({
    name: z.string().optional(),
    price: z.number().optional(),
    /** Per-item price pre-calculated by the Consum platform (e.g. 0.37 per diaper). */
    price_unit: z.number().optional(),
    imageUrl: z.string().optional(),
    url: z.string().optional(),
    brand: z.string().optional(),
  })
  .loose();

type ConsumItem = z.infer<typeof ConsumItemSchema>;

const ConsumResponseSchema = z
  .object({
    catalog: z
      .object({ content: z.array(ConsumItemSchema).optional() })
      .loose()
      .optional(),
  })
  .loose();

/**
 * Resolve package size from Consum response fields.
 *
 * Primary: regex-based name parsing (e.g. "48 ud", "2x30").
 * Fallback: derive from `price_unit` — `packageSize = round(price / price_unit)`.
 *   Applied only when the derived count is in the plausible range [2, 300].
 */
export function resolveConsumQuantity(item: ConsumItem): ParsedQuantity {
  const name = item.name ?? "";
  const fromName = parseProductQuantity(name);

  if (fromName.packageSize !== undefined || fromName.netWeight !== undefined) {
    return fromName;
  }

  const { price, price_unit: priceUnit } = item;
  if (
    price !== undefined &&
    priceUnit !== undefined &&
    priceUnit > 0 &&
    priceUnit < price
  ) {
    const derivedCount = Math.round(price / priceUnit);
    if (derivedCount >= 2 && derivedCount <= 300) {
      return { packageSize: derivedCount };
    }
  }

  return {};
}

export class ConsumSearchScraper implements StoreSearchScraper {
  readonly storeSlug = "consum";
  readonly storeName = "Consum";

  async search({ query }: SearchContext): Promise<SearchResult[]> {
    // Strip diacritics — Empathy.co returns 0 results for queries containing ñ, á, etc.
    const normalisedQuery = query
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Empathy uses strict AND-matching; drop trailing words if full query yields nothing.
    const words = normalisedQuery.trim().split(/\s+/);
    for (let end = words.length; end >= 2; end--) {
      const q = words.slice(0, end).join(" ");
      const items = await this.fetchItems(q);
      if (items.length > 0) return items.slice(0, 5);
    }
    return [];
  }

  private async fetchItems(query: string): Promise<SearchResult[]> {
    const url = new URL(EMPATHY_API);
    url.searchParams.set("query", query);
    url.searchParams.set("lang", "es");
    url.searchParams.set("filter", `store:${CONSUM_STORE_ID}`);
    url.searchParams.set("rows", "10");

    try {
      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return [];

      const parsed = ConsumResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        console.warn(
          "[consum-search] Unexpected API response shape:",
          parsed.error.issues[0]?.message,
        );
        return [];
      }

      const items = parsed.data.catalog?.content ?? [];
      return items.flatMap((item) => {
        const { name: productName, price } = item;
        if (!productName || !price || !Number.isFinite(price) || price <= 0)
          return [];

        return [
          {
            storeSlug: this.storeSlug,
            storeName: this.storeName,
            productName,
            price,
            currency: "EUR",
            imageUrl: item.imageUrl ?? null,
            productUrl: item.url ?? `https://tienda.consum.es`,
            isAvailable: true,
            ...resolveConsumQuantity(item),
          } satisfies SearchResult,
        ];
      });
    } catch {
      return [];
    }
  }
}
