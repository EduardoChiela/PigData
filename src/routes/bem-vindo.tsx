import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ShieldCheck, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { SpaceCard } from "@/components/space-card";
import { Button } from "@/components/ui/button";
import {
  APP_NAME,
  APP_TAGLINE,
  PILOT_CITY_LABEL,
  defaultSearchDate,
  filterSpaces,
  spaces,
} from "@/lib/mock-data";
import {
  getActiveMockUser,
  homePathForRole,
  isMockAuthenticated,
  loginAsMock,
} from "@/lib/mock-session";

export const Route = createFileRoute("/bem-vindo")({
  beforeLoad: () => {
    if (isMockAuthenticated()) {
      const user = getActiveMockUser();
      throw redirect({
        to: user ? homePathForRole(user.role) : "/",
      });
    }
  },
  head: () => ({
    meta: [
      { title: `${APP_NAME} — disponibilidade em ${PILOT_CITY_LABEL}` },
      {
        name: "description",
        content: `Busque espaços livres por cidade, data e período em ${PILOT_CITY_LABEL}.`,
      },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const preview = filterSpaces({ date: defaultSearchDate }).slice(0, 6);
  const acitCount = spaces.filter((s) => s.acitVerified).length;

  return (
    <>
      <section className="relative isolate min-h-[min(92dvh,820px)] overflow-hidden">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1519167758481-83f29da8c2b4?auto=format&fit=crop&w=2000&q=80)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-[color-mix(in_oklab,var(--ink)_90%,transparent)] via-[color-mix(in_oklab,var(--ink-soft)_82%,transparent)] to-[color-mix(in_oklab,#1a2e22_45%,transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(184,224,122,0.22), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08), transparent 35%)",
          }}
          aria-hidden
        />

        <div className="page-shell flex min-h-[min(92dvh,820px)] flex-col justify-end gap-10 pb-14 pt-24 md:justify-center md:pb-20">
          <div className="max-w-3xl animate-rise text-white">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--leaf)] backdrop-blur">
              <Sparkles className="size-3.5" />
              {APP_TAGLINE} · {PILOT_CITY_LABEL}
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-[0.08em] sm:text-5xl md:text-6xl">
              {APP_NAME.toUpperCase()}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Veja o que está livre na data — solicite sem pagar. A reserva só
              confirma depois da aprovação do espaço.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[var(--leaf)] font-semibold text-[var(--ink)] hover:bg-[var(--leaf-bright)]"
              >
                <Link to="/entrar">Entrar</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <a href="#preview">Ver espaços</a>
              </Button>
            </div>
          </div>

          <div className="animate-rise-delay w-full max-w-4xl">
            <SearchBar
              layout="stacked"
              className="rounded-2xl bg-white/95 p-3 shadow-lg"
            />
            <p className="mt-3 text-sm text-white/70">
              Entrada disponibilidade-first: cidade + data + período.{" "}
              {spaces.length} espaços no mock · {acitCount} verificados ACIT.
            </p>
          </div>
        </div>
      </section>

      <section id="preview" className="page-shell py-16 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Livres em {defaultSearchDate.split("-").reverse().join("/")}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Resultados mock ordenados com parceiros ACIT primeiro. Só entram
              espaços disponíveis no período.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/" onClick={() => loginAsMock("cli-ana")}>
              Abrir mapa
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((space) => (
            <SpaceCard
              key={space.slug}
              space={space}
              searchDate={defaultSearchDate}
              searchPeriod="dia_inteiro"
            />
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-[var(--sand)]/70">
        <div className="page-shell grid gap-8 py-14 md:grid-cols-3">
          {[
            {
              title: "Solicitação ≠ reserva",
              body: "Você envia o pedido com data e comodidades. Só paga se o espaço aprovar.",
            },
            {
              title: "Destaque ACIT",
              body: "Parceiros verificados aparecem primeiro na lista e no mapa da rede.",
            },
            {
              title: "Comodidades no pedido",
              body: "Monte a cotação com o que cada espaço oferece — incluso ou opcional.",
            },
          ].map((item) => (
            <div key={item.title} className="animate-fade">
              <div className="mb-3 grid size-10 place-items-center rounded-lg bg-[var(--ink)] text-[var(--leaf)]">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
