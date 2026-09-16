import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarSearch,
  Handshake,
  Package,
  ShieldCheck,
} from "lucide-react";
import { HeroSearchBar } from "@/components/hero-search-bar";
import { SpaceCard } from "@/components/space-card";
import {
  APP_NAME,
  defaultSearchDate,
  filterSpaces,
} from "@/lib/mock-data";

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
      <section className="relative z-20 isolate flex min-h-[min(88dvh,900px)] items-center overflow-visible">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=80)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/30 to-black/50"
          aria-hidden
        />

        <div className="page-shell flex w-full justify-center py-16 md:py-20">
          <div className="animate-rise w-full max-w-6xl">
            <HeroSearchBar />
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
            Explore sem conta. Só precisa entrar na hora de enviar o pedido.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Diga o plano",
                body: "Atividade, cidade e data. A busca mostra só o que está livre naquele momento.",
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
            Espaços disponíveis com parceiros verificados primeiro. Só entram espaços
            disponíveis no período.{" "}
            <Link
              to="/"
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
