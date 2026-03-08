import { AlcampoSearchScraper } from "./alcampo-search";
import { AmazonSearchScraper } from "./amazon-search";
import { CarrefourSearchScraper } from "./carrefour-search";
import { ElCorteInglesSearchScraper } from "./elcorteingles-search";
import { EroskiSearchScraper } from "./eroski-search";
import { MediaMarktSearchScraper } from "./mediamarkt-search";
import { PcComponentesSearchScraper } from "./pccomponentes-search";
import type { SearchResult, StoreSearchScraper } from "./types";

export type { SearchResult } from "./types";

const searchScrapers: StoreSearchScraper[] = [
  new AmazonSearchScraper(),
  new CarrefourSearchScraper(),
  new ElCorteInglesSearchScraper(),
  new AlcampoSearchScraper(),
  new EroskiSearchScraper(),
  new MediaMarktSearchScraper(),
  new PcComponentesSearchScraper(),
];

/**
 * Runs all store search scrapers in parallel and returns results sorted by price ascending.
 * Scrapers that fail or time out return an empty array — they never block the others.
 */
export async function searchAllStores(query: string): Promise<SearchResult[]> {
  const settled = await Promise.allSettled(
    searchScrapers.map((scraper) => scraper.search(query)),
  );

  const all = settled.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  return all.sort((a, b) => a.price - b.price);
}
