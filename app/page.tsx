import { auth } from "@/auth";
import { SearchBar } from "@/components/search/search-bar";
import { APP_NAME, ROUTES } from "@/lib/constants";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-foreground/10 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-semibold tracking-tight">{APP_NAME}</span>
          <nav aria-label="Site navigation" className="flex items-center gap-4">
            {session ? (
              <Link
                href={ROUTES.dashboard}
                className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:opacity-90"
              >
                My dashboard
              </Link>
            ) : (
              <>
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
              </>
            )}
          </nav>
        </div>
      </header>

      <main id="maincontent" tabIndex={-1} className="flex-1">
        {/* Hero — search */}
        <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            ¿Dónde comprar más barato?
          </h1>
          <p className="mt-4 max-w-xl text-base text-foreground/60">
            Busca cualquier producto y compara precios en Amazon, Carrefour, El
            Corte Inglés, Alcampo, Eroski, MediaMarkt y más — al instante.
          </p>
          <div className="mt-10 w-full max-w-2xl">
            <SearchBar size="large" />
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
              Tiendas cubiertas
            </h2>
            <ul role="list" className="flex flex-wrap justify-center gap-4">
              {[
                "Amazon ES",
                "Carrefour",
                "El Corte Inglés",
                "Alcampo",
                "Eroski",
                "MediaMarkt",
                "PcComponentes",
              ].map((store) => (
                <li
                  key={store}
                  className="flex h-10 items-center justify-center rounded-lg border border-foreground/10 bg-background px-4 text-sm font-medium"
                >
                  {store}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA for unauthenticated users */}
        {!session && (
          <section className="mx-auto max-w-5xl px-6 py-16 text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight">
              Recibe alertas de bajada de precio
            </h2>
            <p className="mb-8 text-base text-foreground/60">
              Crea una cuenta gratuita para que te avisemos cuando un producto
              baje al precio que tú decidas.
            </p>
            <Link
              href={ROUTES.signUp}
              className="rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              Crear cuenta gratis
            </Link>
          </section>
        )}
      </main>

      <footer className="border-t border-foreground/10 px-6 py-6 text-center text-xs text-foreground/40">
        &copy; {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
