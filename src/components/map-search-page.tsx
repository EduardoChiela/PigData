import { getRouteApi, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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

type FilterDropdownOption = {
  value: string;
  label: string;
};

function FilterDropdown({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: FilterDropdownOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className="flex h-8 w-full items-center justify-between gap-2 rounded-full border border-stone-200 bg-white px-3 text-left text-xs font-medium text-foreground outline-none transition hover:border-stone-300 focus:border-stone-300 focus:shadow-[0_0_0_3px_rgba(120,113,108,0.22)]"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 truncate">{selected?.label}</span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </button>
      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+0.25rem)] z-[200] max-h-64 min-w-full overflow-auto rounded-lg border border-stone-300 bg-white py-1 text-xs text-foreground shadow-xl"
          role="listbox"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                className={cn(
                  "block w-full whitespace-nowrap px-3 py-1.5 text-left hover:bg-gray-200",
                  active && "bg-gray-200 font-semibold",
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

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

  const filterLabelClass =
    "min-w-[6.75rem] shrink-0 space-y-1 text-[0.66rem] font-medium text-muted-foreground/85";
  const filterCheckClass =
    "flex h-8 shrink-0 items-center gap-2 self-end rounded-full border border-stone-200/55 bg-white/45 px-3 text-xs font-medium text-foreground/80 transition hover:border-stone-300 hover:bg-white/75";
  const filterGroupClass =
    "flex shrink-0 items-end gap-2 rounded-2xl border border-stone-200/30 bg-white/15 px-2.5 py-2";
  const filterGroupTitleClass =
    "self-center whitespace-nowrap px-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60";

  const filterControls = (
    <div className="flex w-full min-w-0 items-center gap-2 overflow-visible rounded-2xl border border-stone-200/35 bg-white/62 px-2.5 py-1.5 text-foreground shadow-none backdrop-blur">
      <div className={filterGroupClass}>
        <span className={filterGroupTitleClass}>Uso</span>
        <label className="min-w-[7.5rem] shrink-0 space-y-1 text-[0.66rem] font-medium text-muted-foreground/85">
          <span className="block px-1">Modalidade</span>
          <FilterDropdown
            value={search.modalidade ?? ""}
            options={[
              { value: "", label: "Todas" },
              { value: "dia", label: "Dia/periodo" },
              { value: "hora", label: "Horario" },
            ]}
            onChange={(value) => patchSearch({ modalidade: value || undefined })}
          />
        </label>
        <label className="min-w-[9rem] shrink-0 space-y-1 text-[0.66rem] font-medium text-muted-foreground/85">
          <span className="block px-1">Evento</span>
          <FilterDropdown
            value={search.evento ?? ""}
            options={[
              { value: "", label: "Todos" },
              ...eventTypes.map((t) => ({ value: t, label: t })),
            ]}
            onChange={(value) => patchSearch({ evento: value || undefined })}
          />
        </label>
        <label className="min-w-[8rem] shrink-0 space-y-1 text-[0.66rem] font-medium text-muted-foreground/85">
          <span className="block px-1">Classe</span>
          <FilterDropdown
            value={search.classe ?? ""}
            options={[
              { value: "", label: "Todas" },
              ...spaceClasses.map((c) => ({ value: c, label: c })),
            ]}
            onChange={(value) => patchSearch({ classe: value || undefined })}
          />
        </label>
      </div>

      <div className={filterGroupClass}>
        <span className={filterGroupTitleClass}>Porte</span>
        <label className={filterLabelClass}>
          <span className="block px-1">Capacidade</span>
          <FilterDropdown
            value={search.capacidade ?? ""}
            options={[
              { value: "", label: "Qualquer" },
              { value: "50", label: "50+" },
              { value: "100", label: "100+" },
              { value: "200", label: "200+" },
              { value: "300", label: "300+" },
            ]}
            onChange={(value) => patchSearch({ capacidade: value || undefined })}
          />
        </label>
        <label className={filterLabelClass}>
          <span className="block px-1">Preco max.</span>
          <FilterDropdown
            value={search.precoMax ?? ""}
            options={[
              { value: "", label: "Qualquer" },
              { value: "2500", label: "R$ 2.500" },
              { value: "4000", label: "R$ 4.000" },
              { value: "6000", label: "R$ 6.000" },
            ]}
            onChange={(value) => patchSearch({ precoMax: value || undefined })}
          />
        </label>
        <label className="min-w-[6.5rem] shrink-0 space-y-1 text-[0.66rem] font-medium text-muted-foreground/85">
          <span className="block px-1">Area min.</span>
          <FilterDropdown
            value={search.areaMin ?? ""}
            options={[
              { value: "", label: "Qualquer" },
              { value: "100", label: "100 m2+" },
              { value: "200", label: "200 m2+" },
              { value: "500", label: "500 m2+" },
            ]}
            onChange={(value) => patchSearch({ areaMin: value || undefined })}
          />
        </label>
        <label className="min-w-[6.5rem] shrink-0 space-y-1 text-[0.66rem] font-medium text-muted-foreground/85">
          <span className="block px-1">Area max.</span>
          <FilterDropdown
            value={search.areaMax ?? ""}
            options={[
              { value: "", label: "Qualquer" },
              { value: "150", label: "150 m2" },
              { value: "300", label: "300 m2" },
              { value: "600", label: "600 m2" },
            ]}
            onChange={(value) => patchSearch({ areaMax: value || undefined })}
          />
        </label>
      </div>

      <div className={filterGroupClass}>
        <span className={filterGroupTitleClass}>Estrutura</span>
        <label className="min-w-[11rem] shrink-0 space-y-1 text-[0.66rem] font-medium text-muted-foreground/85">
          <span className="block px-1">Comodidade</span>
          <FilterDropdown
            value={search.comodidade ?? ""}
            options={[
              { value: "", label: "Todas" },
              ...amenityCatalog.map((a) => ({
                value: a.itemId,
                label: a.name,
              })),
            ]}
            onChange={(value) => patchSearch({ comodidade: value || undefined })}
          />
        </label>
        <label className="min-w-[6rem] shrink-0 space-y-1 text-[0.66rem] font-medium text-muted-foreground/85">
          <span className="block px-1">Tensao</span>
          <FilterDropdown
            value={search.tensao ?? ""}
            options={[
              { value: "", label: "Todas" },
              { value: "127", label: "127 V" },
              { value: "220", label: "220 V" },
            ]}
            onChange={(value) => patchSearch({ tensao: value || undefined })}
          />
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
          className="h-8 shrink-0 self-end rounded-full border-stone-200/60 bg-white/45 px-3 text-xs font-medium text-foreground/80 shadow-none hover:bg-white/75"
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
            className="pointer-events-none absolute inset-x-0 top-0 z-[80] hidden h-20 p-3 md:block md:px-4 md:py-0"
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
        initialEndDate={endDate}
        initialPeriod={period}
        initialStartTime={startTime}
        initialEndTime={endTime}
        initialEventType={search.evento}
        initialGuests={
          minCapacity && !Number.isNaN(minCapacity) ? minCapacity : undefined
        }
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
