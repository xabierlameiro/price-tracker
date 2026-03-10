import { z } from "zod";
import { parseProductQuantity } from "./scraper-utils";
import type { SearchContext, SearchResult, StoreSearchScraper } from "./types";

const BASE_URL = "https://www.online.bmsupermercados.es";

const BmPriceValueSchema = z.object({ centAmount: z.number() }).loose();

const BmProductSchema = z
  .object({
    productData: z
      .object({
        name: z.string(),
        url: z.string().optional(),
        imageURL: z.string().optional(),
      })
      .loose(),
    priceData: z
      .object({
        prices: z.array(z.object({ value: BmPriceValueSchema }).loose()),
      })
      .loose(),
  })
  .loose();

type BmProduct = z.infer<typeof BmProductSchema>;

const BmApiResponseSchema = z
  .object({ products: z.array(BmProductSchema).default([]) })
  .loose();

function bmProductToResult(
  product: BmProduct,
  storeSlug: string,
  storeName: string,
): SearchResult | null {
  const productName = product.productData?.name?.trim();
  if (!productName) return null;
  // BM's Commercetools API returns prices already in EUR (e.g. 10.9 means 10.90 €),
  // not in euro-cents like the standard Commercetools contract.
  const centAmount = product.priceData?.prices?.[0]?.value?.centAmount;
  if (!Number.isFinite(centAmount) || centAmount <= 0) return null;
  const price = centAmount;
  return {
    storeSlug,
    storeName,
    productName,
    price,
    currency: "EUR",
    imageUrl: product.productData?.imageURL ?? null,
    productUrl: product.productData?.url ?? "",
    isAvailable: true,
    ...parseProductQuantity(productName),
  };
}

export class BmSearchScraper implements StoreSearchScraper {
  readonly storeSlug = "bm";
  readonly storeName = "BM Supermercados";

  async search({ query }: SearchContext): Promise<SearchResult[]> {
    const url =
      `${BASE_URL}/api/rest/V1.0/catalog/product?page=1&limit=20&offset=0` +
      `&orderById=13&showProducts=true&showRecommendations=false&showRecipes=false` +
      `&q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
      });
      if (!response.ok) return [];
      const parsed = BmApiResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        console.warn(
          "[bm-search] Unexpected API response shape:",
          parsed.error.issues[0]?.message,
        );
        return [];
      }
      const { data } = parsed;
      return data.products
        .flatMap((p) => {
          const result = bmProductToResult(p, this.storeSlug, this.storeName);
          return result ? [result] : [];
        })
        .slice(0, 5);
    } catch {
      return [];
    }
  }
}
