import * as cheerio from "cheerio";
import { z } from "zod";
import { resolveGtmItemQuantity } from "./scraper-utils";
import type { SearchContext, SearchResult, StoreSearchScraper } from "./types";

const BASE_URL = "https://supermercado.eroski.es";

const GtmItemSchema = z
  .object({
    item_id: z.string().optional(),
    item_name: z.string().optional(),
    price: z.number().optional(),
    item_variant: z.string().optional(),
  })
  .loose();

const GtmMetricsSchema = z
  .object({
    ecommerce: z
      .object({ items: z.array(GtmItemSchema).optional() })
      .loose()
      .optional(),
  })
  .loose();

export class EroskiSearchScraper implements StoreSearchScraper {
  readonly storeSlug = "eroski";
  readonly storeName = "Eroski / Vegalsa";

  async search({ query }: SearchContext): Promise<SearchResult[]> {
    // Use native fetch instead of impit: Eroski detects impit's TLS fingerprint
    // and returns 404, while a standard browser User-Agent returns 200.
    // Also normalise the query to plain ASCII: Eroski's search returns 404 when
    // the query contains UTF-8 percent-encoded characters such as ñ (%C3%B1).
    const normalisedQuery = query
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const response = await fetch(
      `${BASE_URL}/es/search/results/?q=${encodeURIComponent(normalisedQuery)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      },
    );
    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const seen = new Set<string>();
    const results: SearchResult[] = [];

    // Product data is embedded as HTML-entity-encoded JSON in [data-metrics]
    // attributes. Each product appears multiple times (Criteo ads + organic),
    // so we deduplicate by item_id.
    $("[data-metrics]").each((_, el) => {
      const metricsRaw = $(el).attr("data-metrics");
      if (!metricsRaw) return;

      let parsed: unknown;
      try {
        parsed = JSON.parse(metricsRaw);
      } catch {
        return;
      }

      const result = GtmMetricsSchema.safeParse(parsed);
      if (!result.success) return;

      const items = result.data.ecommerce?.items;
      if (!items?.length) return;

      const item = items[0];
      const {
        item_id: id,
        item_name: productName,
        price,
        item_variant: itemVariant,
      } = item;
      if (!id || seen.has(id)) return;
      seen.add(id);

      if (!productName || price == null || price <= 0) return;

      const productUrl =
        $(el)
          .closest('[class*="product-item"]')
          .find("a.actionZoom")
          .first()
          .attr("href")
          ?.replace(":443", "") ?? `${BASE_URL}/es/productdetail/${id}/`;

      results.push({
        storeSlug: this.storeSlug,
        storeName: this.storeName,
        productName,
        price,
        currency: "EUR",
        imageUrl: `${BASE_URL}//images/${id}.jpg`,
        productUrl,
        isAvailable: true,
        ...resolveGtmItemQuantity(productName, itemVariant),
      });
    });

    return results.slice(0, 5);
  }
}
