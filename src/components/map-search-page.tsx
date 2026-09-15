import { getRouteApi, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
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
  amenityCatalog,
  defaultSearchDate,
  eventTypes,
  filterSpaces,
  spaceClasses,
  withAvailability,
  type EventType,
  type ListedSpace,
  type SpaceClass,
} from "@/lib/mock-data";
import type { MapSearchParams } from "@/lib/search-params";
import {
  listVerifiedListings,
  verifiedListingAsSpace,
} from "@/lib/space-registration";
import { cn } from "@/lib/utils";

const routeApi = getRouteApi("/");

const floatBtn =
  "border border-stone-300 bg-white text-[#1a2e22] shadow-[0_8px_28px_-8px_rgba(0,0,0,0.45)] hover:bg-stone-50";

export function MapSearchPage() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [listOpen, setListOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(Boolean(search.slug));
  const [draftQuery, setDraftQuery] = useState(search.q ?? "");
  const listRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  const date = search.data ?? defaultSearchDate;
  const endDate = search.dataFim;
  const period = search.periodo ?? "dia_inteiro";
  const city = search.cidade ?? "Toledo";
  const startTime = search.horaInicio;
  const endTime = search.horaFim;
  const acitOnly = false;
  const petsOnly = search.pets === "1";
  const minCapacity = search.capacidade ? Number(search.capacidade) : undefined;
  const minArea = search.areaMin ? Number(search.areaMin) : undefined;
  const maxArea = search.areaMax ? Number(search.areaMax) : undefined;
  const maxPrice = search.precoMax ? Number(search.precoMax) : undefined;

  const results = useMemo(() => {
    const base = filterSpaces({
      city,
      date,
      period,
      query: search.q,
      acitOnly,
      pets: petsOnly,
      minCapacity:
        minCapacity && !Number.isNaN(minCapacity) ? minCapacity : undefined,
      minArea: minArea && !Number.isNaN(minArea) ? minArea : undefined,
      maxArea: maxArea && !Number.isNaN(maxArea) ? maxArea : undefined,
      maxPrice: maxPrice && !Number.isNaN(maxPrice) ? maxPrice : undefined,
      eventType: search.evento as EventType | undefined,
      className: search.classe as SpaceClass | undefined,
    });
    const verifiedExtra: ListedSpace[] = listVerifiedListings()
      .filter((l) => !base.some((b) => b.slug === l.slug))
      .map((l) => withAvailability(verifiedListingAsSpace(l), date))
      .filter((s) => {
        if (acitOnly && !s.acitVerified) return false;
        if (petsOnly && !s.allowsPets) return false;
        if (minCapacity && !Number.isNaN(minCapacity) && s.capacity < minCapacity) {
          return false;
        }
        if (minArea && !Number.isNaN(minArea) && s.rentalAreaM2 < minArea) {
          return false;
        }
        if (maxArea && !Number.isNaN(maxArea) && s.rentalAreaM2 > maxArea) {
          return false;
        }
        if (maxPrice && !Number.isNaN(maxPrice) && s.basePrice > maxPrice) {
          return false;
        }
        if (search.q?.trim()) {
          const q = search.q.trim().toLowerCase();
          const hay = `${s.name} ${s.address} ${s.blurb}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
    return [...verifiedExtra, ...base]
      .filter((s) => {
        if (search.modalidade === "dia" && !s.allowsFullDayRental) return false;
        if (search.modalidade === "hora" && !s.allowsHourlyRental) return false;
        if (search.janelas === "1" && !s.hasWindows) return false;
        if (
          search.tensao &&
          !s.outlets.some((o) => String(o.voltage) === search.tensao)
        ) {
          return false;
        }
        if (
          search.comodidade &&
          !s.amenities.some((a) => a.itemId === search.comodidade)
        ) {
          return false;
        }
        if (search.evento && !s.eventTypes.includes(search.evento as EventType)) {
          return false;
        }
        if (search.classe && !s.classes.includes(search.classe as SpaceClass)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
      const acit = (s: ListedSpace) => (s.acitVerified ? 0 : 1);
      return acit(a) - acit(b) || a.basePrice - b.basePrice;
    });
  }, [
    date,
    period,
    city,
    search.q,
    acitOnly,
    petsOnly,
    minCapacity,
    minArea,
    maxArea,
    maxPrice,
    search.modalidade,
    search.janelas,
    search.tensao,
    search.comodidade,
    search.evento,
    search.classe,
  ]);

  const selectedSlug = search.slug ?? results[0]?.slug;
  const detailSpace = search.slug
    ? (results.find((s) => s.slug === search.slug) ?? null)
    : null;

  const activeFilterCount = [
    petsOnly,
    Boolean(search.capacidade),
    Boolean(search.areaMin),
    Boolean(search.areaMax),
    Boolean(search.precoMax),
    Boolean(search.modalidade),
    Boolean(search.janelas),
    Boolean(search.tensao),
    Boolean(search.comodidade),
    Boolean(search.evento),
    Boolean(search.classe),
  ].filter(Boolean).length;

  function patchSearch(patch: Partial<MapSearchParams>) {
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
    if (!searchOpen) return;
    function onPointer(e: MouseEvent) {
      if (!searchPanelRef.current?.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [searchOpen]);

  const filterSelectClass =
    "h-8 w-full rounded-full border border-stone-200 bg-white px-3 text-xs font-medium text-foreground outline-none transition hover:border-stone-300 focus:border-[var(--forest)] focus:ring-2 focus:ring-[var(--leaf)]/35";
  const filterLabelClass =
    "min-w-[6.75rem] shrink-0 space-y-1 text-xs font-semibold text-muted-foreground";
  const filterCheckClass =
    "flex h-8 shrink-0 items-center gap-2 self-end rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-foreground transition hover:border-stone-300";
  const filterGroupClass =
    "flex shrink-0 items-end gap-2 rounded-2xl border border-stone-200/70 bg-stone-50/70 px-2.5 py-2";
  const filterGroupTitleClass =
    "self-center whitespace-nowrap px-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground";

  const filterControls = (
    <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto rounded-2xl border border-stone-200/80 bg-white/95 px-2.5 py-1.5 text-foreground shadow-[0_12px_36px_-18px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className={filterGroupClass}>
        <span className={filterGroupTitleClass}>Uso</span>
        <label className="min-w-[7.5rem] shrink-0 space-y-1 text-xs font-semibold text-muted-foreground">
          <span className="block px-1">Modalidade</span>
          <select
            className={filterSelectClass}
            value={search.modalidade ?? ""}
            onChange={(e) =>
              patchSearch({ modalidade: e.target.value || undefined })
            }
          >
            <option value="">Todas</option>
            <option value="dia">Dia/periodo</option>
            <option value="hora">Horario</option>
          </select>
        </label>
        <label className="min-w-[9rem] shrink-0 space-y-1 text-xs font-semibold text-muted-foreground">
          <span className="block px-1">Evento</span>
          <select
            className={filterSelectClass}
            value={search.evento ?? ""}
            onChange={(e) => patchSearch({ evento: e.target.value || undefined })}
          >
            <option value="">Todos</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[8rem] shrink-0 space-y-1 text-xs font-semibold text-muted-foreground">
          <span className="block px-1">Classe</span>
          <select
            className={filterSelectClass}
            value={search.classe ?? ""}
            onChange={(e) => patchSearch({ classe: e.target.value || undefined })}
          >
            <option value="">Todas</option>
            {spaceClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={filterGroupClass}>
        <span className={filterGroupTitleClass}>Porte</span>
        <label className={filterLabelClass}>
          <span className="block px-1">Capacidade</span>
          <select
            className={filterSelectClass}
            value={search.capacidade ?? ""}
            onChange={(e) =>
              patchSearch({ capacidade: e.target.value || undefined })
            }
          >
            <option value="">Qualquer</option>
            <option value="50">50+</option>
            <option value="100">100+</option>
            <option value="200">200+</option>
            <option value="300">300+</option>
          </select>
        </label>
        <label className={filterLabelClass}>
          <span className="block px-1">Preco max.</span>
          <select
            className={filterSelectClass}
            value={search.precoMax ?? ""}
            onChange={(e) => patchSearch({ precoMax: e.target.value || undefined })}
          >
            <option value="">Qualquer</option>
            <option value="2500">R$ 2.500</option>
            <option value="4000">R$ 4.000</option>
            <option value="6000">R$ 6.000</option>
          </select>
        </label>
        <label className="min-w-[6.5rem] shrink-0 space-y-1 text-xs font-semibold text-muted-foreground">
          <span className="block px-1">Area min.</span>
          <select
            className={filterSelectClass}
            value={search.areaMin ?? ""}
            onChange={(e) => patchSearch({ areaMin: e.target.value || undefined })}
          >
            <option value="">Qualquer</option>
            <option value="100">100 m2+</option>
            <option value="200">200 m2+</option>
            <option value="500">500 m2+</option>
          </select>
        </label>
        <label className="min-w-[6.5rem] shrink-0 space-y-1 text-xs font-semibold text-muted-foreground">
          <span className="block px-1">Area max.</span>
          <select
            className={filterSelectClass}
            value={search.areaMax ?? ""}
            onChange={(e) => patchSearch({ areaMax: e.target.value || undefined })}
          >
            <option value="">Qualquer</option>
            <option value="150">150 m2</option>
            <option value="300">300 m2</option>
            <option value="600">600 m2</option>
          </select>
        </label>
      </div>

      <div className={filterGroupClass}>
        <span className={filterGroupTitleClass}>Estrutura</span>
        <label className="min-w-[11rem] shrink-0 space-y-1 text-xs font-semibold text-muted-foreground">
          <span className="block px-1">Comodidade</span>
          <select
            className={filterSelectClass}
            value={search.comodidade ?? ""}
            onChange={(e) =>
              patchSearch({ comodidade: e.target.value || undefined })
            }
          >
            <option value="">Todas</option>
            {amenityCatalog.map((a) => (
              <option key={a.itemId} value={a.itemId}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[6rem] shrink-0 space-y-1 text-xs font-semibold text-muted-foreground">
          <span className="block px-1">Tensao</span>
          <select
            className={filterSelectClass}
            value={search.tensao ?? ""}
            onChange={(e) => patchSearch({ tensao: e.target.value || undefined })}
          >
            <option value="">Todas</option>
            <option value="127">127 V</option>
            <option value="220">220 V</option>
          </select>
        </label>
        <label className={filterCheckClass}>
          <input
            type="checkbox"
            className="size-3.5 accent-[var(--forest)]"
            checked={petsOnly}
            onChange={(e) =>
              patchSearch({ pets: e.target.checked ? "1" : undefined })
            }
          />
          Pets
        </label>
        <label className={filterCheckClass}>
          <input
            type="checkbox"
            className="size-3.5 accent-[var(--forest)]"
            checked={search.janelas === "1"}
            onChange={(e) =>
              patchSearch({ janelas: e.target.checked ? "1" : undefined })
            }
          />
          Janelas
        </label>
      </div>

      {activeFilterCount > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 self-end rounded-full border-stone-200 bg-white px-4 text-xs font-semibold shadow-sm hover:bg-stone-50"
          onClick={() =>
            patchSearch({
              acit: undefined,
              pets: undefined,
              capacidade: undefined,
              areaMin: undefined,
              areaMax: undefined,
              precoMax: undefined,
              modalidade: undefined,
              janelas: undefined,
              tensao: undefined,
              comodidade: undefined,
              evento: undefined,
              classe: undefined,
            })
          }
        >
          Limpar
        </Button>
      ) : null}
    </div>
  );
  return (
    <div className="relative h-[calc(100dvh-3.75rem)] w-full overflow-hidden">
      <SpacesMap
        spaces={results}
        selectedSlug={selectedSlug}
        onSelect={selectSpace}
        fullBleed
        className={cn(
          "absolute inset-0 min-h-0 rounded-none border-0",
          listOpen && "md:left-[62.5%]",
        )}
      />

      <AnimatePresence initial={false}>
        {listOpen ? (
          <motion.div
            key="filters-row"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-20 p-3 md:block md:px-4 md:py-0"
          >
            <div className="pointer-events-auto flex h-full min-w-0 items-center">
              {filterControls}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        layout
        className={cn(
          "pointer-events-none absolute inset-x-0 z-20 flex justify-center p-3 md:p-4",
          listOpen
            ? "top-[4.9rem] md:left-[62.5%] md:justify-end"
            : "top-0",
        )}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
      >
        <div
          ref={searchPanelRef}
          className={cn(
            "pointer-events-auto w-full max-w-3xl",
            listOpen && "md:max-w-none",
          )}
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
                  initialCity={city}
                  initialDate={date}
                  initialEndDate={endDate}
                  initialPeriod={period}
                  initialStartTime={startTime}
                  initialEndTime={endTime}
                  initialQuery={draftQuery}
                  autoFocusQuery
                  preserveSearch={{
                    pets: search.pets,
                    capacidade: search.capacidade,
                    areaMin: search.areaMin,
                    areaMax: search.areaMax,
                    precoMax: search.precoMax,
                    modalidade: search.modalidade,
                    janelas: search.janelas,
                    tensao: search.tensao,
                    comodidade: search.comodidade,
                    evento: search.evento,
                    classe: search.classe,
                    slug: search.slug,
                    dataFim: search.dataFim,
                    horaInicio: search.horaInicio,
                    horaFim: search.horaFim,
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
      </motion.div>

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
            <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-t-2xl border border-stone-200 bg-white shadow-2xl md:w-[calc(62.5vw-2rem)] md:rounded-2xl">
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
                className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-2.5 md:grid-cols-2"
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
                      <Link to="/" search={{ data: defaultSearchDate }}>
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
                        "rounded-xl shadow-sm transition hover:shadow-md",
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
        initialDate={date}
        initialPeriod={period}
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
