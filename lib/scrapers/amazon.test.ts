import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AmazonScraper } from "./amazon";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("AmazonScraper", () => {
  let scraper: AmazonScraper;

  beforeEach(() => {
    scraper = new AmazonScraper();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should have storeSlug amazon-es", () => {
    expect(scraper.storeSlug).toBe("amazon-es");
  });

  it("should return null when fetch throws a network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await scraper.scrape("https://amazon.es/dp/B001");
    expect(result).toBeNull();
  });

  it("should return null when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await scraper.scrape("https://amazon.es/dp/B001");
    expect(result).toBeNull();
  });

  it("should return null when html has no price elements", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "<html><body><p>No price here</p></body></html>",
    });
    const result = await scraper.scrape("https://amazon.es/dp/B001");
    expect(result).toBeNull();
  });

  it("should parse price from valid Amazon HTML", async () => {
    const html = `
      <html><body>
        <span class="a-price">
          <span class="a-price-whole">29,</span>
          <span class="a-price-fraction">99</span>
        </span>
        <input id="add-to-cart-button" />
      </body></html>
    `;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    });
    const result = await scraper.scrape("https://amazon.es/dp/B001");
    expect(result).not.toBeNull();
    expect(result?.currency).toBe("EUR");
    expect(result?.url).toBe("https://amazon.es/dp/B001");
    expect(result?.isAvailable).toBe(true);
    expect(result?.price).toBeGreaterThan(0);
  });
});
