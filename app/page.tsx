import { auth } from "@/auth";
import { APP_DESCRIPTION, APP_NAME, ROUTES } from "@/lib/constants";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) redirect(ROUTES.dashboard);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-foreground/10 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-semibold tracking-tight">{APP_NAME}</span>
          <nav aria-label="Site navigation" className="flex items-center gap-4">
            <Link
              href={ROUTES.signIn}
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.signUp}
              className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:opacity-90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main id="maincontent" tabIndex={-1} className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {APP_DESCRIPTION}
          </h1>
          <p className="mt-6 max-w-xl text-base text-foreground/60">
            Track prices across Amazon, Carrefour, El Corte Inglés and PC
            Componentes. Get notified the moment your product drops below your
            target price.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={ROUTES.signUp}
              className="rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              Start tracking for free
            </Link>
            <Link
              href={ROUTES.signIn}
              className="rounded-lg border border-foreground/20 px-6 py-3 text-sm font-semibold hover:bg-foreground/5"
            >
              Sign in
            </Link>
          </div>
        </section>

        {/* Supported stores */}
        <section
          aria-labelledby="stores-heading"
          className="border-y border-foreground/10 bg-foreground/5 px-6 py-12"
        >
          <div className="mx-auto max-w-5xl">
            <h2
              id="stores-heading"
              className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-foreground/50"
            >
              Supported stores
            </h2>
            <ul role="list" className="flex flex-wrap justify-center gap-6">
              {[
                "Amazon ES",
                "Carrefour",
                "El Corte Inglés",
                "PC Componentes",
              ].map((store) => (
                <li
                  key={store}
                  className="flex h-12 min-w-32 items-center justify-center rounded-lg border border-foreground/10 bg-background px-5 text-sm font-medium"
                >
                  {store}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features */}
        <section
          aria-labelledby="features-heading"
          className="mx-auto max-w-5xl px-6 py-20"
        >
          <h2
            id="features-heading"
            className="mb-12 text-center text-2xl font-bold tracking-tight"
          >
            Everything you need to save money
          </h2>
          <ul role="list" className="grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Price history",
                description:
                  "See how a product's price has evolved over time so you can spot the best moment to buy.",
              },
              {
                title: "Price alerts",
                description:
                  "Set a target price and receive an email alert as soon as the product drops below it.",
              },
              {
                title: "Automatic updates",
                description:
                  "Prices are refreshed every 6 hours automatically — no manual refresh needed.",
              },
            ].map(({ title, description }) => (
              <li
                key={title}
                className="rounded-xl border border-foreground/10 p-6"
              >
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-foreground/60">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-foreground/10 px-6 py-6 text-center text-xs text-foreground/40">
        &copy; {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
