import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  defaultSearchDate,
  eventTypes,
  spaceClasses,
  type PeriodId,
} from "@/lib/mock-data";
import {
  parseComodidadesParam,
  recommendedAmenityChips,
  serializeComodidadesParam,
} from "@/lib/recommended-amenities";
import type { MapSearchParams, MapSearchPatch } from "@/lib/search-params";
import { cn } from "@/lib/utils";

type Props = {
  search: MapSearchParams;
  date: string;
  endDate?: string;
  period: string;
  startTime?: string;
  endTime?: string;
  onPatch: (patch: MapSearchPatch) => void;
  className?: string;
};

type PanelId = "quando" | "preco" | "pessoas" | "filtros" | null;

const periodTimeRanges: Record<PeriodId, { start: string; end: string }> = {
  manha: { start: "08:00", end: "12:00" },
  tarde: { start: "13:00", end: "18:00" },
  noite: { start: "19:00", end: "23:00" },
  dia_inteiro: { start: "08:00", end: "23:00" },
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const timeStepMinutes = 30;
const timeOptions = Array.from({ length: 48 }, (_, index) =>
  minutesToTime(index * timeStepMinutes),
);

function timeToMinutes(time: string) {
  const parts = time.split(":").map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function periodFromTimes(start: string, end: string): PeriodId {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes <= 8 * 60 && endMinutes >= 22 * 60) return "dia_inteiro";
  if (startMinutes >= 6 * 60 && endMinutes <= 12 * 60) return "manha";
  if (startMinutes >= 12 * 60 && endMinutes <= 18 * 60) return "tarde";
  if (startMinutes >= 18 * 60 || endMinutes <= 6 * 60) return "noite";
  return "dia_inteiro";
}

function rangeFromPeriod(period?: string) {
  if (period && period in periodTimeRanges) {
    return periodTimeRanges[period as PeriodId];
  }
  return periodTimeRanges.dia_inteiro;
}

function parseLocalDate(value: string) {
  const parts = value.split("-").map(Number);
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day);
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateRangeLabel(start: string, end?: string) {
  if (!end || end === start) return formatDateLabel(start);
  return `${formatDateLabel(start)} – ${formatDateLabel(end)}`;
}

function monthLabel(value: Date) {
  return value.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function formatPriceLabel(max?: string) {
  if (!max) return "Preço";
  const n = Number(max);
  if (Number.isNaN(n)) return "Preço";
  return `Até R$ ${n.toLocaleString("pt-BR")}`;
}

function formatPeopleLabel(cap?: string) {
  if (!cap) return "Participantes";
  return `${cap}+ pessoas`;
}

function FilterTrigger({
  label,
  active,
  open,
  onClick,
}: {
  label: string;
  active?: boolean;
  open?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition",
        active || open
          ? "bg-[color-mix(in_oklab,var(--leaf)_22%,white)] text-foreground"
          : "bg-transparent text-foreground hover:bg-stone-100",
      )}
    >
      <span className="max-w-[9.5rem] truncate">{label}</span>
      <ChevronDown
        className={cn(
          "size-3.5 shrink-0 text-muted-foreground transition",
          open && "rotate-180",
        )}
      />
    </button>
  );
}

export function SearchFiltersBar({
  search,
  date,
  endDate,
  period,
  startTime,
  endTime,
  onPatch,
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openPanel, setOpenPanel] = useState<PanelId>(null);

  const initialRange = rangeFromPeriod(period);
  const [draftDate, setDraftDate] = useState(date);
  const [draftEndDate, setDraftEndDate] = useState(endDate);
  const [draftStart, setDraftStart] = useState(
    startTime ?? initialRange.start,
  );
  const [draftEnd, setDraftEnd] = useState(endTime ?? initialRange.end);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    parseLocalDate(date),
  );

  const selectedAmenities = useMemo(
    () =>
      parseComodidadesParam(search.comodidades ?? search.comodidade),
    [search.comodidades, search.comodidade],
  );

  const quickChips = useMemo(
    () => recommendedAmenityChips(search.evento),
    [search.evento],
  );

  const moreFiltersCount = [
    Boolean(search.modalidade),
    Boolean(search.evento),
    Boolean(search.classe),
    Boolean(search.areaMin),
    Boolean(search.areaMax),
    Boolean(search.janelas),
    Boolean(search.tensao),
    Boolean(search.acit),
  ].filter(Boolean).length;

  useEffect(() => {
    if (openPanel !== "quando") return;
    setDraftDate(date);
    setDraftEndDate(endDate);
    setDraftStart(startTime ?? rangeFromPeriod(period).start);
    setDraftEnd(endTime ?? rangeFromPeriod(period).end);
    setCalendarMonth(parseLocalDate(date));
  }, [openPanel, date, endDate, startTime, endTime, period]);

  useEffect(() => {
    if (!openPanel) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenPanel(null);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openPanel]);

  function togglePanel(id: Exclude<PanelId, null>) {
    setOpenPanel((current) => (current === id ? null : id));
  }

  function onDateSelect(iso: string) {
    if (!draftDate || (draftDate && draftEndDate)) {
      setDraftDate(iso);
      setDraftEndDate(undefined);
      return;
    }
    if (iso < draftDate) {
      setDraftEndDate(draftDate);
      setDraftDate(iso);
      return;
    }
    if (iso === draftDate) {
      setDraftEndDate(undefined);
      return;
    }
    setDraftEndDate(iso);
  }

  function applyQuando() {
    const nextPeriod = periodFromTimes(draftStart, draftEnd);
    onPatch({
      data: draftDate || undefined,
      dataFim:
        draftEndDate && draftEndDate !== draftDate
          ? draftEndDate
          : undefined,
      periodo: nextPeriod,
      horaInicio: draftStart || undefined,
      horaFim: draftEnd || undefined,
      modalidade:
        nextPeriod === "dia_inteiro"
          ? search.modalidade === "hora"
            ? undefined
            : search.modalidade
          : search.modalidade === "dia"
            ? undefined
            : search.modalidade,
    });
    setOpenPanel(null);
  }

  function toggleAmenity(itemId: string) {
    const next = selectedAmenities.includes(itemId)
      ? selectedAmenities.filter((id) => id !== itemId)
      : [...selectedAmenities, itemId];
    onPatch({
      comodidade: undefined,
      comodidades: serializeComodidadesParam(next),
    });
  }

  function clearExtraFilters() {
    onPatch({
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
      comodidades: undefined,
      evento: undefined,
      classe: undefined,
    });
    setOpenPanel(null);
  }

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1,
    );
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [calendarMonth]);

  const panelClass =
    "absolute left-0 top-[calc(100%+0.35rem)] z-[120] w-[min(22rem,calc(100vw-2rem))] border border-stone-300 bg-white p-3 text-foreground shadow-xl";

  return (
    <div ref={rootRef} className={cn("space-y-2.5", className)}>
      <div className="relative flex flex-wrap items-center gap-2">
        <div className="relative">
          <FilterTrigger
            label={formatDateRangeLabel(date, endDate)}
            active={Boolean(date)}
            open={openPanel === "quando"}
            onClick={() => togglePanel("quando")}
          />
          {openPanel === "quando" ? (
            <div className={panelClass}>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <CalendarDays className="size-4" />
                Quando
              </div>

              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Mês anterior"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <p className="text-sm font-semibold capitalize">
                  {monthLabel(calendarMonth)}
                </p>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Próximo mês"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
                {weekDays.map((day) => (
                  <span key={day} className="py-0.5">
                    {day}
                  </span>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const iso = toIsoDate(day);
                  const isStart = iso === draftDate;
                  const isEnd = iso === draftEndDate;
                  const isInRange = Boolean(
                    draftEndDate && iso > draftDate && iso < draftEndDate,
                  );
                  const isCurrentMonth =
                    day.getMonth() === calendarMonth.getMonth();

                  return (
                    <button
                      key={iso}
                      type="button"
                      className={cn(
                        "h-8 text-sm font-medium transition hover:bg-muted",
                        !isCurrentMonth && "text-muted-foreground/45",
                        isInRange && "bg-[var(--leaf)]/20 text-foreground",
                        (isStart || isEnd) &&
                          "bg-primary text-primary-foreground hover:bg-primary",
                      )}
                      onClick={() => onDateSelect(iso)}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">
                  <span className="block">Início</span>
                  <select
                    className="h-9 w-full border border-stone-300 bg-white px-2 text-sm font-medium text-foreground"
                    value={draftStart}
                    onChange={(e) => {
                      const next = e.target.value;
                      setDraftStart(next);
                      if (timeToMinutes(next) >= timeToMinutes(draftEnd)) {
                        setDraftEnd(
                          minutesToTime(
                            timeToMinutes(next) + timeStepMinutes,
                          ),
                        );
                      }
                    }}
                  >
                    {timeOptions.map((time) => (
                      <option
                        key={time}
                        value={time}
                        disabled={
                          timeToMinutes(time) >= timeToMinutes(draftEnd)
                        }
                      >
                        {time}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">
                  <span className="block">Fim</span>
                  <select
                    className="h-9 w-full border border-stone-300 bg-white px-2 text-sm font-medium text-foreground"
                    value={draftEnd}
                    onChange={(e) => setDraftEnd(e.target.value)}
                  >
                    {timeOptions.map((time) => (
                      <option
                        key={time}
                        value={time}
                        disabled={
                          timeToMinutes(time) <= timeToMinutes(draftStart)
                        }
                      >
                        {time}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => {
                    setDraftDate(defaultSearchDate);
                    setDraftEndDate(undefined);
                    setDraftStart(periodTimeRanges.dia_inteiro.start);
                    setDraftEnd(periodTimeRanges.dia_inteiro.end);
                    setCalendarMonth(parseLocalDate(defaultSearchDate));
                  }}
                >
                  Limpar
                </Button>
                <Button type="button" size="sm" onClick={applyQuando}>
                  Aplicar
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <FilterTrigger
            label={formatPriceLabel(search.precoMax)}
            active={Boolean(search.precoMax)}
            open={openPanel === "preco"}
            onClick={() => togglePanel("preco")}
          />
          {openPanel === "preco" ? (
            <div className={panelClass}>
              <p className="mb-2 text-sm font-semibold">Preço máximo</p>
              <div className="grid gap-1.5">
                {[
                  { value: "", label: "Qualquer" },
                  { value: "2500", label: "Até R$ 2.500" },
                  { value: "4000", label: "Até R$ 4.000" },
                  { value: "6000", label: "Até R$ 6.000" },
                  { value: "10000", label: "Até R$ 10.000" },
                ].map((option) => {
                  const active = (search.precoMax ?? "") === option.value;
                  return (
                    <button
                      key={option.value || "any"}
                      type="button"
                      className={cn(
                        "h-9 border px-3 text-left text-sm transition hover:bg-muted",
                        active
                          ? "border-[var(--forest)] bg-[color-mix(in_oklab,var(--leaf)_18%,white)] font-semibold"
                          : "border-stone-200",
                      )}
                      onClick={() => {
                        onPatch({
                          precoMax: option.value || undefined,
                        });
                        setOpenPanel(null);
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <FilterTrigger
            label={formatPeopleLabel(search.capacidade)}
            active={Boolean(search.capacidade)}
            open={openPanel === "pessoas"}
            onClick={() => togglePanel("pessoas")}
          />
          {openPanel === "pessoas" ? (
            <div className={panelClass}>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <Users className="size-4" />
                Participantes
              </div>
              <div className="grid gap-1.5">
                {[
                  { value: "", label: "Qualquer" },
                  { value: "30", label: "30+" },
                  { value: "50", label: "50+" },
                  { value: "100", label: "100+" },
                  { value: "200", label: "200+" },
                  { value: "300", label: "300+" },
                ].map((option) => {
                  const active = (search.capacidade ?? "") === option.value;
                  return (
                    <button
                      key={option.value || "any"}
                      type="button"
                      className={cn(
                        "h-9 border px-3 text-left text-sm transition hover:bg-muted",
                        active
                          ? "border-[var(--forest)] bg-[color-mix(in_oklab,var(--leaf)_18%,white)] font-semibold"
                          : "border-stone-200",
                      )}
                      onClick={() => {
                        onPatch({
                          capacidade: option.value || undefined,
                        });
                        setOpenPanel(null);
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <FilterTrigger
            label={
              moreFiltersCount > 0
                ? `Filtros (${moreFiltersCount})`
                : "Filtros"
            }
            active={moreFiltersCount > 0}
            open={openPanel === "filtros"}
            onClick={() => togglePanel("filtros")}
          />
          {openPanel === "filtros" ? (
            <div
              className={cn(
                panelClass,
                "w-[min(24rem,calc(100vw-2rem))] space-y-3",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <SlidersHorizontal className="size-4" />
                  Mais filtros
                </p>
                <button
                  type="button"
                  className="p-1 text-muted-foreground hover:bg-muted"
                  aria-label="Fechar filtros"
                  onClick={() => setOpenPanel(null)}
                >
                  <X className="size-4" />
                </button>
              </div>

              <label className="block space-y-1 text-xs font-semibold text-muted-foreground">
                <span>Tipo de evento</span>
                <select
                  className="h-9 w-full border border-stone-300 bg-white px-2 text-sm font-medium text-foreground"
                  value={search.evento ?? ""}
                  onChange={(e) =>
                    onPatch({ evento: e.target.value || undefined })
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

              <label className="block space-y-1 text-xs font-semibold text-muted-foreground">
                <span>Classe do espaço</span>
                <select
                  className="h-9 w-full border border-stone-300 bg-white px-2 text-sm font-medium text-foreground"
                  value={search.classe ?? ""}
                  onChange={(e) =>
                    onPatch({ classe: e.target.value || undefined })
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

              <label className="block space-y-1 text-xs font-semibold text-muted-foreground">
                <span>Modalidade</span>
                <select
                  className="h-9 w-full border border-stone-300 bg-white px-2 text-sm font-medium text-foreground"
                  value={search.modalidade ?? ""}
                  onChange={(e) =>
                    onPatch({ modalidade: e.target.value || undefined })
                  }
                >
                  <option value="">Todas</option>
                  <option value="dia">Dia / período</option>
                  <option value="hora">Horário</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1 text-xs font-semibold text-muted-foreground">
                  <span>Área mín.</span>
                  <select
                    className="h-9 w-full border border-stone-300 bg-white px-2 text-sm font-medium text-foreground"
                    value={search.areaMin ?? ""}
                    onChange={(e) =>
                      onPatch({ areaMin: e.target.value || undefined })
                    }
                  >
                    <option value="">Qualquer</option>
                    <option value="100">100 m²+</option>
                    <option value="200">200 m²+</option>
                    <option value="500">500 m²+</option>
                  </select>
                </label>
                <label className="block space-y-1 text-xs font-semibold text-muted-foreground">
                  <span>Área máx.</span>
                  <select
                    className="h-9 w-full border border-stone-300 bg-white px-2 text-sm font-medium text-foreground"
                    value={search.areaMax ?? ""}
                    onChange={(e) =>
                      onPatch({ areaMax: e.target.value || undefined })
                    }
                  >
                    <option value="">Qualquer</option>
                    <option value="150">150 m²</option>
                    <option value="300">300 m²</option>
                    <option value="600">600 m²</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1 text-xs font-semibold text-muted-foreground">
                <span>Tensão</span>
                <select
                  className="h-9 w-full border border-stone-300 bg-white px-2 text-sm font-medium text-foreground"
                  value={search.tensao ?? ""}
                  onChange={(e) =>
                    onPatch({ tensao: e.target.value || undefined })
                  }
                >
                  <option value="">Todas</option>
                  <option value="127">127 V</option>
                  <option value="220">220 V</option>
                </select>
              </label>

              <div className="flex flex-wrap gap-3 pt-1 text-sm font-medium">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-[var(--forest)]"
                    checked={search.janelas === "1"}
                    onChange={(e) =>
                      onPatch({
                        janelas: e.target.checked ? "1" : undefined,
                      })
                    }
                  />
                  Com janelas
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-[var(--forest)]"
                    checked={search.acit === "1"}
                    onChange={(e) =>
                      onPatch({
                        acit: e.target.checked ? "1" : undefined,
                      })
                    }
                  />
                  Só verificados ACIT
                </label>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-stone-200 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={clearExtraFilters}
                >
                  Limpar tudo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setOpenPanel(null)}
                >
                  Ver resultados
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="-mx-0.5 flex gap-2 overflow-x-auto pb-0.5">
        {quickChips.map((chip) => {
          const active =
            chip.kind === "pets"
              ? search.pets === "1"
              : selectedAmenities.includes(chip.id);

          return (
            <button
              key={chip.id}
              type="button"
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-[var(--forest)] bg-[color-mix(in_oklab,var(--leaf)_22%,white)] text-foreground"
                  : "border-stone-300 bg-white text-foreground hover:border-stone-400",
              )}
              onClick={() => {
                if (chip.kind === "pets") {
                  onPatch({
                    pets: search.pets === "1" ? undefined : "1",
                  });
                  return;
                }
                toggleAmenity(chip.id);
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
