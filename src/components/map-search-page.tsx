import { getRouteApi, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, List, Search, X } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { SearchFiltersBar } from "@/components/search-filters-bar";
import { SpaceCard } from "@/components/space-card";
import { SpacesMap } from "@/components/spaces-map";
import { Button } from "@/components/ui/button";
import {
  defaultSearchDate,
  filterSpaces,
  withAvailability,
  type EventType,
  type ListedSpace,
  type SpaceClass,
} from "@/lib/mock-data";
import {
  parseComodidadesParam,
} from "@/lib/recommended-amenities";
import type { MapSearchParams, MapSearchPatch } from "@/lib/search-params";
import {
  listVerifiedListings,
  verifiedListingAsSpace,
} from "@/lib/space-registration";
import { openSpaceInNewTab } from "@/lib/space-links";
import { cn } from "@/lib/utils";

const routeApi = getRouteApi("/");

const floatBtn =
  "border border-stone-300 bg-white text-[#1a2e22] shadow-[0_8px_28px_-8px_rgba(0,0,0,0.45)] hover:bg-stone-50";

export function MapSearchPage() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [listOpen, setListOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mapSelectedSlug, setMapSelectedSlug] = useState<string | undefined>();
  const [draftQuery, setDraftQuery] = useState(search.q ?? "");
  const listRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  const date = search.data ?? defaultSearchDate;
  const endDate = search.dataFim;
  const period = search.periodo ?? "dia_inteiro";
  const city = search.cidade ?? "Toledo";
  const startTime = search.horaInicio;
  const endTime = search.horaFim;
  const acitOnly = search.acit === "1";
  const petsOnly = search.pets === "1";
  const minCapacity = search.capacidade ? Number(search.capacidade) : undefined;
  const minArea = search.areaMin ? Number(search.areaMin) : undefined;
  const maxArea = search.areaMax ? Number(search.areaMax) : undefined;
  const maxPrice = search.precoMax ? Number(search.precoMax) : undefined;
  const selectedAmenities = useMemo(
    () => parseComodidadesParam(search.comodidades ?? search.comodidade),
    [search.comodidades, search.comodidade],
  );

  const results = useMemo(() => {
    const base = filterSpaces({
      city,
      date,
      period,
      acitOnly,
      pets: petsOnly,
      ...(search.q ? { query: search.q } : {}),
      ...(minCapacity && !Number.isNaN(minCapacity)
        ? { minCapacity }
        : {}),
      ...(minArea && !Number.isNaN(minArea) ? { minArea } : {}),
      ...(maxArea && !Number.isNaN(maxArea) ? { maxArea } : {}),
      ...(maxPrice && !Number.isNaN(maxPrice) ? { maxPrice } : {}),
      ...(search.evento
        ? { eventType: search.evento as EventType }
        : {}),
      ...(search.classe
        ? { className: search.classe as SpaceClass }
        : {}),
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
          selectedAmenities.length > 0 &&
          !selectedAmenities.every((id) =>
            s.amenities.some((a) => a.itemId === id),
          )
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
    selectedAmenities,
    search.evento,
    search.classe,
  ]);

  const selectedSlug = mapSelectedSlug ?? results[0]?.slug;

  function patchSearch(patch: MapSearchPatch) {
    void navigate({
      search: (prev) => {
        const next: MapSearchParams = { ...prev };
        for (const key of Object.keys(patch) as (keyof MapSearchPatch)[]) {
          const value = patch[key];
          if (value === undefined) {
            delete next[key];
          } else {
            next[key] = value;
          }
        }
        return next;
      },
    });
  }

  function openSpacePage(slug: string) {
    setMapSelectedSlug(slug);
    openSpaceInNewTab(slug, {
      ...(date ? { data: date } : {}),
      ...(endDate ? { dataFim: endDate } : {}),
      ...(period ? { periodo: period } : {}),
      ...(startTime ? { horaInicio: startTime } : {}),
      ...(endTime ? { horaFim: endTime } : {}),
      ...(search.evento ? { evento: search.evento } : {}),
      ...(search.capacidade ? { capacidade: search.capacidade } : {}),
    });
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

  return (
    <div className="relative h-[calc(100dvh-3.75rem)] w-full overflow-hidden">
      <SpacesMap
        spaces={results}
        {...(selectedSlug ? { selectedSlug } : {})}
        onSelect={openSpacePage}
        fullBleed
        className={cn(
          "absolute inset-0 min-h-0 rounded-none border-0",
          listOpen && "md:left-[62.5%]",
        )}
      />

      <motion.div
        layout
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-3 md:p-4",
          listOpen && "md:left-[62.5%] md:justify-end",
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
                className="border border-stone-200 bg-white p-3 shadow-xl"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-xs font-semibold text-foreground">Busca</p>
                  <button
                    type="button"
                    className="p-1 text-muted-foreground hover:bg-muted"
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
                  {...(endDate ? { initialEndDate: endDate } : {})}
                  initialPeriod={period}
                  {...(startTime ? { initialStartTime: startTime } : {})}
                  {...(endTime ? { initialEndTime: endTime } : {})}
                  initialQuery={draftQuery}
                  autoFocusQuery
                  preserveSearch={{
                    ...(search.pets ? { pets: search.pets } : {}),
                    ...(search.capacidade
                      ? { capacidade: search.capacidade }
                      : {}),
                    ...(search.areaMin ? { areaMin: search.areaMin } : {}),
                    ...(search.areaMax ? { areaMax: search.areaMax } : {}),
                    ...(search.precoMax ? { precoMax: search.precoMax } : {}),
                    ...(search.modalidade
                      ? { modalidade: search.modalidade }
                      : {}),
                    ...(search.janelas ? { janelas: search.janelas } : {}),
                    ...(search.tensao ? { tensao: search.tensao } : {}),
                    ...(search.comodidade
                      ? { comodidade: search.comodidade }
                      : {}),
                    ...(search.comodidades
                      ? { comodidades: search.comodidades }
                      : {}),
                    ...(search.evento ? { evento: search.evento } : {}),
                    ...(search.classe ? { classe: search.classe } : {}),
                    ...(search.acit ? { acit: search.acit } : {}),
                    ...(search.slug ? { slug: search.slug } : {}),
                    ...(search.dataFim ? { dataFim: search.dataFim } : {}),
                    ...(search.horaInicio
                      ? { horaInicio: search.horaInicio }
                      : {}),
                    ...(search.horaFim ? { horaFim: search.horaFim } : {}),
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
                className="mx-auto flex w-full max-w-xl cursor-text items-center gap-3 border border-stone-200 bg-white px-4 py-3 shadow-[0_6px_24px_-6px_rgba(0,0,0,0.35)]"
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
            className="absolute bottom-0 left-0 right-0 z-20 flex max-h-[48dvh] md:bottom-0 md:left-0 md:right-auto md:top-0 md:max-h-none"
          >
            <div className="flex min-h-0 w-full flex-col overflow-hidden border-r border-stone-200 bg-white shadow-2xl md:w-[62.5vw]">
              <div className="shrink-0 space-y-3 border-b border-stone-200 px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-base font-semibold text-foreground">
                      <List className="size-4 shrink-0" />
                      Espaços
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {results.length} no mapa
                      {search.evento ? ` · ${search.evento}` : ""}
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

                <SearchFiltersBar
                  search={search}
                  date={date}
                  {...(endDate ? { endDate } : {})}
                  period={period}
                  {...(startTime ? { startTime } : {})}
                  {...(endTime ? { endTime } : {})}
                  onPatch={patchSearch}
                />
              </div>

              <div
                ref={listRef}
                className="grid min-h-0 flex-1 auto-rows-min content-start justify-start gap-x-2 gap-y-3 overflow-y-auto p-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 280px))",
                }}
              >
                {results.length === 0 ? (
                  <div className="col-span-full border border-dashed border-border p-6 text-center">
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
                        "transition",
                        selectedSlug === space.slug &&
                          "rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-white",
                      )}
                    >
                      <SpaceCard
                        space={space}
                        compact
                        onSelect={openSpacePage}
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
