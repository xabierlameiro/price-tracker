import { z } from "zod";
import { parseProductQuantity } from "./scraper-utils";
import type { SearchContext, SearchResult, StoreSearchScraper } from "./types";

// These are public values embedded in www.gadisline.com's __NEXT_DATA__ HTML.
// They identify the Gadisline site and its default online delivery assortment store.
const GADIS_SITE_ID = "56df88f9-479f-4361-891e-e1864dba1ca3";
const GADIS_STORE_ID = "891d5c1e-a7a0-4287-9ea3-30c5703a4f63";
const GADIS_API_URL =
  "https://catalog.gadisline.com/api/v3/catalog/products/search?page_number=0&rows_per_page=20&keep_request=true&order_field=relevance&sort_type=asc";

const GadisProductSchema = z
  .object({
    commercial_description: z
      .array(z.object({ language: z.string(), value: z.string() }))
      .optional(),
    price: z.number().optional(),
    slug: z.string().optional(),
    image: z
      .object({
        image: z.string().optional(),
        image_thumbnails: z.string().optional(),
      })
      .optional(),
  })
  .loose();

type GadisProduct = z.infer<typeof GadisProductSchema>;

const GadisResponseSchema = z
  .object({ elements: z.array(GadisProductSchema).optional() })
  .loose();

function toSearchResult(
  product: GadisProduct,
  storeSlug: string,
  storeName: string,
): SearchResult | null {
  const productName = product.commercial_description?.find(
    (d) => d.language === "ES",
  )?.value;
  if (!productName) return null;

  const { price } = product;
  if (!price || !Number.isFinite(price) || price <= 0) return null;

  const { slug = "" } = product;
  const productUrl = slug.startsWith("http")
    ? slug
    : `https://www.gadisline.com${slug}`;

  const imageUrl =
    product.image?.image_thumbnails ?? product.image?.image ?? null;

  return {
    storeSlug,
    storeName,
    productName,
    price,
    currency: "EUR",
    imageUrl,
    productUrl,
    isAvailable: true,
    ...parseProductQuantity(productName),
  };
}

export class GadisSearchScraper implements StoreSearchScraper {
  readonly storeSlug = "gadis";
  readonly storeName = "Gadis";

  async search({ query }: SearchContext): Promise<SearchResult[]> {
    try {
      const response = await fetch(GADIS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "site-id": GADIS_SITE_ID,
          "store-id": GADIS_STORE_ID,
          "accept-language": "es",
        },
        body: JSON.stringify({ search_term: query, minimum_should_match: 1 }),
      });

      if (!response.ok) return [];

      const parsed = GadisResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        console.warn(
          "[gadis-search] Unexpected API response shape:",
          parsed.error.issues[0]?.message,
        );
        return [];
      }
      const { data } = parsed;
      return (data.elements ?? [])
        .map((p) => toSearchResult(p, this.storeSlug, this.storeName))
        .filter((r): r is SearchResult => r !== null)
        .slice(0, 5);
    } catch {
      return [];
    }
  }
}
