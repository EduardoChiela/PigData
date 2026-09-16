import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarSearch,
  Handshake,
  Package,
  ShieldCheck,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { SpaceCard } from "@/components/space-card";
import { Button } from "@/components/ui/button";
import {
  APP_NAME,
  defaultSearchDate,
  filterSpaces,
} from "@/lib/mock-data";
import { loginAsMock } from "@/lib/mock-session";

export const Route = createFileRoute("/bem-vindo")({
  head: () => ({
    meta: [{ title: APP_NAME }],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const preview = filterSpaces({ date: defaultSearchDate }).slice(0, 6);

  return (
    <>
      <section className="relative z-20 isolate min-h-[min(92dvh,820px)] overflow-visible">
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
                <Link
                  to="/"
                  onClick={() => loginAsMock("cli-ana")}
                >
                  Ver espaços
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Link to="/entrar">Entrar</Link>
              </Button>
            </div>
          </div>

          <div className="animate-rise-delay w-full max-w-4xl">
            <SearchBar
              layout="stacked"
              className="rounded-2xl bg-white/95 p-3 shadow-lg"
            />
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="border-y border-border/70 bg-[var(--sand)]/70"
      >
        <div className="page-shell py-16 md:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Como funciona
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Três passos até a contratação — sem pagar na solicitação.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Busque a data",
                body: "Informe cidade, data e período. Só aparecem espaços livres naquele momento.",
                icon: CalendarSearch,
              },
              {
                step: "2",
                title: "Solicite sem pagar",
                body: "Escolha o espaço, comodidades e envie o pedido. Solicitação não é reserva.",
                icon: Package,
              },
              {
                step: "3",
                title: "Reserva após aprovação",
                body: "O espaço analisa. Só depois da aprovação você paga e a reserva confirma.",
                icon: Handshake,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="animate-fade">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-[var(--ink)] text-sm font-bold text-[var(--leaf)]">
                      {item.step}
                    </span>
                    <div className="grid size-10 place-items-center rounded-lg bg-white text-[var(--ink)] shadow-sm">
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <h3 className="font-display text-lg font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="preview" className="page-shell py-16 md:py-20">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Livres em {defaultSearchDate.split("-").reverse().join("/")}
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Amostra mock com parceiros verificados primeiro. Só entram espaços
            disponíveis no período.{" "}
            <Link
              to="/"
              onClick={() => loginAsMock("cli-ana")}
              className="font-medium text-foreground underline underline-offset-2"
            >
              Abrir mapa completo
            </Link>
          </p>
        </div>

        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="border-t border-border/70 bg-[var(--sand)]/40">
        <div className="page-shell grid gap-8 py-16 md:grid-cols-3 md:py-20">
          {[
            {
              title: "Solicitação ≠ reserva",
              body: "Você envia o pedido com data e comodidades. Só paga se o espaço aprovar.",
              icon: Package,
            },
            {
              title: "Destaque verificado",
              body: "Parceiros verificados aparecem primeiro na lista e no mapa da rede.",
              icon: ShieldCheck,
            },
            {
              title: "Comodidades no pedido",
              body: "Monte a cotação com o que cada espaço oferece — incluso ou opcional.",
              icon: Handshake,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="animate-fade">
                <div className="mb-3 grid size-10 place-items-center rounded-lg bg-[var(--ink)] text-[var(--leaf)]">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
