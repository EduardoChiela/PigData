import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, ShieldCheck } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { SpaceCard } from "@/components/space-card";
import { Button } from "@/components/ui/button";
import { formatDateBR } from "@/lib/format";
import {
  APP_NAME,
  PILOT_CITY_LABEL,
  defaultSearchDate,
  eventTypes,
  filterSpaces,
  periods,
  spaceClasses,
  spaces,
  type EventType,
  type SpaceClass,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type SearchParams = {
  cidade?: string;
  data?: string;
  periodo?: string;
  acit?: string;
  pets?: string;
  capacidade?: string;
  evento?: string;
  classe?: string;
  slug?: string;
};

export const Route = createFileRoute("/buscar")({
  validateSearch: (raw: Record<string, unknown>): SearchParams => ({
    cidade: typeof raw.cidade === "string" ? raw.cidade : undefined,
    data: typeof raw.data === "string" ? raw.data : undefined,
    periodo: typeof raw.periodo === "string" ? raw.periodo : undefined,
    acit: typeof raw.acit === "string" ? raw.acit : undefined,
    pets: typeof raw.pets === "string" ? raw.pets : undefined,
    capacidade:
      typeof raw.capacidade === "string" ? raw.capacidade : undefined,
    evento: typeof raw.evento === "string" ? raw.evento : undefined,
    classe: typeof raw.classe === "string" ? raw.classe : undefined,
    slug: typeof raw.slug === "string" ? raw.slug : undefined,
  }),
  head: () => ({
    meta: [{ title: `Busca — ${APP_NAME}` }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const date = search.data ?? defaultSearchDate;
  const period = search.periodo ?? "dia_inteiro";
  const acitOnly = search.acit === "1";
  const petsOnly = search.pets === "1";
  const minCapacity = search.capacidade ? Number(search.capacidade) : undefined;

  const results = useMemo(
    () =>
      filterSpaces({
        city: "Toledo",
        date,
        period,
        acitOnly,
        pets: petsOnly,
        minCapacity:
          minCapacity && !Number.isNaN(minCapacity) ? minCapacity : undefined,
        eventType: search.evento as EventType | undefined,
        className: search.classe as SpaceClass | undefined,
      }),
    [date, period, acitOnly, petsOnly, minCapacity, search.evento, search.classe],
  );

  const selected = results.find((s) => s.slug === search.slug) ?? results[0];
  const periodLabel =
    periods.find((p) => p.id === period)?.label ?? period;

  function patchSearch(patch: Partial<SearchParams>) {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
    });
  }

  return (
    <div className="pb-16">
      <div className="border-b border-border/80 bg-[var(--forest)] text-white">
        <div className="page-shell space-y-4 py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--leaf)]">
              T02 · Busca / resultados
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
              Espaços em {PILOT_CITY_LABEL}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              {formatDateBR(date)} · {periodLabel} · só disponíveis · ACIT
              primeiro
            </p>
          </div>
          <SearchBar initialDate={date} initialPeriod={period} compact />
        </div>
      </div>

      <div className="page-shell mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside
          className={cn(
            "space-y-4 rounded-2xl border border-border bg-card p-4 lg:block",
            filtersOpen ? "block" : "hidden",
          )}
        >
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="size-4" />
            Filtros
          </p>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={acitOnly}
              onChange={(e) =>
                patchSearch({ acit: e.target.checked ? "1" : undefined })
              }
            />
            Só verificados ACIT
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={petsOnly}
              onChange={(e) =>
                patchSearch({ pets: e.target.checked ? "1" : undefined })
              }
            />
            Aceita pets
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">Capacidade mín.</span>
            <select
              className="w-full rounded-md border border-border bg-background px-2 py-2"
              value={search.capacidade ?? ""}
              onChange={(e) =>
                patchSearch({
                  capacidade: e.target.value || undefined,
                })
              }
            >
              <option value="">Qualquer</option>
              <option value="50">50+</option>
              <option value="100">100+</option>
              <option value="200">200+</option>
              <option value="300">300+</option>
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">Tipo de evento</span>
            <select
              className="w-full rounded-md border border-border bg-background px-2 py-2"
              value={search.evento ?? ""}
              onChange={(e) =>
                patchSearch({ evento: e.target.value || undefined })
              }
            >
              <option value="">Todos</option>
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">Classe</span>
            <select
              className="w-full rounded-md border border-border bg-background px-2 py-2"
              value={search.classe ?? ""}
              onChange={(e) =>
                patchSearch({ classe: e.target.value || undefined })
              }
            >
              <option value="">Todas</option>
              {spaceClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <p className="text-xs text-muted-foreground">
            Catálogo mock: {spaces.length} espaços em Toledo.
          </p>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {results.length}
              </span>{" "}
              espaços disponíveis
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <Filter className="size-4" />
              Filtros
            </Button>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="font-display text-lg font-semibold">
                Nenhum espaço livre com esses filtros
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tente outra data ou remova filtros. Em produção, sugerimos
                alternativas ACIT da rede.
              </p>
              <Button asChild className="mt-4">
                <Link to="/buscar" search={{ data: defaultSearchDate }}>
                  Limpar filtros
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((space) => (
                <div
                  key={space.slug}
                  className={cn(
                    selected?.slug === space.slug &&
                      "rounded-2xl ring-2 ring-primary ring-offset-2 ring-offset-background",
                  )}
                >
                  <SpaceCard
                    space={space}
                    searchDate={date}
                    searchPeriod={period}
                  />
                </div>
              ))}
            </div>
          )}

          {selected ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Destaque da lista
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold">
                    {selected.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.address}
                  </p>
                </div>
                {selected.acitVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--forest)] px-2 py-1 text-xs font-semibold text-white">
                    <ShieldCheck className="size-3.5" />
                    Verificado ACIT
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {selected.blurb} Detalhe completo, solicitação e comodidades
                entram no próximo ajuste do fluxo (T03+).
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-muted px-2 py-1">
                  {selected.capacity} pessoas
                </span>
                <span className="rounded-md bg-muted px-2 py-1">
                  {selected.rentalAreaM2} m²
                </span>
                {selected.classes.map((c) => (
                  <span key={c} className="rounded-md bg-muted px-2 py-1">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
