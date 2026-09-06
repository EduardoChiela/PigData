import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  List,
  Search,
  X,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { SpaceCard } from "@/components/space-card";
import { SpaceDetailPanel } from "@/components/space-detail-panel";
import { SpacesMap } from "@/components/spaces-map";
import { Button } from "@/components/ui/button";
import {
  APP_NAME,
  defaultSearchDate,
  eventTypes,
  filterSpaces,
  spaceClasses,
  type EventType,
  type SpaceClass,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type SearchParams = {
  cidade?: string;
  data?: string;
  periodo?: string;
  q?: string;
  acit?: string;
  pets?: string;
  capacidade?: string;
  evento?: string;
  classe?: string;
  slug?: string;
};

const floatBtn =
  "border border-stone-300 bg-white text-[#1a2e22] shadow-[0_8px_28px_-8px_rgba(0,0,0,0.45)] hover:bg-stone-50";

const filterBtn =
  "border border-stone-300 bg-white text-[#1a2e22] shadow-none hover:bg-stone-50";

export const Route = createFileRoute("/buscar")({
  validateSearch: (raw: Record<string, unknown>): SearchParams => ({
    cidade: typeof raw.cidade === "string" ? raw.cidade : undefined,
    data: typeof raw.data === "string" ? raw.data : undefined,
    periodo: typeof raw.periodo === "string" ? raw.periodo : undefined,
    q: typeof raw.q === "string" ? raw.q : undefined,
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
  const [listOpen, setListOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(Boolean(search.slug));
  const [draftQuery, setDraftQuery] = useState(search.q ?? "");
  const listRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

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
        query: search.q,
        acitOnly,
        pets: petsOnly,
        minCapacity:
          minCapacity && !Number.isNaN(minCapacity) ? minCapacity : undefined,
        eventType: search.evento as EventType | undefined,
        className: search.classe as SpaceClass | undefined,
      }),
    [
      date,
      period,
      search.q,
      acitOnly,
      petsOnly,
      minCapacity,
      search.evento,
      search.classe,
    ],
  );

  const selectedSlug = search.slug ?? results[0]?.slug;
  const detailSpace = search.slug
    ? (results.find((s) => s.slug === search.slug) ?? null)
    : null;

  const activeFilterCount = [
    acitOnly,
    petsOnly,
    Boolean(search.capacidade),
    Boolean(search.evento),
    Boolean(search.classe),
  ].filter(Boolean).length;

  function patchSearch(patch: Partial<SearchParams>) {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
    });
  }

  function selectSpace(slug: string) {
    patchSearch({ slug });
    setDetailOpen(true);
    setListOpen(true);
  }

  function closeDetail() {
    setDetailOpen(false);
  }

  function expandSearch(seed?: string) {
    if (seed != null) setDraftQuery(seed);
    setSearchOpen(true);
  }

  useEffect(() => {
    setDraftQuery(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    if (!selectedSlug || !listRef.current || !listOpen) return;
    const el = listRef.current.querySelector(
      `[data-space-slug="${selectedSlug}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedSlug, listOpen]);

  useEffect(() => {
    if (!filtersOpen) return;
    function onPointer(e: MouseEvent) {
      if (!filtersRef.current?.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [filtersOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    function onPointer(e: MouseEvent) {
      if (!searchPanelRef.current?.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [searchOpen]);

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden">
      <SpacesMap
        spaces={results}
        selectedSlug={selectedSlug}
        onSelect={selectSpace}
        fullBleed
        className="absolute inset-0 min-h-0 rounded-none border-0"
        legendClassName={cn(
          "bottom-4 z-10",
          listOpen ? "md:left-[calc(26rem+1.25rem)]" : "md:left-4",
        )}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-3 md:p-4">
        <div
          ref={searchPanelRef}
          className="pointer-events-auto w-full max-w-3xl"
        >
          <AnimatePresence mode="wait" initial={false}>
            {searchOpen ? (
              <motion.div
                key="search-expanded"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="rounded-2xl border border-stone-200 bg-white p-3 shadow-xl"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-xs font-semibold text-foreground">Busca</p>
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                    aria-label="Recolher busca"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <SearchBar
                  layout="stacked"
                  initialDate={date}
                  initialPeriod={period}
                  initialQuery={draftQuery}
                  autoFocusQuery
                  preserveSearch={{
                    acit: search.acit,
                    pets: search.pets,
                    capacidade: search.capacidade,
                    evento: search.evento,
                    classe: search.classe,
                    slug: search.slug,
                  }}
                  onCollapse={() => setSearchOpen(false)}
                />
              </motion.div>
            ) : (
              <motion.label
                key="search-collapsed"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="mx-auto flex w-full max-w-xl cursor-text items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-3 shadow-[0_6px_24px_-6px_rgba(0,0,0,0.35)]"
              >
                <Search
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  value={draftQuery}
                  placeholder="Buscar espaços"
                  aria-label="Buscar espaços"
                  className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                  onFocus={() => expandSearch()}
                  onChange={(e) => {
                    setDraftQuery(e.target.value);
                    if (!searchOpen) expandSearch(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      expandSearch(draftQuery);
                    }
                  }}
                />
              </motion.label>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {listOpen ? (
          <motion.aside
            key="sidebar"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-20 flex max-h-[42dvh] md:bottom-4 md:left-4 md:right-auto md:top-20 md:max-h-none"
          >
            <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-t-2xl border border-stone-200 bg-white shadow-2xl md:w-[26rem] md:rounded-2xl">
              <div className="flex items-center gap-2 border-b border-border/70 px-2.5 py-2">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-base font-semibold text-foreground">
                    <List className="size-4 shrink-0" />
                    Espaços
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {results.length} no mapa
                  </p>
                </div>

                <div className="relative" ref={filtersRef}>
                  <Button
                    type="button"
                    size="sm"
                    className={cn("font-semibold", filterBtn)}
                    aria-expanded={filtersOpen}
                    onClick={() => setFiltersOpen((v) => !v)}
                  >
                    <Filter className="size-4 text-[#c47a3a]" />
                    Filtros
                    {activeFilterCount > 0 ? (
                      <span className="grid size-5 place-items-center rounded-full bg-[#c47a3a] text-[0.65rem] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </Button>

                  <AnimatePresence>
                    {filtersOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-[calc(100%+0.4rem)] z-30 w-[min(18rem,calc(100vw-2.5rem))] space-y-3 rounded-xl border border-border bg-white p-3 text-foreground shadow-xl"
                      >
                        <p className="text-sm font-semibold">Filtros</p>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={acitOnly}
                            onChange={(e) =>
                              patchSearch({
                                acit: e.target.checked ? "1" : undefined,
                              })
                            }
                          />
                          Só verificados ACIT
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={petsOnly}
                            onChange={(e) =>
                              patchSearch({
                                pets: e.target.checked ? "1" : undefined,
                              })
                            }
                          />
                          Aceita pets
                        </label>

                        <label className="block space-y-1 text-sm">
                          <span className="text-muted-foreground">
                            Capacidade mín.
                          </span>
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
                          <span className="text-muted-foreground">
                            Tipo de evento
                          </span>
                          <select
                            className="w-full rounded-md border border-border bg-background px-2 py-2"
                            value={search.evento ?? ""}
                            onChange={(e) =>
                              patchSearch({
                                evento: e.target.value || undefined,
                              })
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
                              patchSearch({
                                classe: e.target.value || undefined,
                              })
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

                        {activeFilterCount > 0 ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              patchSearch({
                                acit: undefined,
                                pets: undefined,
                                capacidade: undefined,
                                evento: undefined,
                                classe: undefined,
                              })
                            }
                          >
                            Limpar
                          </Button>
                        ) : null}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0"
                  aria-label="Recolher lista"
                  onClick={() => setListOpen(false)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
              </div>

              <div
                ref={listRef}
                className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-2.5"
              >
                {results.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <p className="text-base font-semibold">
                      Nenhum espaço livre
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ajuste data ou filtros.
                    </p>
                    <Button asChild size="sm" className="mt-3">
                      <Link to="/buscar" search={{ data: defaultSearchDate }}>
                        Limpar
                      </Link>
                    </Button>
                  </div>
                ) : (
                  results.map((space, i) => (
                    <motion.div
                      key={space.slug}
                      data-space-slug={space.slug}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.24) }}
                      className={cn(
                        "rounded-xl transition",
                        selectedSlug === space.slug &&
                          "ring-2 ring-primary ring-offset-2 ring-offset-white",
                      )}
                    >
                      <SpaceCard
                        space={space}
                        compact
                        onSelect={selectSpace}
                        searchDate={date}
                        searchPeriod={period}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <SpaceDetailPanel
        space={detailSpace}
        open={detailOpen && Boolean(detailSpace)}
        listOpen={listOpen}
        onClose={closeDetail}
      />

      <AnimatePresence>
        {!listOpen ? (
          <motion.div
            key="reopen-list"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="absolute bottom-4 left-4 z-20 md:top-20 md:bottom-auto"
          >
            <Button
              type="button"
              size="sm"
              className={cn("font-semibold", floatBtn)}
              onClick={() => setListOpen(true)}
            >
              <ChevronRight className="size-4 text-[#c47a3a]" />
              Lista ({results.length})
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
