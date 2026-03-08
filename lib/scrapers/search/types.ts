export interface SearchResult {
  storeSlug: string;
  storeName: string;
  productName: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  productUrl: string;
  isAvailable: boolean;
}

export interface StoreSearchScraper {
  storeSlug: string;
  storeName: string;
  search(query: string): Promise<SearchResult[]>;
}
