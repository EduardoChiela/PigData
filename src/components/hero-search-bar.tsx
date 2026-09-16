import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  PILOT_CITY_LABEL,
  defaultSearchDate,
  eventTypes,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const CITY_SUGGESTIONS = [
  PILOT_CITY_LABEL,
  "Cascavel - PR",
  "Marechal Cândido Rondon - PR",
  "Foz do Iguaçu - PR",
] as const;

const ACTIVITY_SUGGESTIONS = [
  ...eventTypes,
  "Reunião corporativa",
  "Ensaio fotográfico",
] as const;

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

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

/** Mapeia sugestão livre → EventType da busca, quando houver match. */
function eventParamFromActivity(activity: string): string | undefined {
  const trimmed = activity.trim();
  if (!trimmed) return undefined;
  const exact = eventTypes.find(
    (t) => t.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) return exact;
  if (/reuni[aã]o|corporativ/i.test(trimmed)) return "Corporativo";
  if (/foto|ensaio/i.test(trimmed)) return "Aniversário";
  return undefined;
}

type PanelId = "activity" | "city" | "date" | null;

type Props = {
  className?: string;
};

/**
 * Barra da landing (visitante): Atividade → Cidade → Data, no padrão Peerspace.
 * Não força login — só navega para o mapa com os filtros.
 */
export function HeroSearchBar({ className }: Props) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLFormElement>(null);
  const [activity, setActivity] = useState("");
  const [city, setCity] = useState(PILOT_CITY_LABEL);
  const [date, setDate] = useState(defaultSearchDate);
  const [endDate, setEndDate] = useState<string | undefined>();
  const [calendarMonth, setCalendarMonth] = useState(() =>
    parseLocalDate(defaultSearchDate),
  );
  const [openPanel, setOpenPanel] = useState<PanelId>(null);

  const filteredActivities = useMemo(() => {
    const q = activity.trim().toLowerCase();
    if (!q) return [...ACTIVITY_SUGGESTIONS];
    return ACTIVITY_SUGGESTIONS.filter((a) => a.toLowerCase().includes(q));
  }, [activity]);

  const filteredCities = useMemo(() => {
    const q = city.trim().toLowerCase();
    if (!q) return [...CITY_SUGGESTIONS];
    return CITY_SUGGESTIONS.filter((c) => c.toLowerCase().includes(q));
  }, [city]);

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

  function onDateSelect(iso: string) {
    if (!date || (date && endDate)) {
      setDate(iso);
      setEndDate(undefined);
      return;
    }
    if (iso < date) {
      setEndDate(date);
      setDate(iso);
      return;
    }
    if (iso === date) {
      setEndDate(undefined);
      return;
    }
    setEndDate(iso);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const evento = eventParamFromActivity(activity);
    void navigate({
      to: "/",
      search: {
        ...(city.trim() ? { cidade: city.trim() } : {}),
        ...(date ? { data: date } : {}),
        ...(endDate && endDate !== date ? { dataFim: endDate } : {}),
        periodo: "dia_inteiro",
        ...(evento ? { evento } : {}),
        ...(activity.trim() && !evento ? { q: activity.trim() } : {}),
      },
    });
  }

  const panelClass =
    "absolute left-0 top-[calc(100%+0.5rem)] z-[100] w-[min(22rem,calc(100vw-2rem))] border border-stone-200 bg-white p-2 text-foreground shadow-xl";

  return (
    <form
      ref={rootRef}
      onSubmit={onSubmit}
      className={cn(
        "relative grid gap-0 overflow-visible rounded-2xl bg-white shadow-[0_28px_70px_-24px_rgba(0,0,0,0.45)] md:grid-cols-[1.5fr_1.1fr_1.1fr_auto]",
        className,
      )}
    >
      <div className="relative border-b border-stone-200 px-5 py-4 md:border-b-0 md:border-r">
        <label className="block space-y-1.5">
          <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="size-3.5" />
            O que está planejando?
          </span>
          <input
            value={activity}
            onChange={(e) => {
              setActivity(e.target.value);
              setOpenPanel("activity");
            }}
            onFocus={() => setOpenPanel("activity")}
            placeholder="Aniversário, casamento, reunião…"
            aria-label="O que está planejando?"
            aria-expanded={openPanel === "activity"}
            className="w-full bg-transparent text-lg font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </label>
        {openPanel === "activity" ? (
          <div className={panelClass} role="listbox">
            <p className="px-2.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Sugestões
            </p>
            {filteredActivities.length === 0 ? (
              <p className="px-2.5 py-2 text-sm text-muted-foreground">
                Nenhuma sugestão. Continue digitando.
              </p>
            ) : (
              filteredActivities.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="option"
                  className="block w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium transition hover:bg-muted"
                  onClick={() => {
                    setActivity(item);
                    setOpenPanel(null);
                  }}
                >
                  {item}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      <div className="relative border-b border-stone-200 px-5 py-4 md:border-b-0 md:border-r">
        <label className="block space-y-1.5">
          <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <MapPin className="size-3.5" />
            Onde
          </span>
          <input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setOpenPanel("city");
            }}
            onFocus={() => {
              setOpenPanel("city");
            }}
            placeholder="Cidade"
            aria-label="Cidade"
            aria-expanded={openPanel === "city"}
            className="w-full bg-transparent text-lg font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </label>
        {openPanel === "city" ? (
          <div className={panelClass} role="listbox">
            <p className="px-2.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Cidades
            </p>
            {filteredCities.map((item) => (
              <button
                key={item}
                type="button"
                role="option"
                className={cn(
                  "block w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium transition hover:bg-muted",
                  item === PILOT_CITY_LABEL && "font-semibold",
                )}
                onClick={() => {
                  setCity(item);
                  setOpenPanel(null);
                }}
              >
                {item}
                {item === PILOT_CITY_LABEL ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    piloto
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative border-b border-stone-200 px-5 py-4 md:border-b-0 md:border-r">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <CalendarDays className="size-3.5" />
          Quando
        </span>
        <button
          type="button"
          className="mt-1.5 w-full text-left text-lg font-medium text-foreground outline-none"
          aria-expanded={openPanel === "date"}
          onClick={() => {
            setCalendarMonth(parseLocalDate(date));
            setOpenPanel((p) => (p === "date" ? null : "date"));
          }}
        >
          {formatDateRangeLabel(date, endDate)}
        </button>
        {openPanel === "date" ? (
          <div className={cn(panelClass, "w-[min(20rem,calc(100vw-2rem))] p-3")}>
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
                const isStart = iso === date;
                const isEnd = iso === endDate;
                const isInRange = Boolean(
                  endDate && iso > date && iso < endDate,
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
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setOpenPanel(null)}
              >
                Pronto
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center px-4 py-4 md:pl-3">
        <Button type="submit" size="lg" className="h-12 w-full px-8 text-base font-semibold md:w-auto">
          <Search className="size-4" />
          Buscar
        </Button>
      </div>
    </form>
  );
}
