export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      aria-label="Loading"
      role="status"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-foreground"
        aria-hidden="true"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
