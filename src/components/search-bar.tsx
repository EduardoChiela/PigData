import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  PILOT_CITY_LABEL,
  defaultSearchDate,
  type PeriodId,
} from "@/lib/mock-data";
import { loginAsMock } from "@/lib/mock-session";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  initialCity?: string;
  initialDate?: string;
  initialEndDate?: string;
  initialPeriod?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialQuery?: string;
  /** Extra search params to preserve (acit, pets…) */
  preserveSearch?: Record<string, string | undefined>;
  onCollapse?: () => void;
  /** Foca o campo de texto ao montar (painel expandido) */
  autoFocusQuery?: boolean;
  /**
   * stacked = lupa/texto em cima, demais campos embaixo (busca map-first)
   * inline = grade horizontal (home)
   */
  layout?: "stacked" | "inline";
};

const periodTimeRanges: Record<PeriodId, { start: string; end: string }> = {
  manha: { start: "08:00", end: "12:00" },
  tarde: { start: "13:00", end: "18:00" },
  noite: { start: "19:00", end: "23:00" },
  dia_inteiro: { start: "08:00", end: "23:00" },
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const minTimeMinutes = 6 * 60;
const maxTimeMinutes = 23 * 60;
const timeStepMinutes = 30;
const timeOptions = Array.from({ length: 48 }, (_, index) =>
  minutesToTime(index * timeStepMinutes),
);

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function timeLabel(time: string) {
  return time.replace(":", "h");
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
  const [year, month, day] = value.split("-").map(Number);
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
  return `${formatDateLabel(start)} - ${formatDateLabel(end)}`;
}

function monthLabel(value: Date) {
  return value.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export function SearchBar({
  className,
  initialCity,
  initialDate,
  initialEndDate,
  initialPeriod,
  initialStartTime,
  initialEndTime,
  initialQuery = "",
  preserveSearch,
  onCollapse,
  autoFocusQuery = false,
  layout = "inline",
}: Props) {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const queryRef = useRef<HTMLInputElement>(null);
  const initialRange = rangeFromPeriod(initialPeriod);
  const [city, setCity] = useState(initialCity ?? PILOT_CITY_LABEL);
  const lastCityRef = useRef(initialCity ?? PILOT_CITY_LABEL);
  const [date, setDate] = useState(initialDate ?? defaultSearchDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    parseLocalDate(initialDate ?? defaultSearchDate),
  );
  const [startTime, setStartTime] = useState(
    initialStartTime ?? initialRange.start,
  );
  const [endTime, setEndTime] = useState(initialEndTime ?? initialRange.end);
  const [query, setQuery] = useState(initialQuery);
  const [openTimeDropdown, setOpenTimeDropdown] = useState<
    "start" | "end" | null
  >(null);
  const selectedDay = parseLocalDate(date);
  const selectedEndDay = endDate ? parseLocalDate(endDate) : null;
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
    if (autoFocusQuery) queryRef.current?.focus();
  }, [autoFocusQuery]);

  useEffect(() => {
    if (!calendarOpen) return;
    function onPointer(e: MouseEvent) {
      const target = e.target as Node;
      const clickedCalendar = calendarRef.current?.contains(target);
      const clickedDateButton = dateButtonRef.current?.contains(target);

      if (!clickedCalendar && !clickedDateButton) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [calendarOpen]);

  useEffect(() => {
    if (!openTimeDropdown) return;
    function onPointer(e: MouseEvent) {
      const target = e.target;
      if (target instanceof Element && target.closest("[data-time-picker]")) {
        return;
      }
      setOpenTimeDropdown(null);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [openTimeDropdown]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const period = periodFromTimes(startTime, endTime);
    loginAsMock("cli-ana");
    void navigate({
      to: "/",
      search: {
        ...preserveSearch,
        cidade: city.trim() || undefined,
        data: date || undefined,
        dataFim: endDate && endDate !== date ? endDate : undefined,
        periodo: period || undefined,
        horaInicio: startTime || undefined,
        horaFim: endTime || undefined,
        q: query.trim() || undefined,
      },
    });
    onCollapse?.();
  }

  function onCityFocus() {
    if (city.trim()) {
      lastCityRef.current = city.trim();
    }
    setCity("");
  }

  function onCityBlur() {
    const nextCity = city.trim();
    if (nextCity) {
      lastCityRef.current = nextCity;
      setCity(nextCity);
      return;
    }
    setCity(lastCityRef.current);
  }

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

  function clearDateRange() {
    setDate(defaultSearchDate);
    setEndDate(undefined);
    setCalendarMonth(parseLocalDate(defaultSearchDate));
  }

  function renderTimeDropdown(kind: "start" | "end") {
    const isStart = kind === "start";
    const currentTime = isStart ? startTime : endTime;
    const currentMinutes = timeToMinutes(currentTime);
    const label = isStart ? "Horário início" : "Horário fim";

    function isDisabled(minutes: number) {
      return isStart
        ? minutes >= timeToMinutes(endTime)
        : minutes <= timeToMinutes(startTime);
    }

    function onSelect(minutes: number) {
      const nextTime = minutesToTime(minutes);
      if (isStart) {
        setStartTime(nextTime);
        if (minutes >= timeToMinutes(endTime)) {
          setEndTime(minutesToTime(minutes + timeStepMinutes));
        }
      } else {
        setEndTime(nextTime);
      }
      setOpenTimeDropdown(null);
    }

    return (
      <div className="relative" data-time-picker>
        <button
          type="button"
          className="w-full bg-transparent py-0.5 text-left text-base font-medium text-foreground outline-none"
          aria-label={label}
          aria-expanded={openTimeDropdown === kind}
          onClick={() =>
            setOpenTimeDropdown((current) => (current === kind ? null : kind))
          }
        >
          {currentTime}
        </button>

        {openTimeDropdown === kind ? (
          <div className="absolute left-0 top-[calc(100%+0.35rem)] z-[1001] max-h-56 w-32 overflow-y-auto rounded-xl border border-black/10 bg-white p-1 text-foreground shadow-xl">
            {timeOptions.map((time) => {
              const minutes = timeToMinutes(time);
              const disabled = isDisabled(minutes);

              return (
                <button
                  key={time}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    "block w-full rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition",
                    minutes === currentMinutes && "bg-muted text-foreground",
                    disabled
                      ? "cursor-not-allowed text-muted-foreground/35"
                      : "hover:bg-muted/80",
                  )}
                  onClick={() => onSelect(minutes)}
                >
                  {time}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  const sliderDetails = (
    <>
      <label className="block min-w-0 flex-1 space-y-1 px-2">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <MapPin className="size-3.5" />
          Onde
        </span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onFocus={onCityFocus}
          onBlur={onCityBlur}
          className="w-full border-0 bg-transparent text-base font-medium text-foreground outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
          aria-label="Cidade"
        />
      </label>

      <label className="block min-w-0 flex-1 space-y-1 border-t border-border/70 px-2 pt-3 md:border-l md:border-t-0 md:pt-0">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <CalendarDays className="size-3.5" />
          Data
        </span>
        <button
          ref={dateButtonRef}
          type="button"
          className="w-full text-left text-base font-medium text-foreground outline-none"
          aria-expanded={calendarOpen}
          onClick={() => {
            setCalendarMonth(parseLocalDate(date));
            setCalendarOpen((v) => !v);
          }}
        >
          {formatDateRangeLabel(date, endDate)}
        </button>
      </label>

      <label className="block min-w-0 flex-1 space-y-1 border-t border-border/70 px-2 pt-3 md:border-l md:border-t-0 md:pt-0">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Clock className="size-3.5" />
          Horário início
        </span>
        <span className="block text-base font-medium text-foreground">
          {timeLabel(startTime)}
        </span>
        <input
          type="range"
          min={minTimeMinutes}
          max={timeToMinutes(endTime) - timeStepMinutes}
          step={timeStepMinutes}
          value={timeToMinutes(startTime)}
          onChange={(e) => setStartTime(minutesToTime(Number(e.target.value)))}
          className="w-full accent-primary"
          aria-label="Horário início"
        />
      </label>

      <label className="block min-w-0 flex-1 space-y-1 border-t border-border/70 px-2 pt-3 md:border-l md:border-t-0 md:pt-0">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Clock className="size-3.5" />
          Horário fim
        </span>
        <span className="block text-base font-medium text-foreground">
          {timeLabel(endTime)}
        </span>
        <input
          type="range"
          min={timeToMinutes(startTime) + timeStepMinutes}
          max={maxTimeMinutes}
          step={timeStepMinutes}
          value={timeToMinutes(endTime)}
          onChange={(e) => setEndTime(minutesToTime(Number(e.target.value)))}
          className="w-full accent-primary"
          aria-label="Horário fim"
        />
      </label>
    </>
  );

  const details = (
    <>
      <label className="block min-w-0 flex-1 space-y-1 px-2">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <MapPin className="size-3.5" />
          Onde
        </span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onFocus={onCityFocus}
          onBlur={onCityBlur}
          className="w-full border-0 bg-transparent text-base font-medium text-foreground outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
          aria-label="Cidade"
        />
      </label>

      <label className="block min-w-0 flex-1 space-y-1 border-t border-border/70 px-2 pt-3 md:border-l md:border-t-0 md:pt-0">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <CalendarDays className="size-3.5" />
          Data
        </span>
        <button
          ref={dateButtonRef}
          type="button"
          className="w-full text-left text-base font-medium text-foreground outline-none"
          aria-expanded={calendarOpen}
          onClick={() => {
            setCalendarMonth(parseLocalDate(date));
            setCalendarOpen((v) => !v);
          }}
        >
          {formatDateRangeLabel(date, endDate)}
        </button>
      </label>

      <label className="block min-w-0 flex-1 space-y-1 border-t border-border/70 px-2 pt-3 md:border-l md:border-t-0 md:pt-0">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Clock className="size-3.5" />
          Horário início
        </span>
        {renderTimeDropdown("start")}
        <select className="hidden"
          value={timeToMinutes(startTime)}
          onChange={(e) => {
            const next = Number(e.target.value);
            setStartTime(minutesToTime(next));
            if (next >= timeToMinutes(endTime)) {
              setEndTime(minutesToTime(next + timeStepMinutes));
            }
          }}
          aria-label="Horário início"
        >
          {timeOptions.map((time) => {
            const minutes = timeToMinutes(time);
            return (
              <option
                key={time}
                value={minutes}
                disabled={minutes >= timeToMinutes(endTime)}
              >
                {time}
              </option>
            );
          })}
        </select>
      </label>

      <label className="block min-w-0 flex-1 space-y-1 border-t border-border/70 px-2 pt-3 md:border-l md:border-t-0 md:pt-0">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Clock className="size-3.5" />
          Horário fim
        </span>
        {renderTimeDropdown("end")}
        <select className="hidden"
          value={timeToMinutes(endTime)}
          onChange={(e) => setEndTime(minutesToTime(Number(e.target.value)))}
          aria-label="Horário fim"
        >
          {timeOptions.map((time) => {
            const minutes = timeToMinutes(time);
            return (
              <option
                key={time}
                value={minutes}
                disabled={minutes <= timeToMinutes(startTime)}
              >
                {time}
              </option>
            );
          })}
        </select>
      </label>
    </>
  );

  const calendarDropdown = calendarOpen ? (
    <div
      ref={calendarRef}
      className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[1000] rounded-2xl border border-border bg-white p-2 text-foreground shadow-2xl"
    >
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
          const isInRange = Boolean(endDate && iso > date && iso < endDate);
          const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();

          return (
            <button
              key={iso}
              type="button"
              className={cn(
                "h-8 rounded-lg text-sm font-medium transition hover:bg-muted",
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

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Selecionado:{" "}
          {formatDateRangeLabel(
            toIsoDate(selectedDay),
            selectedEndDay ? toIsoDate(selectedEndDay) : undefined,
          )}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={clearDateRange}
        >
          Limpar
        </Button>
      </div>
    </div>
  ) : null;

  if (layout === "stacked") {
    return (
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className={cn("relative space-y-3", className)}
      >
        <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-3">
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={queryRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar espaços"
            aria-label="Buscar espaços"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" size="sm" className="shrink-0 rounded-full px-4">
            Buscar
          </Button>
        </div>

        <div className="grid gap-1 rounded-2xl border border-stone-200 bg-white p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-end">
          {details}
          <div className="pt-2 sm:border-l sm:border-border/70 sm:pt-0 sm:pl-2">
            <Button type="submit" className="w-full sm:w-auto">
              Aplicar
            </Button>
          </div>
        </div>
        {calendarDropdown}
      </form>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={cn(
        "search-bar relative grid gap-3 rounded-2xl border border-border/60 bg-white p-3 shadow-[0_24px_60px_-28px_rgba(15,35,25,0.55)] md:grid-cols-[1.1fr_1fr_0.9fr_0.85fr_0.85fr_auto] md:items-end",
        className,
      )}
    >
      <label className="block space-y-1.5 px-2">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Search className="size-3.5" />
          Buscar
        </span>
        <input
          ref={queryRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome, bairro, comodidade…"
          className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
          aria-label="Buscar espaços"
        />
      </label>
      {details}
      <Button type="submit" size="lg" className="w-full md:w-auto">
        <Search className="size-4" />
        Buscar
      </Button>
      {calendarDropdown}
    </form>
  );
}
