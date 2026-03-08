export default function ProductsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading products">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-foreground/10" />
      <ul
        role="list"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="flex flex-col rounded-lg border border-foreground/10 overflow-hidden"
          >
            <div className="h-40 animate-pulse bg-foreground/10" />
            <div className="flex flex-col gap-3 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-foreground/10" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-foreground/10" />
              <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-foreground/10" />
              <div className="mt-1 space-y-1.5 border-t border-foreground/10 pt-2">
                <div className="h-3 animate-pulse rounded bg-foreground/10" />
                <div className="h-3 animate-pulse rounded bg-foreground/10" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
