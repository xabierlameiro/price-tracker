import type { SearchResult } from "@/lib/scrapers/search";
import Image from "next/image";

interface SearchResultsProps {
  readonly results: SearchResult[];
  readonly query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="py-16 text-center text-foreground/50">
        <p className="text-lg">
          No se encontraron resultados para &ldquo;{query}&rdquo;
        </p>
        <p className="mt-2 text-sm">
          Prueba con un término diferente o más genérico.
        </p>
      </div>
    );
  }

  const cheapestPrice = results[0]?.price;

  return (
    <section aria-label="Resultados de búsqueda">
      <p className="mb-6 text-sm text-foreground/60">
        {results.length} resultado{results.length !== 1 ? "s" : ""} para{" "}
        <strong>&ldquo;{query}&rdquo;</strong> — ordenados por precio
      </p>
      <ul
        role="list"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {results.map((result, index) => (
          <li key={`${result.storeSlug}-${String(index)}`}>
            <a
              href={result.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-xl border border-foreground/10 bg-background p-4 transition-all hover:border-foreground/30 hover:shadow-sm"
              aria-label={`${result.productName} en ${result.storeName} por ${result.price.toFixed(2)}€`}
            >
              {result.imageUrl && (
                <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-foreground/5">
                  <Image
                    src={result.imageUrl}
                    alt={result.productName}
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  {result.storeName}
                </span>
                <p className="line-clamp-2 flex-1 text-sm font-medium leading-snug text-foreground">
                  {result.productName}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span
                    className={`text-xl font-bold ${result.price === cheapestPrice ? "text-green-600" : "text-foreground"}`}
                  >
                    {result.price.toFixed(2)} {result.currency}
                  </span>
                  {result.price === cheapestPrice && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Mejor precio
                    </span>
                  )}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
