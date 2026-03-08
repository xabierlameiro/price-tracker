export default function AlertsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading alerts">
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-foreground/10" />
      <ul role="list" className="flex flex-col gap-3" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="flex items-center justify-between rounded-lg border border-foreground/10 p-4"
          >
            <div className="flex flex-col gap-2">
              <div className="h-4 w-48 animate-pulse rounded bg-foreground/10" />
              <div className="h-3 w-32 animate-pulse rounded bg-foreground/10" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded-full bg-foreground/10" />
          </li>
        ))}
      </ul>
    </div>
  );
}
